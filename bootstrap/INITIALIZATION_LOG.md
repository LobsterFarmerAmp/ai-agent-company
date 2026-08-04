# 龙虾池初始化台账

> 当前部署分支：`codex/main-agent-architect`  
> 初始化日期：2026-08-04  
> 本文件禁止记录任何凭据值。

## 已完成

- 将治理仓库拉取到 `~/.openclaw/company`。
- 创建并推送协作分支 `codex/main-agent-architect`。
- 确定 `main` 为默认 Agent，并由其担任 OpenClaw 首席架构师。
- 创建 `~/.openclaw/openclaw.json`，设置 Gateway 为本机模式。
- 将火山 Agent Plan API Key 存入 macOS Keychain，service 为 `volcengine_agent`。
- 创建用户自有 Keychain 解析器，通过 exec SecretRef 向 OpenClaw 提供模型凭据。
- 配置 `volcengine-agent/glm-5.2`：Responses API、纯文本输入、100 万上下文、128K 最大输出。
- 将 GLM-5.2 的默认推理档位设置为模型级 `high`；没有设置 Agent 级 `thinkingDefault`。
- 将 Gateway token 从自动生成的明文配置迁移至 macOS Keychain，service 为 `openclaw_gateway_token`。
- 创建用户自有 Gateway token 解析器，并将 `gateway.auth.token` 改为 exec SecretRef。
- 创建 `main` workspace，并完成一次 GLM-5.2 真实调用验证。

## 已验证

- OpenClaw 版本：`2026.7.1-2`。
- `openclaw config validate` 通过。
- `openclaw secrets audit --check --allow-exec`：`plaintext=0`、`unresolved=0`。
- `main` 为默认 Agent，主模型为 `volcengine-agent/glm-5.2`。
- 火山 Agent Plan Responses 请求返回 HTTP 200。
- GLM-5.2 支持的推理档位为 `off / minimal / low / medium / high`；`high` 是当前最高可用档。
- Gateway 已可连接；管理读操作仍需要完成带 `operator.read` 权限的设备配对。

## 尚未完成

- 安装并启用公司 Skills。
- 安装 company-guidelines 与 self-improvement Hooks。
- 将 `main` workspace 的默认人设文件替换为架构师人设。
- 启用并配置 Workboard。
- 安装 Company Board 与 Meeting Orchestrator。
- 创建 CTO 和执行者 Agent。
- 配置 Channel、路由、Heartbeat 与定时任务。
- 完成 Gateway 管理设备配对与权限验证。

## 关联提交

- `d30fa3d`：`main` 作为架构师及维护协作约定。
- `449379c`：火山 Agent Plan 安全配置文档。
- `a638f98`：GLM-5.2 最高可用推理档位说明。
