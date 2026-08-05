# 龙虾池初始化台账

> 当前部署分支：`codex/main-agent-architect`  
> 初始化日期：2026-08-04  
> 最近更新：2026-08-05
> 本文件禁止记录任何凭据值。

## 已完成

- 将治理仓库拉取到 `~/.openclaw/company/ai-agent-company`；`~/.openclaw/company`
  作为公司级容器目录，保留给其他公司资产。
- 创建并推送协作分支 `codex/main-agent-architect`。
- 确定 `main` 为默认 Agent，并由其担任 OpenClaw 首席架构师。
- 创建 `~/.openclaw/openclaw.json`，设置 Gateway 为本机模式。
- 将火山 Coding Plan 与 Agent Plan API Key 分别存入 macOS Keychain，service 为 `volcengine`
  与 `volcengine_agent`。
- 为两个套餐创建用户自有 Keychain 解析器，通过独立 exec SecretRef 向 OpenClaw 提供模型凭据。
- 配置 `volcengine-plan/glm-5.2`：Completions API、纯文本输入、100 万上下文、128K 最大输出。
- 配置 `volcengine-agent/glm-5.2`：Responses API、纯文本输入、100 万上下文、128K 最大输出。
- 将两个 GLM-5.2 模型引用的默认推理档位设置为模型级 `high`；没有给 `main` 设置 Agent 级
  `thinkingDefault`。
- 将 `main` 架构师绑定为 Coding Plan 首选、Agent Plan 回退；将 Agent Plan 首选的现有 Agent
  反向绑定为 Coding Plan 回退，实现按 Agent 的双向互备。
- 配置 `volcengine-agent/doubao-seed-2.0-pro` 为专用视觉模型：Responses API、文本与图像输入、
  256K 上下文、128K 最大输出。
- 将 Gateway token 从自动生成的明文配置迁移至 macOS Keychain，service 为 `openclaw_gateway_token`。
- 创建用户自有 Gateway token 解析器，并将 `gateway.auth.token` 改为 exec SecretRef。
- 创建 `main` workspace，并完成一次 GLM-5.2 真实调用验证。
- 通过 CLI 创建 canonical Main 会话 `agent:main:main`，使其可在 Dashboard 中直接选择。
- 安装 Tavily skill，将 API Key 存入 macOS Keychain，并通过 exec SecretRef 注入。
- 修复 Tavily Keychain 解析器对 `$USER` 的错误依赖，改为使用 `/usr/bin/id -un`。

## 已验证

- OpenClaw 版本：`2026.7.1-2`。
- `openclaw config validate` 通过。
- `openclaw secrets audit --check --allow-exec`：`plaintext=0`、`unresolved=0`。
- `main` 为默认 Agent，首选模型为 `volcengine-plan/glm-5.2`，回退模型为
  `volcengine-agent/glm-5.2`。
- 以 Agent Plan 为首选的现有 Agent 已反向配置 `volcengine-plan/glm-5.2` 为回退模型。
- Coding Plan Completions 与 Agent Plan Responses 的独立真实请求均成功，分别返回
  `CODING_PLAN_OK` 与 `AGENT_PLAN_OK`。
- OpenClaw 已将 `volcengine-agent/doubao-seed-2.0-pro` 解析为可用的 `text+image` 模型，
  并将它标记为默认 `imageModel`。
- Kimi K3 曾作为视觉候选完成模型 ID 和文本请求验证，但同一时段的图像请求遇到服务过载；
  当前默认视觉模型已改为响应更稳定的 Doubao Seed 2.0 Pro。
- GLM-5.2 支持的推理档位为 `off / minimal / low / medium / high`；`high` 是当前最高可用档。
- Gateway 已可连接；管理读操作仍需要完成带 `operator.read` 权限的设备配对。
- `agent:main:main` 已创建并可在 Dashboard 中选择；双 Provider 更新后，该会话通过
  `volcengine-plan/glm-5.2` 返回 `MAIN_CODING_READY`。
- Tavily 解析器在 LaunchAgent 类似的净化环境中返回 `0`；Gateway 恢复运行，
  连通探针为 `ok`，Dashboard 返回 HTTP 200。

## 尚未完成

- 安装并启用公司 Skills。
- 安装 company-guidelines 与 self-improvement Hooks。
- 将 `main` workspace 的默认人设文件替换为架构师人设。
- 启用 Company OS 插件。
- 创建 CTO 和执行者 Agent。
- 配置 Channel、路由、Heartbeat 与定时任务。
- 完成 Gateway 管理设备配对与权限验证。
- 使用 Doubao Seed 2.0 Pro 补做一次图像输入到视觉描述输出的完整验收。

## 关联提交

- `d30fa3d`：`main` 作为架构师及维护协作约定。
- `449379c`：火山 Agent Plan 安全配置文档。
- `a638f98`：GLM-5.2 最高可用推理档位说明。
