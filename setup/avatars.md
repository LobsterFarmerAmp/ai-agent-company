# 头像与私有资产约定

> 本文档是**约定与规则**，不含任何头像图片。头像文件是个人/公司私有资产，**禁止提交到本手册仓库**。

## 原则

本仓库是**说明手册**，不是资产仓库。个人头像、私人图片、公司私有资料一律不进入本仓库；仓库内的文档只描述"规则与路径"，不存放实际二进制资产。

## 头像存放位置

| 位置 | 内容 | 可见性 |
| --- | --- | --- |
| `~/openclaw/.../workspace-<agentId>/assets/avatars/` | 每个 Agent 的**活动头像**（由各自 `IDENTITY.md` 引用） | 本地，私有 |
| `~/.openclaw/avatars/agents/<agentId>.png` | 本地主库：每个 Agent 的头像规范副本（含 `boss.png`） | 本地，私有 |
| `~/.openclaw/avatars/candidates/` | 未启用的候选/备用头像（按原名保留） | 本地，私有 |

## 规则

1. **唯一性**：每个 Agent 的头像必须唯一，禁止撞车（两个 Agent 不能用同一张图）。新增/更换头像前用 `md5` 对比，确认与现有全部头像不同。
2. **主库为准**：`~/.openclaw/avatars/agents/<agentId>.png` 是头像的唯一权威副本；workspace 里的文件是运行时副本，改头像时两者同步。
3. **候选进 candidates/**：暂时不用的备用头像放入 `~/.openclaw/avatars/candidates/`，按内容去重后保留，命名带可读名称。
4. **不提交手册仓库**：任何头像 PNG 不得 `git add` 进 `ai-agent-company` 仓库。手册只允许出现路径与规则描述。
5. **去重**：候选图片入库前先 `md5` 排重，同一图只保留一份。

## 快速核验

```bash
# 检查所有 Agent 头像是否唯一（应每个 hash 出现一次）
md5 -q ~/.openclaw/avatars/agents/*.png | sort | uniq -c | sort -rn
```