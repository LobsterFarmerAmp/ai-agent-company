# Hooks 配置

> 配置日期：2026-08-04  
> 执行者：架构师

## 已启用 Hooks

### compaction-notifier（内置）

- **事件**：`session:compact:before`、`session:compact:after`
- **作用**：会话压缩时发送聊天通知，避免等待时困惑
- **安装方式**：`openclaw hooks enable compaction-notifier`

### self-improvement（项目自带）

- **事件**：`agent:bootstrap`
- **作用**：bootstrap 时注入教训记录提醒，配合 self-improving-agent skill 形成 capture -> promote -> extract 闭环
- **安装方式**：
  ```bash
  cp -r hooks/self-improvement ~/.openclaw/hooks/self-improvement
  openclaw hooks enable self-improvement
  ```

## 待启用 Hooks

### company-guidelines（项目自带）

- **事件**：`agent:bootstrap`
- **作用**：读取 `~/.openclaw/company-info/company-hard-rules.md`，注入公司硬规则到每个 Agent 的 AGENTS.md
- **前置条件**：公司规则内容确定后，创建 `company-hard-rules.md`
- **启用方式**：
  ```bash
  cp -r hooks/company-guidelines ~/.openclaw/hooks/company-guidelines
  openclaw hooks enable company-guidelines
  ```

## 其他内置 Hooks（暂未启用）

| Hook | 作用 | 启用条件 |
|------|------|---------|
| `session-memory` | `/new` `/reset` 时保存会话上下文 | 按需 |
| `command-logger` | 记录所有命令到日志 | 按需 |
| `boot-md` | 启动时执行 BOOT.md | 按需 |
| `bootstrap-extra-files` | 按 glob 注入额外 bootstrap 文件 | 按需 |

## 配置变更

启用 hook 后需要重启 Gateway 才能生效：

```bash
openclaw gateway restart
```
