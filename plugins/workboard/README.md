# Workboard（任务看板）

> OpenClaw 内置插件，提供 Agent 间任务派发、执行、验收的全生命周期管理。

## 概述

Workboard 是一个基于 SQLite 的任务看板系统，支持任务创建、认领、保活、提交、验收、阻塞等完整流程。它是公司治理中"任务派发"和"交付验收"的主要载体。

## 卡片生命周期

```
pending ──dispatch──> claimed ──complete(proof)──> review ──organizer验收──> done
   │                     │                          │
   │                     ├──release──> pending      └──block──> blocked
   │                     ├──timeout──> pending                  │
   │                     └──heartbeat (保活)                    └──unblock──> pending
   │
   └── 有 parents 依赖时，等所有 parents 完成后才可 dispatch
```

## 核心概念

### 角色

| 角色 | 说明 |
|------|------|
| organizer | 任务派发者（通常是 1 级管理者），负责创建、调度、验收 |
| assignee | 任务执行者（通常是 2 级），负责认领、执行、提交 |
| dispatcher | 自动调度系统，提升可执行卡片、回收超时 claim |

### Claim Token

认领任务后获得 claim token，用于后续所有操作（heartbeat、complete、release、block）。token 有 TTL，超时未 heartbeat 会被自动回收。

### 依赖管理

- `parents`：声明前置依赖，父卡片完成后子卡片才可调度
- `workboard_decompose`：将大任务拆分为子任务，自动建立依赖关系
- `workboard_link`：手动建立父子关系

## 工具列表

### 派发方（organizer）

| 工具 | 用途 |
|------|------|
| workboard_create | 创建任务卡片 |
| workboard_specify | 补充任务细节 |
| workboard_decompose | 拆分子任务 |
| workboard_dispatch | 自动调度（提升/回收/启动） |
| workboard_complete | 验收关单 |
| workboard_reassign | 重新指派 |
| workboard_list | 列出卡片 |
| workboard_read | 读取卡片详情 |
| workboard_stats | 统计 |
| workboard_promote | 提升依赖就绪的卡片 |

### 执行方（assignee）

| 工具 | 用途 |
|------|------|
| workboard_claim | 认领任务 |
| workboard_heartbeat | 保活（防止超时回收） |
| workboard_complete | 提交交付（summary + proof + artifacts） |
| workboard_block | 报告阻塞 |
| workboard_unblock | 阻塞解除 |
| workboard_release | 释放 claim |

### 通知

| 工具 | 用途 |
|------|------|
| workboard_notify_subscribe | 订阅卡片事件 |
| workboard_notify_events | 查看未读事件 |
| workboard_notify_advance | 标记事件已读 |

## Proof 结构

`workboard_complete` 的 `proof` 参数是结构化交付证明，字段自定义：

```json
{
  "label": "功能开发完成",
  "status": "passed",
  "command": "uv run pytest tests/",
  "note": "所有测试通过",
  "url": "https://github.com/..."
}
```

## 最佳实践

1. **创建时写清验收标准**：在 `notes` 中包含完整的工作要求、交付边界和验收标准
2. **长任务定期 heartbeat**：每 5-10 分钟一次，防止超时回收
3. **提交时附 proof**：包含验证命令、验证结果、交付物路径
4. **验收前 read**：organizer 必须先 `workboard_read` 查看 proof，确认合格后再 complete
5. **阻塞时立即 block**：不要闷头等待，block 后 organizer 可以介入
