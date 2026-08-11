---
name: "company-task-dispatch"
description: "任务派发规则：company_task_create创建、company_task_review验收、company_task_revise修订"
---

# 任务派发规则

触发条件：创建公司任务、向其他 agent 正式派活、需要验收的交付。

> 通用对话规则参见技能 `company-dialogue`。
> 任务执行者应使用技能 `company-task-execution`。

## 创建任务

```
company_task_create({
  parentId:           string（必填，父任务 ID）
  assigneeId:         string（必填，直属下属 Agent ID）
  title:              string（必填，一句话任务标题）
  description:        string（必填，详细说明、要求、边界）
  acceptanceCriteria: string（必填，验收标准）
})
```

- 任务只能由父任务负责人向自己的直属下属创建
- Agent 不能创建根任务（根任务由 Boss 在系统外发起）
- 任务创建后为 `assigned` 状态，等待执行者 start

## 修订任务

```
company_task_revise({
  taskId:             string（必填）
  reason:             string（必填，修订原因）
  title:              string（可选）
  description:        string（可选）
  acceptanceCriteria: string（可选）
})
```

- 可修订未关闭、非 review 状态的任务
- 每次修订产生新版本，保留历史

## 重派任务

```
company_task_reassign({
  taskId:       string（必填）
  assigneeId:   string（必填，新的直属下属 Agent ID）
  reason:       string（必填，重派原因）
})
```

- 将任务重新指派给自己的另一名直属下属

## 取消任务

```
company_task_cancel({
  taskId:   string（必填）
  reason:   string（必填，取消原因）
})
```

- 存在活动子任务时拒绝取消
- 不级联取消子任务

## 验收任务

**验收前必须先读取任务详情和执行者提交的证据：**

```
company_task_read({
  taskId:   string（必填）
})
```

- 返回任务详情、版本历史、进度记录、提交的证据和审计日志
- 仔细审查 summary 和 evidence，逐项确认交付成果

**验收决策：**

```
company_task_review({
  taskId:    string（必填）
  decision:  "accept" | "reject"（必填）
  feedback:  string（可选，reject 时建议附带反馈）
})
```

- **accept**：任务关闭（closed），不可撤销
- **reject**：任务退回 in_progress，附反馈让执行者继续

## 查看任务

```
company_task_list({})
```

- 查看你的责任树中的多级任务、子任务计数和阻塞/停滞风险

```
company_task_read({ taskId })
```

- 读取任务详情、版本、进度、proof 和审计

## 方案审阅

方案审阅不再使用任务系统。需要多方讨论时使用 `company_meeting_request` 创建讨论会，或通过 `sessions_send` 异步沟通。

## 通知

通过 `company_inbox` 查看与你有关的任务验收、风险和新任务。通过 `company_task_list` 查看责任树全貌。
