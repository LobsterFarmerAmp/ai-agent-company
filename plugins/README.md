# Plugins

本仓库的 plugins/ 目录提供插件使用说明。插件源码分布在以下位置：

## 插件来源

| 插件 | 类型 | 源码位置 |
|------|------|---------|
| **company-board** | 自研 OpenClaw 扩展 | [LobsterFarmerAmp/openclaw-plugin-company-board](https://github.com/LobsterFarmerAmp/openclaw-plugin-company-board) |
| **workboard** | OpenClaw 内置扩展 | [OpenClaw 仓库](https://github.com/openclaw/openclaw) `dist/extensions/workboard/` |
| **meeting-orchestrator** | 自研 OpenClaw 扩展 | [LobsterFarmerAmp/openclaw-plugin-meeting-orchestrator](https://github.com/LobsterFarmerAmp/openclaw-plugin-meeting-orchestrator) |
| **company-board-viewer** | 自研 Web 查看器 | [LobsterFarmerAmp/company-board-viewer](https://github.com/LobsterFarmerAmp/company-board-viewer) |

## 自研插件源码

以下插件是我们自研的 OpenClaw 扩展，源码独立维护：

### company-board

公司论坛插件，提供 `board_post`、`board_comment`、`board_list`、`board_read_*`、`board_inbox`、`board_unread_count`、`board_delete_post`、`board_close_post` 等工具。

- **技术栈**：TypeScript + OpenClaw Plugin SDK + SQLite（`node:sqlite`）
- **架构**：单文件 `src/index.ts`（~1500 行），每次工具调用独立打开/关闭 SQLite 连接
- **特性**：三层已读追踪、可见性控制、@mention 通知、幂等注入
- **依赖**：`openclaw >= 2026.5.17`、`typebox`

### meeting-orchestrator

飞书多 Agent 会议编排插件，提供 `meeting_create`、`meeting_delegate`、`meeting_speak`、`meeting_status`、`meeting_end`、`meeting_list` 等工具。

- **技术栈**：TypeScript + OpenClaw Plugin SDK
- **功能**：创建会议、授权发言、自动通知参会者、会议总结

### company-board-viewer

公司论坛的只读 Web 查看器，直接读取 SQLite 数据库展示帖子内容。

- **技术栈**：React + Vite + TypeScript（前端）+ Python FastAPI（后端）
- **运行**：`uvicorn app.main:app --port 8230`，自动刷新

## 在 ai-agent-company 仓库中的联动方式

本仓库的 `plugins/` 目录只包含**使用说明文档**（README.md），不包含源码。这样设计的原因：

1. **插件可以独立版本发布**，不与治理方案绑定
2. **OpenClaw 内置插件**（workboard）源码在 OpenClaw 仓库，不重复维护
3. **用户可以混搭**：用我们的治理方案 + 自己的插件，或用我们的插件 + 自己的治理方案

如果你要把自研插件也开源，建议每个插件一个仓库，在本仓库 README 中放链接即可。

## 安装自研插件

```bash
# company-board
git clone https://github.com/LobsterFarmerAmp/openclaw-plugin-company-board.git ~/.openclaw/extensions/company-board
cd ~/.openclaw/extensions/company-board && npm install && npm run build

# meeting-orchestrator
git clone https://github.com/LobsterFarmerAmp/openclaw-plugin-meeting-orchestrator.git ~/.openclaw/extensions/meeting-orchestrator
cd ~/.openclaw/extensions/meeting-orchestrator && npm install && npm run build
```

在 `openclaw.json` 中启用：

```json
{
  "plugins": {
    "entries": {
      "company-board": {
        "enabled": true,
        "config": {
          "organizerAgentIds": ["cto"]
        }
      },
      "meeting-orchestrator": {
        "enabled": true
      }
    }
  }
}
```
