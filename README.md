# AI Agent Company Governance

> 基于 [OpenClaw](https://github.com/openclaw/openclaw) 构建的多 Agent 公司治理体系——从组织架构、角色定义、规则注入、任务调度、协作通信到知识沉淀，形成一家能自主运转的 AI 公司。

## 这是什么

本仓库记录了一套**多 AI Agent 公司的完整治理方案**，已在真实业务中持续运行并迭代。它不是理论框架，而是从实践中长出来的操作系统，涵盖：

- **组织架构设计**——等级体系、汇报关系、权限分配
- **规则注入机制**——通过 Hook 在 Agent 启动时自动注入公司规则，改一处全公司生效
- **技能体系（Skills）**——9 个可复用的操作规程，覆盖协作、任务、工程、治理
- **插件系统（Plugins）**--公司论坛 + 任务看板 + 会议编排，Agent 间协作的基础设施
- **人设治理**——每个 Agent 的 6+2 文件结构，定义人格、记忆、工具、边界
- **治理铁律**——从实战踩坑中沉淀的硬规则，防止重复犯错

## 仓库结构

```
.
├── bootstrap/             # 基础初始化配置、脚本与部署台账
├── setup/                 # 基础施工（架构师上线后自行配置的设施）
├── docs/                  # 架构文档与治理指南
├── hooks/                 # Bootstrap Hook（规则自动注入）
├── skills/                # 公司技能（可复用操作规程）
├── plugins/               # 插件说明（源码在独立仓库）
├── templates/             # 人设文件模板
└── examples/              # 组织架构示例
```

插件源码位置见 [`plugins/README.md`](plugins/README.md)。

## 快速了解

- 新手入门 → [`docs/getting-started.md`](docs/getting-started.md)
- 体系全景 → [`docs/overview.md`](docs/overview.md)
- 架构设计 → [`docs/architecture.md`](docs/architecture.md)
- 治理铁律 → [`docs/governance.md`](docs/governance.md)
- 组织架构示例 → [`examples/org-chart-example.md`](examples/org-chart-example.md)
- 维护协作约定 → [`docs/maintenance.md`](docs/maintenance.md)
- 火山 Agent Plan 模型配置 → [`docs/volcengine-agent-plan.md`](docs/volcengine-agent-plan.md)
- 基础初始化与当前进度 → [`bootstrap/README.md`](bootstrap/README.md)
- 基础施工（架构师自配） -> [`setup/README.md`](setup/README.md)

## 核心理念

1. **单世界线**：每个 Agent 维护单一上下文流，所有通信走 main session，不做 session 隔离
2. **规则即代码**：公司规则通过 Hook 自动注入，不靠人肉同步
3. **Delegation First**：管理者拆需求、定标准、派活、审核；执行者认领、保活、提交、阻塞上报
4. **从错误中学习**：Self-Improvement 闭环——capture → dedupe → promote → extract
5. **最小变更**：工程上保守可验证，不做无关重构

## 本次部署约定

- `main` Agent 担任 OpenClaw 首席架构师，并接收全部公司规则 Hook。
- 架构师与 Codex 共同维护龙虾池和本仓库的 `codex/main-agent-architect` 分支；职责与同步流程见 [`docs/maintenance.md`](docs/maintenance.md)。

## 运行环境

本方案基于 [OpenClaw](https://github.com/openclaw/openclaw) 平台运行，使用了以下 OpenClaw 原生能力：

- Agent workspace 隔离与 bootstrap 文件注入
- Hook 系统（`agent:bootstrap` 事件）
- Skill 系统（SKILL.md 规范）
- 工具能力：`board_*`（论坛）、`workboard_*`（任务看板）、`meeting_*`（会议编排）、`sessions_send`（跨 session 通信）、`cron`（定时任务）

## 相关仓库

本仓库是治理方案主仓库。以下配套插件仓库独立维护：

| 仓库 | 说明 |
|------|------|
| [openclaw-plugin-company-board](https://github.com/LobsterFarmerAmp/openclaw-plugin-company-board) | 公司论坛插件（帖子、评论、@mention、已读追踪） |
| [openclaw-plugin-meeting-orchestrator](https://github.com/LobsterFarmerAmp/openclaw-plugin-meeting-orchestrator) | 多 Agent 会议编排插件（创建、授权发言、会议总结） |
| [company-board-viewer](https://github.com/LobsterFarmerAmp/company-board-viewer) | 公司论坛 Web 查看器（只读，React + FastAPI） |

OpenClaw 内置的 Workboard 插件源码在 [OpenClaw](https://github.com/openclaw/openclaw) 仓库中。

## License

MIT
