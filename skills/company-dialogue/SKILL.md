---
name: "company-dialogue"
description: "跨agent对话与沟通规则：主动发送走 main session、收到消息原路回复、单世界线原则"
---

# 跨 Agent 对话与沟通规则

触发条件：给其他 agent 发消息、回复消息、通知、同步规则或状态、任何跨 agent 沟通。

组织架构见技能：`company-org-chart`。

## 核心原则：单世界线

每个 agent 维护单一上下文流。所有 agent 间通信走目标 agent 的 **main session**，不做 peer session 隔离。这样每个 agent 对世界的认知是连续的，不会因 session 隔离导致上下文断裂。

Boss 也在 main session 与各 agent 对话，agent 间通信自然融入同一上下文流。

## 主动发送

给其他 agent 发消息时，发送到目标 agent 的 main session：

```
sessions_send({
  sessionKey: "agent:<目标agent-id>:main",
  message: "..."
})
```

示例：架构师发给CTO -> `agent:cto:main`

不使用 peer session（`agent:<目标>:peer:<自己>` 已废弃）。

## 收到消息如何回复

**消息从哪来，回哪去。**

- 如果你**当前 turn 就是被这条消息唤起的**（inbound 消息进的是当前 session），直接在当前会话里回复即可，不需要 `sessions_send`。
- 如果需要跨 session 送回复，用 inbound metadata 里的 `sourceSession` 原样搬：

```
sessions_send({
  sessionKey: <inbound_meta.sourceSession>,
  message: "..."
})
```

不拼新 key，不反拼，不改发别的 session。

## 发送格式

消息末尾必须标注：
- 需要对方回复：`请回复`
- 仅同步知悉：`无需回复`

直接用 sessions_send 派活（非 task_collab）时，写清：目标、背景、输入路径、输出要求、验证要求、权限边界。

通过 task_collab 派活时，sessions_send 仅作极简通知，格式见技能 `company-task-dispatch`。

不要要求其他 agent 直接修改不属于其职责的 workspace 或长期记忆。

涉及跨域任务时，默认由CTO协调；OpenClaw 治理类问题找架构师。

对外部平台、账号风险或不可逆业务动作，必须确认 Boss 授权后再派发执行。

## 上下文恢复

单世界线模式下，大多数对话上下文已在当前 session 中。如果当前会话仍缺少来龙去脉：

1. 检索本 agent 记忆：`MEMORY.md`、`memory/`、`memory_search`，关键词包括发件 agent、任务名、taskId、项目名、文件路径。
2. 涉及正式任务时，优先核对 `task_collab` 台账。
3. 仍无法还原背景时，直接向发件 agent 追问，说明已检索的范围；不编造上下文。

使用其他 agent 发来的 session 内容时，简要说明上下文来源；不得把其他 agent 的 workspace 当成本 agent 的长期记忆。
