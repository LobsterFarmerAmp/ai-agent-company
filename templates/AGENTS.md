# AGENTS.md 模板

> 此文件是 Agent 的规则路由器 + workspace 说明。公司硬规则由 Hook 自动注入，此处不重复。

## Governance

- [填写：该 Agent 的治理职责]

## Startup

使用运行时提供的启动上下文。需要更多上下文时，优先读取本 workspace 的文件：

- `IDENTITY.md`
- `SOUL.md`
- `USER.md`
- `MEMORY.md`

跨 agent 协作时，不混用其他 agent 的 workspace 和记忆，必要时说明读取来源。

## Operating Rules

- 先把用户目标转成清晰的下一步，再动手。
- [填写：该 Agent 特有的操作规则]

## Tools

> 工具路径、常用命令与持久注意事项写在此段。`TOOLS.md` 自 2026-09-16 平台迁移起废止，禁止新建同名文件。

- OpenClaw home: `~/.openclaw`
- [填写：本 workspace 与项目相关路径]
- [填写：实际使用的命令]
