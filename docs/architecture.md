# 架构设计

## 设计原则

### 1. 单世界线（Single Worldline）

每个 Agent 维护单一上下文流。所有 Agent 间通信走目标 Agent 的 **main session**，不做 peer session 隔离。

**为什么？** Agent 对世界的认知是连续的，不会因 session 隔离导致上下文断裂。Boss 也在 main session 与各 Agent 对话，通信自然融入同一上下文流。

### 2. 规则即代码（Rules as Code）

公司规则通过 Hook 在 bootstrap 时自动注入，不靠人肉在每个 Agent 里同步。

**为什么？** 5 个 Agent 各自维护规则副本 = 5 个可能不一致的版本。Hook 注入保证了单一权威源。

### 3. Delegation First

管理者（1 级）拆需求、定标准、派活、审核交付。执行者（2 级）认领、保活、提交、阻塞上报。

**为什么？** CTO 的价值不在于自己写所有代码，而在于把模糊目标变成可执行、可交付的系统。

### 4. 从错误中学习（Self-Improvement Loop）

```
capture -> dedupe -> promote -> extract -> evaluate
```

**为什么？** AI Agent 没有跨 session 记忆。不主动记录教训，同样的错误会无限重复。

### 5. 最小变更（Minimal Change）

工程上保守可验证。不做无关重构，不顺手改无关格式。变更后必须做最小可行验证。

**为什么？** 多 Agent 同时操作同一仓库时，无关变更会造成冲突和不可预测的副作用。

## 组件关系

```
                    ┌──────────────┐
                    │  Boss (人类)  │
                    └──────┬───────┘
                           │ 指令/反馈
                    ┌──────▼───────┐
                    │  1级 Agent   │
                    │  (管理者)     │
                    └──┬───────┬───┘
           company_task    │       │  sessions_send
          create/dispatch   │       │  (跨agent通信)
                    ┌───▼──┐ ┌──▼──────┐
                    │2级   │ │2级      │
                    │Agent │ │Agent    │
                    └──┬───┘ └───┬─────┘
                       │          │
            ┌──────────┴──────────┴──────────┐
            │          Company OS              │
            │  company_task_* (任务流)         │
            │  company_meeting_* (会议编排)    │
            │  company_notice_* (告示板)       │
            │  company_org_* (组织管理)        │
            │  company_inbox (统一收件箱)      │
            └────────────────────────────────────┘
                        ↑
            ┌───────────┴───────────┐
            │       Hook 层          │
            │  company-guidelines    │
            │  self-improvement      │
            └───────────┬───────────┘
                        ↑
            ┌───────────┴───────────┐
            │     OpenClaw 平台      │
            │  workspace/sessions/   │
            │  cron/skills/tools     │
            └───────────────────────┘
```

## 通信模式

### Agent 间通信

| 场景 | 机制 | 说明 |
|------|------|------|
| 正式派活 | company_task_create | 有状态、可追踪、可验收 |
| 日常沟通 | sessions_send -> main session | 单世界线，上下文连续 |
| 方案审阅 | company_meeting_request (discussion) 或 sessions_send | 异步讨论或会议评审 |
| 公告通知 | company_notice_publish | 全员可见，不可变公告 |
| 紧急通知 | sessions_send + company_notice_publish | 消息 + 公告双重触达 |
| 多 Agent 会议 | company_meeting_request + delegate + speak | 主持人控制节奏，参会者按授权发言 |

### 统一收件箱

`company_inbox` 汇总与当前 Agent 有关的新任务、验收、风险、未读公告和会议，适合心跳检查。

## 任务生命周期

```
assigned ──start──> in_progress ──submit──> review ──review(accept)──> closed
                        │                       │
                        │                       └──review(reject)──> in_progress
                        │
                        ├──block──> blocked
                        │                │
                        │                └──unblock──> in_progress
                        │
                        └──progress (记录进度，刷新活动时间)
```

- 任务由父任务负责人向直属下属创建（`company_task_create`），创建后为 `assigned` 状态
- 执行者用 `company_task_start` 开始执行，状态变为 `in_progress`
- 执行者用 `company_task_submit` 提交摘要和证据，状态变为 `review`
- 派发者用 `company_task_review` 验收（accept 关闭 / reject 退回）
- 遇到阻塞用 `company_task_block`，解除用 `company_task_unblock`
- 所有直接子任务必须先终结，父任务才能提交

## 人设文件注入流程

```
Agent 启动 (bootstrap 事件)
  ↓
company-guidelines hook 触发
  ↓
读取 company-hard-rules.md
  ↓
注入到 AGENTS.md 前面（幂等，已有则跳过）
  ↓
self-improvement hook 触发
  ↓
注入 self-improvement 提醒
  ↓
OpenClaw 组装最终 prompt（AGENTS + SOUL + IDENTITY + MEMORY + TOOLS + USER）
  ↓
Agent 开始工作
```
