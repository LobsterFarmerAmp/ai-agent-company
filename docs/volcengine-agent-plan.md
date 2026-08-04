# 火山引擎 Agent Plan 模型配置

本部署使用火山引擎方舟 Agent Plan 的 `glm-5.2` 作为 `main` 架构师的主模型。API Key 存放在 macOS Keychain，OpenClaw 配置只保存 SecretRef。

## 1. 写入 Keychain

让 `security` 交互式读取 Key，避免 Key 出现在命令历史或进程参数中：

```bash
security add-generic-password \
  -a "$USER" \
  -s "volcengine_agent" \
  -U \
  -w
```

按提示输入并确认 API Key。不要使用明文 `-w "API_KEY"` 写法。

## 2. 创建 Keychain 解析器

OpenClaw 的 exec SecretRef 要求命令文件由当前用户拥有，因此不能直接把系统拥有的 `/usr/bin/security` 配置为 provider command。创建一个最小包装脚本：

```sh
#!/bin/sh

exec /usr/bin/security find-generic-password \
  -a "<macos-user>" \
  -s "volcengine_agent" \
  -w
```

建议保存到 `/Users/<macos-user>/.openclaw/bin/openclaw-keychain-volcengine-agent`，然后收紧权限：

```bash
chmod 700 ~/.openclaw/bin
chmod 700 ~/.openclaw/bin/openclaw-keychain-volcengine-agent
```

脚本只能包含 Keychain 查询参数，不能包含 API Key。

## 3. 配置 OpenClaw

将以下内容合并进 `~/.openclaw/openclaw.json`，并把 `<macos-user>` 替换为当前 macOS 用户名：

```json
{
  "gateway": {
    "mode": "local"
  },
  "secrets": {
    "providers": {
      "macos_keychain_volcengine_agent": {
        "source": "exec",
        "command": "/Users/<macos-user>/.openclaw/bin/openclaw-keychain-volcengine-agent",
        "passEnv": ["HOME"],
        "jsonOnly": false
      }
    }
  },
  "models": {
    "mode": "merge",
    "providers": {
      "volcengine-agent": {
        "baseUrl": "https://ark.cn-beijing.volces.com/api/plan/v3",
        "apiKey": {
          "source": "exec",
          "provider": "macos_keychain_volcengine_agent",
          "id": "value"
        },
        "api": "openai-responses",
        "models": [
          {
            "id": "glm-5.2",
            "name": "GLM-5.2",
            "reasoning": true,
            "input": ["text"],
            "contextWindow": 1000000,
            "maxTokens": 128000,
            "cost": {
              "input": 0,
              "output": 0,
              "cacheRead": 0,
              "cacheWrite": 0
            }
          }
        ]
      }
    }
  },
  "agents": {
    "list": [
      {
        "id": "main",
        "default": true,
        "name": "架构师",
        "workspace": "/Users/<macos-user>/.openclaw/workspace",
        "thinkingDefault": "high",
        "model": {
          "primary": "volcengine-agent/glm-5.2"
        }
      }
    ]
  }
}
```

不要添加指向未配置 provider 的 fallback。只有在备用 provider 和凭据都完成验证后，才把它加入 `fallbacks`。

## 4. 验证

```bash
chmod 600 ~/.openclaw/openclaw.json
openclaw config validate
openclaw secrets audit --check --allow-exec
openclaw agents list
openclaw models list --agent main
openclaw agent --local --agent main \
  --session-id model-smoke-test \
  --message "只回复 MODEL_OK" \
  --thinking off \
  --timeout 60
```

验收标准：

- 配置校验通过。
- Secrets audit 显示 `plaintext=0`、`unresolved=0`。
- `main` 的模型为 `volcengine-agent/glm-5.2`。
- `main` 未显式指定思考档位时默认使用 GLM-5.2 当前可用的最高档 `high`。OpenClaw 的字面档位 `max` 不在该模型的支持列表中，会被拒绝。
- 模型请求返回 HTTP 200，并得到 `MODEL_OK`。
