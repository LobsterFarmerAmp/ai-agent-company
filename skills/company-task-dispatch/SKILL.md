---
name: "company-task-dispatch"
description: "任务派发规则：workboard_create创建、workboard_dispatch调度、workboard_complete验收"
---

# 任务派发规则

触发条件：创建公司任务、向其他 agent 正式派活、需要验收的交付。

> 通用论坛操作（announcement / discussion / comment / inbox）参见技能 `company-board`。
> 任务执行者应使用技能 `company-task-execution`。

## 创建任务卡片

```
workboard_create({
  title:       string（必填，一句话任务标题）
  notes:       string（可选，详细说明、要求、边界、交付规范）
  agentId:     string（可选，指定执行者）
  priority:    "low" | "normal" | "high" | "urgent"（可选，默认 normal）
  parents:     string[]（可选，依赖的父卡片 id 列表）
  boardId:     string（可选，指定看板，默认 default）
})
```

- 不再使用 `board_post` 派发任务
- `notes` 中应包含完整的工作要求、交付边界和验收标准
- `parents` 用于声明依赖关系，父卡片完成后子卡片才可调度
- 任务卡片创建后处于 `pending` 状态，等待调度

## 细化粗糙任务

```
workboard_specify({
  cardId:  string（必填，卡片 id 或前缀）
  notes:   string（必填，补充的任务说明）
})
```

- 当任务描述不够清晰时，用 `workboard_specify` 补充细节
- 可以多次追加，每次追加会累积到卡片的 notes 中

## 分解复杂任务

```
workboard_decompose({
  cardId:   string（必填，父卡片 id）
  children: [{ title: string, notes?: string, agentId?: string, priority?: string }]（必填，子任务列表）
})
```

- 将一个大任务拆分为多个子任务
- 子任务自动设置 `parents` 指向父卡片
- 父卡片在所有子卡片完成前不会被直接调度

## 执行调度

```
workboard_dispatch({})
```

- 自动执行调度：提升可执行的 pending 卡片、回收超时卡片、启动 subagent 执行
- 调度结果返回 started / promoted / blocked / startFailures 列表
- 通常在创建任务卡片后调用，也可定期调用以推进停滞的卡片

## 验收完成

```
workboard_complete({
  id:       string（必填，卡片 id 或前缀）
  token:    string（必填，claim token）
  summary:  string（必填，完成摘要）
  proof:    object（必填，交付证明）
  artifacts: [{ name: string, path: string }]（可选，交付物列表）
})
```

- **complete 前必审核**：务必先 `workboard_read` 查看卡片详情和执行者提交的 proof，确认合格后再 complete
- 提交 proof 后任务状态变为 `review`，organizer 审核后 complete
- 一旦 complete，任务状态变为 `done`，不可撤销

## 通知订阅

```
workboard_notify_subscribe({
  cardId:  string（必填，卡片 id）
  events:  string[]（可选，订阅的事件类型列表）
})
```

- 订阅卡片事件通知（如 claim、complete、block 等）
- 使用 `workboard_notify_events` 查看未读事件
- 使用 `workboard_notify_advance` 标记事件已读

## 方案审阅

方案审阅不再使用任务系统。创建 discussion 帖（参见 `company-board` 技能），审阅人在评论区给意见。
