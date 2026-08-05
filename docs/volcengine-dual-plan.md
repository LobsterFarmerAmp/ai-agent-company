# 火山引擎双 Provider 配置

当前龙虾池同时接入火山引擎 Coding Plan 与 Agent Plan。`main` 架构师优先使用 Coding Plan 的
GLM-5.2，失败时回退到 Agent Plan 的 GLM-5.2；视觉任务继续交给 Agent Plan 的
Doubao Seed 2.0 Pro。

| 用途 | Provider / Model | API 协议 |
|------|------------------|----------|
| 架构师主模型 | `volcengine-plan/glm-5.2` | `openai-completions` |
| 架构师回退模型 | `volcengine-agent/glm-5.2` | `openai-responses` |
| 专用视觉模型 | `volcengine-agent/doubao-seed-2.0-pro` | `openai-responses` |

## 1. 凭证与 Keychain

两个套餐使用不同的 Keychain service，凭证不得写入 JSON、脚本或仓库：

```bash
# Coding Plan
security add-generic-password -a "$USER" -s "volcengine" -U -w

# Agent Plan
security add-generic-password -a "$USER" -s "volcengine_agent" -U -w
```

命令会交互式要求输入和确认。不要使用把 Key 直接放进命令参数的明文写法。

安装仓库中的用户自有解析器：

```bash
install -d -m 700 ~/.openclaw/bin
install -m 700 bootstrap/bin/openclaw-keychain-volcengine \
  ~/.openclaw/bin/openclaw-keychain-volcengine
install -m 700 bootstrap/bin/openclaw-keychain-volcengine-agent \
  ~/.openclaw/bin/openclaw-keychain-volcengine-agent
```

解析器使用 `/usr/bin/id -un` 获取当前账户，不依赖 LaunchAgent 环境中可能缺失的 `$USER`。

## 2. 合并配置

以 [`../bootstrap/openclaw.example.json`](../bootstrap/openclaw.example.json) 为准，将下列部分合并进
`~/.openclaw/openclaw.json`：

- `secrets.providers.macos_keychain_volcengine` 与
  `secrets.providers.macos_keychain_volcengine_agent`
- `models.providers.volcengine-plan` 与 `models.providers.volcengine-agent`
- `agents.defaults.models` 中两个 GLM-5.2 模型引用的 `thinking: high`
- `agents.list` 中 `main.model.primary` 和 `main.model.fallbacks`
- `agents.defaults.imageModel.primary`

架构师的主备绑定为：

```json
{
  "model": {
    "primary": "volcengine-plan/glm-5.2",
    "fallbacks": ["volcengine-agent/glm-5.2"]
  }
}
```

Fallback 是按 Agent 单向定义的。两个 Provider “互为回退”意味着每个 Agent 根据自己的首选
方向显式绑定：

```json
{
  "coding-primary-agent": {
    "primary": "volcengine-plan/glm-5.2",
    "fallbacks": ["volcengine-agent/glm-5.2"]
  },
  "agent-plan-primary-agent": {
    "primary": "volcengine-agent/glm-5.2",
    "fallbacks": ["volcengine-plan/glm-5.2"]
  }
}
```

当前部署中，`main` 架构师使用第一种绑定；以 Agent Plan 为首选的 Agent 使用第二种绑定。
不要把两个方向同时塞进同一个 Agent 的 fallback 数组，也不要把主模型再次列入自己的 fallback。

Coding Plan 的 provider 使用
`https://ark.cn-beijing.volces.com/api/coding/v3` 与 `openai-completions`；Agent Plan 使用
`https://ark.cn-beijing.volces.com/api/plan/v3` 与 `openai-responses`。不要互换协议。

两个 GLM-5.2 模型引用均设置 `thinking: high`。这是当前自定义 Provider 配置可接受的最高推理档；
OpenClaw 文档中 GLM-5.2 的 `max` 映射特例针对 `zai/*` Provider，不应直接套用到这两个火山 Provider。

## 3. 验证

```bash
chmod 600 ~/.openclaw/openclaw.json
openclaw config validate
openclaw secrets audit --check --allow-exec
openclaw models list --agent main --json
openclaw models status --json
openclaw gateway restart
```

完成两条独立冒烟请求：一条不指定模型，验证架构师默认走 Coding Plan；另一条显式选择
`volcengine-agent/glm-5.2`，验证回退通道本身可用。不要通过故意破坏主凭证来触发回退。

验收标准：

- 配置校验与 Secrets audit 通过，`plaintext=0`、`unresolved=0`
- `main` 默认解析到 `volcengine-plan/glm-5.2`
- `main` 的 fallback 为 `volcengine-agent/glm-5.2`
- 所有 Agent 都遵循双向互备规则：Coding Plan 首选时回退 Agent Plan，Agent Plan 首选时反向回退
  Coding Plan
- 两个 GLM-5.2 模型均可完成真实请求
- `imageModel` 仍为 `volcengine-agent/doubao-seed-2.0-pro`
