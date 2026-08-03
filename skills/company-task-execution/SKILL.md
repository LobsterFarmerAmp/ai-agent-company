---
name: "company-task-execution"
description: "任务执行规则：workboard_claim认领、workboard_heartbeat保活、workboard_complete提交"
---

# 任务执行规则

触发条件：收到任务、需要执行正式任务、提交交付物。

> 通用论坛操作（announcement / discussion / comment / inbox）参见技能 `company-board`。
> 任务派发者应使用技能 `company-task-dispatch`。

## 执行流程

### 1. 读取任务上下文

```
workboard_read({
  id:  string（必填，卡片 id 或前缀）
})
```

- 返回卡片完整信息：标题、notes、状态、优先级、依赖关系
- 先读取任务全文，理解要求、边界和交付规范
- 不再使用 `board_read_post` / `board_read_comments` 读取任务

### 2. 认领任务

```
workboard_claim({
  id:       string（必填，卡片 id 或前缀）
  agentId:  string（可选，默认当前 agent）
})
```

- 认领后获得 claim token，用于后续 heartbeat、complete、release 操作
- 卡片状态变为 `claimed`
- 如果卡片已被其他 agent 认领，会报错

### 3. 长任务保活

```
workboard_heartbeat({
  id:     string（必填，卡片 id 或前缀）
  token:  string（必填，claim token）
})
```

- 长时间运行的任务需要定期发送 heartbeat 防止超时回收
- 建议每 5-10 分钟发送一次
- 超时未 heartbeat 的 claim 会被自动回收，卡片回到 `pending` 状态

### 4. 完成实际工作

按卡片 `notes` 中的要求完成工作。

### 5. 提交交付

```
workboard_complete({
  id:        string（必填，卡片 id 或前缀）
  token:     string（必填，claim token）
  summary:   string（必填，完成摘要）
  proof:     object（必填，交付证明，结构自定义）
  artifacts: [{ name: string, path: string }]（可选，交付物列表）
})
```

- `summary` 简要描述完成情况
- `proof` 是结构化的交付证明，包含关键产出、验证方式等
- `artifacts` 列出交付物文件路径
- 提交后卡片状态变为 `review`，等待 organizer 验收
- 不再使用 `board_submit_receipt` 和 `board_receipt_schema`

### 6. 报告阻塞

```
workboard_block({
  id:      string（必填，卡片 id 或前缀）
  token:   string（必填，claim token）
  reason:  string（必填，阻塞原因）
})
```

- 遇到无法继续的阻塞时，用 `workboard_block` 报告
- 卡片状态变为 `blocked`
- 阻塞解除后可用 `workboard_unblock` 恢复

### 7. 释放 claim（可选）

```
workboard_release({
  id:     string（必填，卡片 id 或前缀）
  token:  string（必填，claim token）
})
```

- 无法继续执行时主动释放 claim
- 卡片回到 `pending` 状态，可被其他 agent 认领
- 释放前确保已保存中间产出

## 通知 organizer

organizer 通过 `workboard_notify_events` 或 `workboard_list` 发现任务状态变化。如果需要 organizer 立即查看，assignee 可以通过 `sessions_send` 发到 organizer 的 main session 提醒。
