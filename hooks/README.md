# Hooks

Hooks 在 OpenClaw 的 `agent:bootstrap` 事件时触发，实现规则自动注入。

## company-guidelines

**作用**：读取 `~/.openclaw/company-info/company-hard-rules.md`，在 bootstrap 时将其内容注入到每个非 main agent 的 `AGENTS.md` 前面。

**效果**：公司规则改一处，所有 Agent 下次启动时自动生效。无需逐个修改 Agent 的 workspace 文件。

**幂等性**：通过标记字符串检测，已注入则跳过。

## self-improvement

**作用**：在 bootstrap 时注入一段轻量提醒，让 Agent 记住"只记录有复用价值的教训"。

**配合**：与 `skills/self-improvement` 技能配合使用，形成 capture -> promote -> extract 闭环。

## 安装

```bash
# 复制到 OpenClaw hooks 目录
cp -r hooks/company-guidelines ~/.openclaw/hooks/
cp -r hooks/self-improvement ~/.openclaw/hooks/

# 创建公司规则文件（company-guidelines 依赖此文件）
mkdir -p ~/.openclaw/company-info
# 参考 docs/getting-started.md 中的模板
```

## 扩展

Hook 处理器接收 `agent:bootstrap` 事件，可以访问 `event.context.bootstrapFiles` 数组。你可以：

- 添加更多 hook 实现其他自动注入逻辑
- 修改 `handler.ts` / `handler.js` 调整注入条件
- 添加新的 `events` 触发点
