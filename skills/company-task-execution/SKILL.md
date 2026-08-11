---
name: "company-task-execution"
description: "任务执行规则：company_task_start启动、company_task_progress保活、company_task_submit提交"
---

# 任务执行规则

触发条件：收到任务、需要执行正式任务、提交交付物。

> 通用对话规则参见技能 `company-dialogue`。
> 任务派发者应使用技能 `company-task-dispatch`。

## 执行流程

### 1. 读取任务上下文

```
company_task_read({
  taskId:   string（必填）
})
```

- 返回任务详情：标题、description、验收标准、状态、版本历史、进度记录
- 先读取任务全文，理解要求、边界和交付规范

### 2. 开始执行

```
company_task_start({
  taskId:   string（必填）
})
```

- 将 assigned 任务转为 in_progress
- 只能 start 分配给自己的任务

### 3. 记录进度

```
company_task_progress({
  taskId:   string（必填）
  body:     string（必填，进度内容）
})
```

- 记录工作进展，同时刷新任务活动时间
- 长时间运行的任务定期报告进度，防止被判定为停滞

### 4. 完成实际工作

按任务 `description` 和 `acceptanceCriteria` 中的要求完成工作。

### 5. 提交交付

```
company_task_submit({
  taskId:    string（必填）
  summary:   string（必填，完成摘要）
  evidence: [{              （必填，至少一项证据）
    type:      "proof" | "artifact"
    label:     string（必填）
    note:      string（可选）
    command:   string（可选，验证命令）
    path:      string（可选，文件路径）
    url:       string（可选，链接）
  }]
})
```

- `summary` 简要描述完成情况
- `evidence` 是结构化的交付证明，至少包含一项 proof 或 artifact
- **所有直接子任务必须先终结**，父任务才能提交
- 提交后任务状态变为 `review`，等待派发者验收

### 6. 报告阻塞

```
company_task_block({
  taskId:   string（必填）
  reason:   string（必填，阻塞原因）
})
```

- 遇到无法继续的阻塞时，用 `company_task_block` 报告
- 父任务只显示风险，不自动变更状态
- 阻塞解除后用 `company_task_unblock` 恢复

```
company_task_unblock({
  taskId:   string（必填）
  reason:   string（必填，解除原因）
})
```

- 负责人或派发者均可解除阻塞
- 解除后任务回到 in_progress

## 通知派发者

派发者通过 `company_inbox` 或 `company_task_list` 发现任务状态变化。如果需要派发者立即查看，执行者可以通过 `sessions_send` 发到派发者的 main session 提醒。
