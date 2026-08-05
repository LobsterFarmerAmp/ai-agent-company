# 火山引擎 Agent Plan 模型配置

> 本文档指导如何从零配置火山引擎方舟 Agent Plan 作为 OpenClaw 的模型 provider。

## 前置条件

- 已购买火山方舟 Agent Plan 套餐（Large 及以上推荐，Small/Medium 不支持视频模型）
- 已获取 Agent Plan 专属 API Key（非标准方舟 API Key）
- macOS 系统，已启用 Keychain

## Agent Plan 可用模型

Agent Plan 没有 `/models` 列表 API。以下模型清单通过官方文档和 API 实测确认：

### 文本模型

| Model ID | 上下文 | 最大输出 | 视觉 | 备注 |
|----------|--------|----------|------|------|
| `glm-5.2` | 1024k | 128k | ❌ | 推荐主模型 |
| `doubao-seed-2.0-pro` | 256k | 128k | ✅ | 推荐视觉模型 |
| `doubao-seed-2.0-mini` | 256k | 128k | ✅ | 极速，轻量任务 |
| `doubao-seed-2.0-lite` | 256k | 128k | ✅ | 日常对话 |
| `doubao-seed-2.0-code` | 256k | 128k | ✅ | 专业编程 |
| `doubao-seed-evolving` | - | - | ✅ | 持续优化中 |
| `doubao-seed-2.1-turbo` | - | - | ✅ | 高性价比 |
| `deepseek-v4-flash` | 1024k | 384k | ❌ | 长文本 |
| `deepseek-v4-pro` | 1024k | 384k | ❌ | 高复杂度 |
| `kimi-k2.6` | 256k | 32k | ❌ | 长程上下文 |
| `kimi-k2.7-code` | 256k | 32k | ❌ | 编程 |
| `kimi-k3` | 262k | 32k | ✅ | 视觉但慢（15s+） |
| `minimax-m2.7` | - | 128k | ✅ | 多模态理解 |
| `minimax-m3` | - | 128k | ✅ | 多模态理解 |

### 注意事项

- `claude-*`、`gpt-*`、`gemini-*` 等名字在 Agent Plan 上会路由到 doubao-seed，**不是真实模型**
- Agent Plan 的 Bearer token 只能调 `/api/plan/v3/responses` 等 Responses API 端点
- `/api/plan/v3/models` 端点不存在（404）
- 套餐额度在所有模型间共享，不同模型抵扣系数不同

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

保存到 `/Users/<macos-user>/.openclaw/bin/openclaw-keychain-volcengine-agent`，然后收紧权限：

```bash
chmod 700 ~/.openclaw/bin
chmod 700 ~/.openclaw/bin/openclaw-keychain-volcengine-agent
```

脚本只能包含 Keychain 查询参数，不能包含 API Key。

## 3. 配置 OpenClaw

将以下内容合并进 `~/.openclaw/openclaw.json`，并把 `<macos-user>` 替换为当前 macOS 用户名：

```json
{
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
            "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 }
          },
          {
            "id": "doubao-seed-2.0-pro",
            "name": "Doubao Seed 2.0 Pro",
            "reasoning": true,
            "input": ["text", "image"],
            "contextWindow": 262144,
            "maxTokens": 128000,
            "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 }
          }
        ]
      }
    }
  },
  "agents": {
    "defaults": {
      "imageModel": {
        "primary": "volcengine-agent/doubao-seed-2.0-pro"
      },
      "models": {
        "volcengine-agent/glm-5.2": {
          "params": { "thinking": "high" }
        },
        "volcengine-agent/doubao-seed-2.0-pro": {
          "params": { "thinking": "high" }
        }
      }
    }
  }
}
```

**选择说明：**

- 主模型 `glm-5.2`：1024k 上下文，国产旗舰，Agent 长程任务表现优秀
- 视觉模型 `doubao-seed-2.0-pro`：响应快（2-3s），视觉理解正常。`kimi-k3` 虽然也支持视觉但响应慢（15s+）
- 不要添加指向未配置 provider 的 fallback。只有在备用 provider 和凭据都完成验证后，才把它加入 `fallbacks`

## 4. 验证

```bash
chmod 600 ~/.openclaw/openclaw.json
openclaw config validate
openclaw secrets audit --check --allow-exec
openclaw agents list
openclaw models list --agent main
openclaw models status --json
```

### 冒烟测试

```bash
# 测试主模型
openclaw agent --local --agent main \
  --session-id model-smoke-test \
  --message "只回复 MODEL_OK" \
  --thinking off \
  --timeout 60
```

### 验收标准

- 配置校验通过
- Secrets audit 显示 `plaintext=0`、`unresolved=0`
- `main` 的模型为 `volcengine-agent/glm-5.2`
- `volcengine-agent/glm-5.2` 的模型级默认推理档位为 `high`（OpenClaw 的 `max` 不被该模型支持，会被拒绝）
- 视觉模型为 `volcengine-agent/doubao-seed-2.0-pro`，支持文本和图像输入
- GLM-5.2 冒烟请求返回 HTTP 200，并得到 `MODEL_OK`

## 5. 切换/新增模型

如需更换视觉模型或新增模型：

1. 在上方「Agent Plan 可用模型」表中确认目标模型存在
2. 在 `models.providers.volcengine-agent.models` 数组中添加/修改模型条目
3. 修改 `agents.defaults.imageModel.primary` 指向新模型
4. 如需设置 thinking 档位，在 `agents.defaults.models` 中添加对应条目
5. 重启 Gateway：`openclaw restart`
6. 使用 OpenClaw image 工具测试视觉模型看图功能
