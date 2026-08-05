# Coding Agent 配置（Claude Code + DeepSeek V4 Flash）

> 配置日期：2026-08-05  
> 执行者：CTO 林知衡  
> 记录者：架构师  
> 前置条件：bootstrap 完成，Gateway 本机运行，macOS Keychain 可用

## 方案

使用 Claude Code CLI 作为 coding agent 后端，通过 Anthropic 兼容端点接入 DeepSeek V4 Flash 模型。API Key 存储在 macOS Keychain 中，通过 wrapper 脚本注入，配置文件不含明文密钥。

| 项目 | 值 |
|------|-----|
| Claude Code CLI | 2.1.71 |
| 模型 | DeepSeek V4 Flash（`deepseek-chat`） |
| API 端点 | `https://api.deepseek.com/anthropic`（Anthropic 兼容） |
| API Key 存储 | macOS Keychain，service=`deepseek_api` |
| Keychain 解析器 | `~/.openclaw/bin/openclaw-keychain-deepseek` |
| Claude Code wrapper | `~/.local/bin/claude` |
| Claude Code 真二进制 | `~/.local/bin/claude-real` |
| OpenClaw 技能 | `skills.entries.coding-agent.enabled: true` |
| 后端限制 | 仅 Claude Code（codex 和 opencode 已卸载） |

## 组件说明

### Keychain 解析器

路径：`~/.openclaw/bin/openclaw-keychain-deepseek`

```sh
#!/bin/sh

account=$(/usr/bin/id -un)
exec /usr/bin/security find-generic-password \
  -a "$account" \
  -s "deepseek_api" \
  -w
```

使用 `/usr/bin/id -un` 推导账户，不依赖 `$USER` 环境变量。OpenClaw 的 exec Secret provider 使用净化环境，`passEnv` 只传递 `HOME`；LaunchAgent 下 `$USER` 为空时 `security` 会报退出码 `44`。

### Claude Code Wrapper

路径：`~/.local/bin/claude`

```sh
#!/bin/sh

# Read DeepSeek API key from macOS Keychain
DEEPSEEK_KEY=$(/usr/bin/security find-generic-password \
  -a "$(/usr/bin/id -un)" \
  -s "deepseek_api" \
  -w 2>/dev/null)

if [ -z "$DEEPSEEK_KEY" ]; then
  echo "ERROR: Failed to read deepseek_api from Keychain" >&2
  exit 1
fi

export ANTHROPIC_AUTH_TOKEN="$DEEPSEEK_KEY"
exec ~/.local/bin/claude-real "$@"
```

Wrapper 从 Keychain 读取 API Key，注入 `ANTHROPIC_AUTH_TOKEN` 环境变量，然后 exec 真正的 Claude Code 二进制。调用者无需感知 Keychain。

### Claude Code Settings

路径：`~/.claude/settings.json`

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.deepseek.com/anthropic",
    "API_TIMEOUT_MS": "3000000",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": 1,
    "ANTHROPIC_MODEL": "deepseek-chat",
    "ANTHROPIC_SMALL_FAST_MODEL": "deepseek-chat",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "deepseek-chat",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "deepseek-chat",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "deepseek-chat"
  },
  "effortLevel": "high",
  "alwaysThinkingEnabled": true
}
```

所有模型槽位统一指向 `deepseek-chat`，避免 Claude Code 回退到不存在的默认模型。`effortLevel: high` 和 `alwaysThinkingEnabled: true` 启用深度推理。无明文 API Key。

### OpenClaw 技能配置

在 `~/.openclaw/openclaw.json` 中：

```json
{
  "skills": {
    "entries": {
      "coding-agent": {
        "enabled": true
      }
    }
  }
}
```

coding-agent 技能随 OpenClaw 捆绑，无需额外安装。当前只保留 Claude Code 后端（codex 和 opencode 已卸载），技能只能用 Claude Code。

## 操作步骤

### 1. 存储 API Key

```bash
security add-generic-password \
  -a "$USER" \
  -s "deepseek_api" \
  -U \
  -w
```

### 2. 安装 Keychain 解析器

```bash
install -m 700 \
  <path-to-script> \
  ~/.openclaw/bin/openclaw-keychain-deepseek
```

### 3. 安装 Claude Code

```bash
# 安装 Claude Code CLI（版本 2.1.71）
# 真二进制放在 ~/.local/bin/claude-real
```

### 4. 安装 Wrapper

```bash
install -m 700 \
  <path-to-wrapper> \
  ~/.local/bin/claude
```

### 5. 配置 settings.json

写入 `~/.claude/settings.json`（内容见上方组件说明）。

### 6. 启用 OpenClaw 技能

在 `~/.openclaw/openclaw.json` 中添加 `skills.entries.coding-agent.enabled: true`。

### 7. 验证

```bash
# 净化环境测试 Keychain 解析器
env -i HOME="$HOME" PATH=/usr/bin:/bin \
  ~/.openclaw/bin/openclaw-keychain-deepseek >/dev/null
echo $?

# 冒烟测试
claude --print "echo hello" 2>&1
```

冒烟测试通过标准：`claude --print` 成功执行，能创建测试文件。

## 注意事项

- **凭据安全**：API Key 只存在 Keychain 中，wrapper 和 settings.json 均不含明文。禁止将 Key 写入配置文件或记忆文件。
- **单一后端**：codex 和 opencode 已卸载，coding-agent 技能只能用 Claude Code。
- **Keychain 解析器不依赖 `$USER`**：必须用 `/usr/bin/id -un` 推导账户，原因同 Tavily 解析器。
- **模型统一**：settings.json 中所有模型槽位都指向 `deepseek-chat`，避免回退到不存在的模型。
- **路径参数化**：文档中 `~/.openclaw/` 和 `~/.local/bin/` 在实际机器上展开为 `/Users/<macos-user>/.openclaw/` 和 `/Users/<macos-user>/.local/bin/`。

## 配置参考

- OpenClaw 文档：`docs/skills/coding-agent/SKILL.md`
- DeepSeek API 文档：`https://api-docs.deepseek.com/`
- 相关治理文档：[`skills-install.md`](skills-install.md)
