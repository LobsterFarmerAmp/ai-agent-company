# Agent 配置指南

> 配置新 Agent 的标准操作规程。

## 前置条件

- 已有 `main` agent（架构师）正常运行
- 治理仓库 `~/.openclaw/company/ai-agent-company` 已部署
- 模板目录 `templates/` 可用

## 配置流程

### 1. 命名

- Agent ID：中文名拼音，姓氏全拼 + 名字拼音，用连字符连接
- 中文名：有寓意，名字反映职责特质

### 2. 创建 Workspace

```bash
mkdir -p ~/.openclaw/workspace-<agent-id>/memory
```

### 3. 写入人设文件

基于 `templates/` 目录的模板，写入以下文件：

| 文件 | 作用 | 关键字段 |
|------|------|----------|
| `IDENTITY.md` | 身份信息 | 姓名、Agent ID、职位、等级、上级 |
| `SOUL.md` | 人格定义 | Core、Judgment、Collaboration、Boundaries |
| `AGENTS.md` | 工作区说明 | Governance、Startup、Operating Rules |
| `MEMORY.md` | 长期记忆 | Durable Facts、Cross-Agent、Standing Rules、Hard Rules |
| `TOOLS.md` | 工具笔记 | Key Paths、Useful Commands、Operating Notes |
| `USER.md` | Boss 信息 | Name、称呼、Role、Timezone、Context |
| `HEARTBEAT.md` | 心跳模板 | 默认只放注释，保持关闭 |

### 4. 注册 Agent 到 openclaw.json

在 `agents.list` 数组添加条目：

```json
{
  "id": "<agent-id>",
  "name": "<中文名>",
  "workspace": "/Users/<user>/.openclaw/workspace-<agent-id>",
  "model": {
    "primary": "volcengine-agent/glm-5.2"
  },
  "thinkingDefault": "high",
  "identity": {
    "name": "<中文名>",
    "emoji": "<emoji>"
  }
}
```

**关键点：**

- `identity.name` 必须显式设置，否则 dashboard 显示为 "assistant"
- `identity.emoji` 用于 dashboard 和消息中的视觉标识
- `name` 和 `identity.name` 都要设
- `model` 通常与默认 agent 相同，后续按需调整
- `memorySearch`、`imageModel` 等继承 defaults，无需重复

### 5. 受保护路径注意

`agents.list[].identity.*` 和 `agents.defaults.heartbeat.*` 是受保护路径，`config.patch` 无法修改，必须直接编辑 `openclaw.json` 后重启。

### 6. 重启 Gateway

```bash
# 通过 gateway 工具重启
gateway restart
# 或 CLI
openclaw restart
```

### 7. 验证

```bash
openclaw status
# 检查：
# - Agents 数量正确
# - Heartbeat 状态正确（当前统一关闭 = disabled）
# - 无 bootstrapping 错误
```

在 dashboard 中打开新 agent 的对话，确认：
- 显示名称正确（不是 "assistant"）
- 能正常对话
- 模型正确

### 8. 记录到 setup/

为每个新 agent创建配置记录文档 `setup/<role>-agent-<id>.md`，包含：
- Agent 信息表
- 命名含义
- 组织定位
- Workspace 文件结构
- 实际 openclaw.json 配置
- 待办事项

### 9. 更新默认 agent 的记忆文件

- 更新 `MEMORY.md` 的 `Cross-Agent Collaboration` 段
- 更新 `memory/YYYY-MM-DD.md` 日志

### 10. 提交治理仓库

```bash
cd ~/.openclaw/company/ai-agent-company
git add setup/<role>-agent-<id>.md setup/README.md
git commit -m "setup: 配置 <角色> Agent <中文名> (<agent-id>)"
```

## 常见问题

### Dashboard 显示 "assistant" 而非 agent 名称

原因：未设置 `identity.name`。

修复：在 `openclaw.json` 的 agent 条目中添加 `identity: { name: "<中文名>", emoji: "<emoji>" }`，重启。

### config.patch 报错受保护路径

`agents.list[].identity.*`、`agents.defaults.heartbeat.*` 等路径受保护，必须直接编辑 `openclaw.json` 文件后重启。

### 新 agent 的 heartbeat 默认开启

`agents.defaults.heartbeat.every` 默认 `30m`。如需关闭，设为 `"0m"`。当前已全局关闭。

## 心跳配置

当前策略：统一关闭（`agents.defaults.heartbeat.every = "0m"`）。

后续如需开启某个 agent 的心跳，在 `openclaw.json` 该 agent 条目下添加：

```json
"heartbeat": {
  "every": "30m"
}
```

注意：一旦任何 agent 定义了 `heartbeat` 块，只有那些 agent 运行心跳。
