# 技能安装

> 配置日期：2026-08-04  
> 执行者：架构师

## 已安装技能

### self-improving-agent 4.0.1

- **来源**：ClawHub `@pskoett/self-improving-agent`
- **功能**：记录教训、错误、纠正，形成持续改进闭环
- **安装方式**：`openclaw skills install @pskoett/self-improving-agent`

与项目 `skills/self-improvement/` 本地版本（4.0.0）的差异：
- ClawHub 4.0.1 是 OpenClaw 专用版，移除了多平台支持
- 多了 hooks（session-end 错误扫描 + bootstrap 提醒）
- 多了 assets 模板和 CHANGELOG
- 少了 `learnings.py` CLI 管理工具（4.0.0 起移除）

### tavily 1.0.0

- **来源**：ClawHub `tavily`（bert-builder 出品）
- **功能**：AI 优化的 Web 搜索，支持搜索/新闻/域名过滤/内容提取
- **安装方式**：`openclaw skills install tavily`

## Tavily API Key 配置

### 1. 存入 Keychain

```bash
security add-generic-password \
  -a "$USER" \
  -s "tavily_api_key" \
  -U \
  -w
```

### 2. 安装 Keychain 解析器

```bash
install -m 700 \
  bootstrap/bin/openclaw-keychain-tavily \
  ~/.openclaw/bin/openclaw-keychain-tavily
```

解析器脚本内容：

```sh
#!/bin/sh

account=$(/usr/bin/id -un)
exec /usr/bin/security find-generic-password \
  -a "$account" \
  -s "tavily_api_key" \
  -w
```

不能在解析器中使用 `$USER`。OpenClaw 的 exec Secret provider 使用净化环境，
而本配置的 `passEnv` 只传递 `HOME`；LaunchAgent 下 `$USER` 为空时，`security`
会以退出码 `44` 报告无法找到 Keychain 条目，并导致 Gateway 启动失败。

### 3. 配置 SecretRef

在 `~/.openclaw/openclaw.json` 中添加：

```json
{
  "secrets": {
    "providers": {
      "macos_keychain_tavily": {
        "source": "exec",
        "command": "/Users/<macos-user>/.openclaw/bin/openclaw-keychain-tavily",
        "passEnv": ["HOME"],
        "jsonOnly": false
      }
    }
  },
  "skills": {
    "entries": {
      "tavily": {
        "enabled": true,
        "apiKey": {
          "source": "exec",
          "provider": "macos_keychain_tavily",
          "id": "value"
        }
      }
    }
  }
}
```

### 4. 安装 Python 依赖

```bash
pip3 install tavily-python
```

### 5. 验证

```bash
# 在 LaunchAgent 类似的净化环境中测试，不输出 Key
env -i HOME="$HOME" PATH=/usr/bin:/bin \
  ~/.openclaw/bin/openclaw-keychain-tavily >/dev/null
echo $?

# 测试搜索
TAVILY_API_KEY=$(~/.openclaw/bin/openclaw-keychain-tavily) \
  python3 ~/.openclaw/workspace/skills/tavily/scripts/tavily_search.py "test query" --max-results 1
```

### 6. 重启 Gateway

```bash
openclaw gateway restart
```

## 注意事项

- Tavily skill 通过 `TAVILY_API_KEY` 环境变量或 `--api-key` 参数读取密钥。
- OpenClaw 通过 `skills.entries.tavily.apiKey` SecretRef 自动注入。
- API Key 禁止明文写入配置文件或记忆文件。
- 2026-08-04 启动故障及修复记录见
  [`incidents/2026-08-04-tavily-secretref-startup.md`](incidents/2026-08-04-tavily-secretref-startup.md)。
