# 基础初始化

`bootstrap/` 保存将治理仓库部署为可运行 OpenClaw 龙虾池所需的脱敏配置、辅助脚本和初始化台账。这里不保存 API Key、Gateway token、Cookie 或其他凭据。

## 目录内容

| 路径 | 作用 |
|------|------|
| `openclaw.example.json` | 当前部署的脱敏基础配置模板 |
| `bin/openclaw-keychain-volcengine-agent` | 从 macOS Keychain 读取火山 Agent Plan Key |
| `bin/openclaw-keychain-openclaw-gateway` | 从 macOS Keychain 读取 Gateway token |
| `bin/openclaw-keychain-tavily` | 从 macOS Keychain 读取 Tavily API Key，供基础施工阶段安装 |
| `INITIALIZATION_LOG.md` | 本次龙虾池初始化的完成项、验证结果和待办 |

模型配置的原理和字段说明见 [`../docs/volcengine-agent-plan.md`](../docs/volcengine-agent-plan.md)。

## 初始化顺序

### 1. 写入 Keychain

火山 Agent Plan API Key：

```bash
security add-generic-password \
  -a "$USER" \
  -s "volcengine_agent" \
  -U \
  -w
```

Gateway token：

```bash
security add-generic-password \
  -a "$USER" \
  -s "openclaw_gateway_token" \
  -U \
  -w
```

两条命令都会交互式提示输入和确认。Gateway token 应使用密码管理器生成的高强度随机值。不要把凭据直接写在命令参数中。

### 2. 安装 Keychain 解析器

```bash
install -d -m 700 ~/.openclaw/bin
install -m 700 \
  bootstrap/bin/openclaw-keychain-volcengine-agent \
  ~/.openclaw/bin/openclaw-keychain-volcengine-agent
install -m 700 \
  bootstrap/bin/openclaw-keychain-openclaw-gateway \
  ~/.openclaw/bin/openclaw-keychain-openclaw-gateway
```

OpenClaw 的 exec SecretRef 要求解析命令由当前用户拥有，因此配置不能直接把系统拥有的 `/usr/bin/security` 作为 provider command。

### 3. 合并基础配置

将 `openclaw.example.json` 中的 `<macos-user>` 替换为当前 macOS 用户名，然后把内容合并进 `~/.openclaw/openclaw.json`。

- 新环境可以以模板为基础创建配置。
- 已存在配置时只能合并相关字段，不能覆盖其他 Agent、Channel、Plugin 或 Secret provider。
- 配置文件权限应为 `0600`。

### 4. 验证

```bash
chmod 600 ~/.openclaw/openclaw.json
openclaw config validate
openclaw secrets audit --check --allow-exec
openclaw agents list
openclaw models list --agent main
openclaw models status --json
openclaw gateway restart
openclaw agent --local --agent main \
  --session-id model-smoke-test \
  --message "只回复 MODEL_OK" \
  --thinking high \
  --timeout 60
```

验收标准：

- Secret audit 为 `plaintext=0`、`unresolved=0`。
- `main` 是默认 Agent，身份为架构师。
- 主模型为 `volcengine-agent/glm-5.2`。
- GLM-5.2 的模型级默认推理档位为其当前最高可用档 `high`。
- 专用视觉模型为 `volcengine-agent/doubao-seed-2.0-pro`，支持文本和图像输入，默认推理档位为 `high`。
- `openclaw models status --json` 将 Doubao Seed 2.0 Pro 解析为 `imageModel`，`openclaw models list --agent main --json`
  显示它可用且输入类型为 `text+image`。
- GLM-5.2 冒烟请求返回 HTTP 200。

## 更新原则

运行环境中验证有效的初始化改进，应先更新本目录的模板或台账，再同步部署到 `~/.openclaw`。机器专属路径必须参数化，所有凭据必须保留在外部 Secret provider 中。
