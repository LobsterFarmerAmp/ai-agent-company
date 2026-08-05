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
│  技能体系层    │ 8 个 Skills: 协作 / 任务 / 工程 / 治理  │
├───────────────┼─────────────────────────────────────┤
│  Company OS   │ 任务流 + 会议编排 + 告示板 + 组织管理   │
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

8 个自建技能，分为四类：

| 类别 | 技能 | 作用 |
|------|------|------|
| 协作 | company-dialogue | 跨 Agent 对话规则（单世界线） |
| 协作 | company-org-chart | 组织架构权威源 |
| 任务 | company-task-dispatch | 任务派发流程 |
| 任务 | company-task-execution | 任务执行流程 |
| 工程 | company-code | 代码工程规则 |
| 工程 | company-reporting | 工作总结与对外汇报 |
| 治理 | persona-audit | 人设文件审查 |
| 治理 | self-improvement | 经验教训记录与提升 |

### 4. Company OS

OpenClaw 内置插件，统一提供公司运营的基础设施，数据存储在单一 SQLite 数据库中。

**任务流（company_task_\*）**
- 任务生命周期：assigned -> in_progress -> review -> closed / blocked
- 父任务负责人向直属下属创建子任务，层级与组织架构对齐
- 提交需附带摘要和证据（proof/artifact），所有子任务必须先终结
- 派发者验收（accept 关闭 / reject 退回），可版本化修订
- 进度记录、阻塞上报、重派、取消全生命周期支持

**会议编排（company_meeting_\*）**
- 两种会议类型：任务会议（绑定父任务）和讨论会
- 主持人控制节奏：delegate 授权发言 -> speak 发言 -> 多轮 -> end 总结
- 任务会议结束原子创建子任务草案、总结和会议汇报公告
- 参会者分 worker 和 advisor 两种角色

**告示板（company_notice_\*）**
- 不可变公告发布（Boss、main 或有直属下属的管理者可发布）
- 支持更正关系（supersedes 指向旧公告）
- 已读标记追踪

**组织管理（company_org_\*）**
- 成员、职位、层级、在职状态管理
- 仅架构师（main）可新增/停用/更新成员

**统一收件箱（company_inbox）**
- 汇总新任务、验收、风险、未读公告和会议
- 适合心跳检查

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
- 内置工具：`company_task_*`、`company_meeting_*`、`company_notice_*`、`company_org_*`、`company_inbox`、`sessions_send`、`cron`

## 数据流

### 任务派发流

```
Boss 指令
  ↓
CTO 接收 -> 拆需求 -> company_task_create 创建子任务（指定 assigneeId）
  ↓
assignee: company_task_start -> 执行 -> company_task_progress (记录进度)
  ↓
assignee: company_task_submit(summary + evidence) -> 状态变为 review
  ↓
CTO: company_task_read 查看详情和证据 -> company_task_review (accept/reject)
  ↓
accept -> 任务关闭；reject -> 退回 in_progress 并附 feedback
  ↓
self-improvement: 记录教训 -> promote 到 MEMORY.md -> extract 新技能
```

### 会议协作流

```
CTO 判断需要多方实时讨论
  ↓
company_meeting_request（指定参会者、议程，任务会议绑定父任务）
  ↓
company_meeting_delegate -> 授权参会者发言
  ↓
参会者: company_meeting_speak -> 表达观点/方案
  ↓
多轮 delegate/speak（主持人控制节奏）
  ↓
company_meeting_end(summary) -> 任务会议原子创建子任务草案、总结和汇报公告
  ↓
结论落地：子任务自动创建或转 sessions_send 通知
```

> 日常异步沟通走 sessions_send；需要多方实时讨论时走 company_meeting。
