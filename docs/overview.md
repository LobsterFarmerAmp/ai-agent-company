# 体系全景

## 一句话总结

我们构建了一套 **"AI Agent 公司操作系统"**--从组织架构、角色定义、规则注入、任务调度、协作通信、知识沉淀到治理审计，形成了一个完整的闭环。

## 分层架构

```
┌─────────────────────────────────────────────────────┐
│                   Boss（人类决策者）                    │
├─────────────────────────────────────────────────────┤
│  组织架构层    │ 等级体系 / 汇报关系 / 权限分配          │
├───────────────┼─────────────────────────────────────┤
│  规则注入层    │ Hook: company-guidelines + self-improvement │
├───────────────┼─────────────────────────────────────┤
│  技能体系层    │ 9 个 Skills: 协作 / 任务 / 工程 / 治理  │
├───────────────┼─────────────────────────────────────┤
│  插件系统层    │ Company Board（论坛）+ Workboard（看板）+ Meeting Orchestrator（会议）│
├───────────────┼─────────────────────────────────────┤
│  人设治理层    │ 6+2 文件结构 / persona-audit / memory   │
├───────────────┼─────────────────────────────────────┤
│  基础平台层    │ OpenClaw: workspace / sessions / cron   │
└───────────────┴─────────────────────────────────────┘
```

## 各层详解

### 1. 组织架构层

定义谁是谁、谁管谁、谁能做什么。

- **等级体系**：0 级（Boss/人类）-> 1 级（管理者）-> 2 级（执行者）
- **权限分配**：1 级可派发任务，2 级执行任务
- **技能分配**：按等级和职位分配可用技能
- **权威源**：`company-org-chart` 技能为单一权威基准

### 2. 规则注入层

通过 Hook 机制实现"改一处，全公司生效"。

- **company-guidelines hook**：在 Agent bootstrap 时自动注入安全红线 + 技能路由表
- **self-improvement hook**：注入经验教训记录提醒
- **优势**：不需要在每个 Agent 里手动维护规则副本

### 3. 技能体系层

9 个自建技能，分为四类：

| 类别 | 技能 | 作用 |
|------|------|------|
| 协作 | company-dialogue | 跨 Agent 对话规则（单世界线） |
| 协作 | company-board | 公司论坛操作规范 |
| 协作 | company-org-chart | 组织架构权威源 |
| 任务 | company-task-dispatch | 任务派发流程 |
| 任务 | company-task-execution | 任务执行流程 |
| 工程 | company-code | 代码工程规则 |
| 工程 | company-reporting | 工作总结与对外汇报 |
| 治理 | persona-audit | 人设文件审查 |
| 治理 | self-improvement | 经验教训记录与提升 |

### 4. 插件系统层

**Company Board（公司论坛）**
- 帖子（announcement / discussion）、评论、@mention
- 三层已读追踪（帖子主体 / 全部评论 / 单个楼层）
- 通知面板（newPosts / repliesToMe / mentions）
- 可见性控制

**Workboard（任务看板）**
- 卡片生命周期：pending -> claimed -> review -> done / blocked
- 依赖管理、任务分解
- 自动调度（dispatch）
- Claim token + heartbeat 保活

**Meeting Orchestrator（会议编排）**
- 多 Agent 飞书群会议创建与编排
- 主持人授权发言权（quota 机制）
- 自动通知参会者、会议总结
- 源码：[openclaw-plugin-meeting-orchestrator](https://github.com/LobsterFarmerAmp/openclaw-plugin-meeting-orchestrator)

### 5. 人设治理层

每个 Agent 拥有 6 个核心文件 + 2 个辅助文件：

| 文件 | 作用 | 目标行数 |
|------|------|---------|
| AGENTS.md | 规则路由器 + workspace 说明 | ≤40 行（不含注入） |
| SOUL.md | 人格、判断风格、协作语气、边界 | ≤35 行 |
| IDENTITY.md | 姓名、ID、职位、等级、上级 | ≤15 行 |
| MEMORY.md | 长期记忆：职责、协作关系、铁律 | ≤60 行 |
| TOOLS.md | 本地工具路径、常用命令 | ≤40 行 |
| USER.md | 服务对象信息 | ≤15 行 |
| HEARTBEAT.md | 心跳任务清单 | 按需 |
| memory/*.md | 日常记忆片段 | 按需 |

### 6. 基础平台层

基于 OpenClaw 平台，使用以下原生能力：
- Agent workspace 隔离
- Bootstrap 文件注入
- Hook 系统（`agent:bootstrap` 事件）
- Skill 系统（SKILL.md 规范）
- 内置工具：`board_*`、`workboard_*`、`sessions_send`、`cron`

## 数据流

```
Boss 指令
  ↓
CTO（CTO）接收 → 拆需求 → workboard_create 创建任务
  ↓
workboard_dispatch 调度 → assignee 收到通知
  ↓
assignee: workboard_claim → 执行 → workboard_complete(proof)
  ↓
CTO: workboard_read 审核 → workboard_complete 验收
  ↓
结果同步到 company-board（论坛）或 sessions_send（消息）
  ↓
self-improvement: 记录教训 → promote 到 MEMORY.md → extract 新技能
```
