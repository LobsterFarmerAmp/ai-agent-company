# CTO Agent 配置 - 林知衡 (lin-zhiheng)

> 配置时间：2026-08-05
> 配置人：架构师 (main)

## Agent 信息

| 字段 | 值 |
|------|-----|
| Agent ID | `lin-zhiheng` |
| 姓名 | 林知衡 |
| 职位 | 首席技术官（CTO） |
| 等级 | 1（管理者） |
| 上级 | Boss |
| 模型 | volcengine-agent/glm-5.2 |
| Thinking | high |
| Workspace | `~/.openclaw/workspace-lin-zhiheng` |

## 命名含义

- **林**：常见姓氏
- **知**：智慧、洞察
- **衡**：权衡、判断

CTO 的核心价值是凭洞察做权衡决策 - 拆需求、定标准、判优先级。

## 组织定位

```
Boss（CEO）[0级]
├── 架构师 (main) [1级] - 平台治理、Agent 配置、基础设施
└── 林知衡 (lin-zhiheng) [1级] - 项目管理、任务分配、对外对接
```

- 与架构师平级，各管一摊
- 架构师管平台和环境，CTO 管项目和业务
- 后续 2 级 Agent（数据工程师、后端工程师、文案策划）将由 CTO 直接管理

## Workspace 文件

```
~/.openclaw/workspace-lin-zhiheng/
├── AGENTS.md      # 工作区说明 + 操作规则
├── SOUL.md        # 人格定义
├── IDENTITY.md    # 身份信息
├── MEMORY.md      # 长期记忆
├── TOOLS.md       # 工具笔记
├── USER.md        # Boss 信息
├── HEARTBEAT.md   # 心跳模板（空）
└── memory/        # 日志目录
```

## 配置步骤

1. 创建 workspace 目录 `~/.openclaw/workspace-lin-zhiheng/`
2. 基于 `templates/` 写入 6 个核心文件 + HEARTBEAT.md
3. 在 `openclaw.json` 的 `agents.list` 添加 agent 条目
4. 重启 Gateway 使配置生效

## openclaw.json 配置

```json
{
  "id": "lin-zhiheng",
  "name": "林知衡",
  "workspace": "/Users/amphilagusgu/.openclaw/workspace-lin-zhiheng",
  "model": {
    "primary": "volcengine-agent/glm-5.2"
  },
  "thinkingDefault": "high"
}
```

- 模型与架构师相同（glm-5.2），后续可按需调整
- memorySearch 继承 defaults（ollama + qwen3-embedding:4b）
- imageModel 继承 defaults（kimi-k3）
- skills 暂不设限，后续按组织架构分配

## 待办

- [ ] 安装公司技能（company-* skills）到 OpenClaw skills 目录
- [ ] 安装公司规则 Hook（company-guidelines）
- [ ] 配置 CTO 的 IM 通道（飞书等）
- [ ] 配置 heartbeat 定期任务
- [ ] 后续按需创建 2 级 Agent
