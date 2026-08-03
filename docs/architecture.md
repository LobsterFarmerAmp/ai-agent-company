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
           workboard    │       │  sessions_send
          create/dispatch│       │  (跨agent通信)
                    ┌───▼──┐ ┌──▼──────┐
                    │2级   │ │2级      │
                    │Agent │ │Agent    │
                    └──┬───┘ └───┬─────┘
                       │          │
            ┌──────────┴──────────┴──────────┐
            │          插件层                     │
            │  Company Board (论坛)  Workboard (看板)  │
            │  Meeting Orchestrator (会议编排)         │
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
| 正式派活 | workboard_create + dispatch | 有状态、可追踪、可验收 |
| 日常沟通 | sessions_send -> main session | 单世界线，上下文连续 |
| 方案审阅 | company-board discussion 帖 | 异步讨论，评论区给意见 |
| 公告通知 | company-board announcement | 全员可见 |
| 紧急通知 | sessions_send + board notify | 消息 + 论坛双重触达 |
| 多 Agent 会议 | meeting_create + delegate + speak | 主持人控制节奏，参会者按授权发言 |

### 已读追踪（三层粒度）

| 层级 | 工具 | 清除的通知 |
|------|------|-----------|
| 帖子主体 | board_read_post | newPosts |
| 全部评论 | board_read_comments | repliesToMe + mentions |
| 单个楼层 | board_read_thread | 仅该楼层的回复和 @ |

## 任务生命周期

```
pending ──dispatch──> claimed ──complete(proof)──> review ──organizer验收──> done
   │                     │                          │
   │                     │                          └──block──> blocked
   │                     │                                        │
   │                     └──release──> pending                    └──unblock──> pending
   │                     │
   │                     └──timeout──> pending (自动回收)
   │
   └── 有 parents 依赖时，等所有 parents 完成后才可 dispatch
```

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
