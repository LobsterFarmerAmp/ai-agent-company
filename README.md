# AI Agent Company Governance

一套能自主运转的多 Agent 公司的治理方案。基于 [OpenClaw](https://github.com/openclaw/openclaw) 构建，已在真实业务中持续运行迭代——组织、规则、任务、会议、知识沉淀全部自动化。

> 本仓库是**说明手册**，不是内容仓库也不是资产库：每条组件给「是什么 + 在哪 + 为啥重要」，详情只留链接；私有资产（头像/密钥/内部资料）不入库，只记路径与规则。

---

## 从你这儿开始

选一个身份，三步直达：

| 我是… | 我要… | 直达 |
|--------|-------|------|
| **新 Agent** | 快速上手、装好人设和技能 | → [`docs/getting-started.md`](docs/getting-started.md) |
| **管理者** | 派活、定规则、开会议 | → [`docs/governance.md`](docs/governance.md) |
| **想查现状** | 当前组了什么、配了什么 | → [`docs/overview.md`](docs/overview.md) |

---

## 组件地图

| 组件 | 电梯陈述 | 价值 · 定位 | 入口 |
|------|---------|------------|------|
| **Company OS 插件** | 会议、任务、公告的运行内核，没有它公司转不起来 | 自研独立插件，统一承载组织/任务流/会议/告示板；治理规矩写死在它里面，恢复环境全靠它 | 卡片：[`setup/company-os.md`](setup/company-os.md) · 详情：[插件 README](https://github.com/amphilagus/openclaw-plugin-company-os) |
| **规则注入 Hooks** | 公司规则启动时自动注入，改一处全公司生效 | `agent:bootstrap` 事件触发，幂等去重；架构师也必须接收同一套规则 | [`hooks/README.md`](hooks/README.md) |
| **技能体系 Skills** | 8 个可复用操作规程，覆盖协作/任务/工程/治理 | 按等级分配，管理者持 dispatch、执行者只持 execution | [`skills/README.md`](skills/README.md) |
| **人设文件** | 每个 Agent 的 6+2 文件，定义人格/记忆/工具/边界 | 模板见 `templates/`，审计走 `persona-audit` | 模板：[`templates/`](templates/) · 审计：[`skills/persona-audit`](skills/persona-audit) |
| **治理铁律** | 从实战踩坑沉淀的硬规则，防止重复犯错 | 规则即代码，Hook 注入，改一处全公司生效 | [`docs/governance.md`](docs/governance.md) |

---

## 目录归位

| 目录 | 定位 | 说明 |
|------|------|------|
| `docs/` | **手册本体** | 架构、上手、治理、维护、Provider 配置 |
| `setup/` | **施工档索引** | 架构师上线后自配的设施卡片（记忆搜索/技能/Hooks/Company OS/头像/人设） |
| `skills/` | **技能卡片** | 每个技能只写「是什么+在哪」，详细 SKILL.md 各管自己 |
| `hooks/` | **Hook 卡片** | 规则自动注入的实现与安装 |
| `templates/` `examples/` | **资产** | 人设模板、组织示例，只留链接不展开 |
| `bootstrap/` | **档案区** | 初始化台账、脱敏配置、Keychain 辅助脚本——**已被 setup/、docs/ 引用，不得删除**，但从手册主线降级至此 |

---

## 核心理念

1. **单世界线**：每 Agent 单一上下文流，通信走 main session
2. **规则即代码**：公司规则 Hook 自动注入，不靠人肉同步
3. **Delegation First**：管理者拆需求定标准派活审核，执行者认领保活提交上报
4. **从错误中学习**：Self-Improvement 闭环 capture → dedupe → promote → extract
5. **最小变更**：工程保守可验证，不做无关重构
6. **手册非资产库**：只做说明，私有资产不入库，只记路径与规则

## 本次部署约定

- `jia-goushi` 担任 OpenClaw 首席架构师，接收全部公司规则 Hook。
- 架构师与 Codex 共同维护龙虾池与本仓库 `codex/main-agent-architect` 分支；职责见 [`docs/maintenance.md`](docs/maintenance.md)。

## 运行环境

基于 OpenClaw 平台，使用其 native 能力：Agent workspace 隔离、Hook 系统、Skill 系统，以及 **Company OS**（自研独立插件，代码 `~/.openclaw/company/openclaw-plugin-company-os`，经 `plugins.load.paths` 加载）。工具层：`sessions_send`、`cron`。

## License

MIT