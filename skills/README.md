# Skills

公司技能是可复用的操作规程，每个技能对应一类常见工作场景。

**本仓是技能的「部署源 / 存档」，不是所有技能的 canonical。** 每个技能的权威源按**来源**三分（见下），部署方向随类而异。

## 三类技能与判据

| 类别 | 判据 | canonical | 部署方向 | 本仓该做什么 |
|---|---|---|---|---|
| **自研（owned）** | 无 ClawHub 元数据，公司自研 | 本仓 `skills/<name>` | repo → live | 改动前先 `diff -r` 再**合并**，**禁止整体覆盖** |
| **上游安装（upstream）** | live 目录含 `.clawhub/origin.json`（`artifact.sha256` / `skillFile.sha256`） | ClawHub registry | 只走 `clawhub` 升级，**不部署** | 不得存会覆盖它的同名副本，只登记名称 / 版本 / owner |
| **仓内未部署（repo-only）** | 仓有 live 无 | 本仓（存档） | 不部署 | 仅存档 |

> **为什么禁止整体覆盖**：`skills/<name>` 与本机 `~/.openclaw/skills/<name>` 是两份独立副本，「仓 = 部署源」**不等于**「与 live 一致」。2026-09-18 实测：仓内 `persona-audit` 副本曾缺 live 独有的 role-requirements 两步，若按 `cp -r` 覆盖会**静默删掉该功能**。正确做法是 `diff -r` → 合并。归属存疑先 `git log -S "<字符串>" -- <path>`：零命中 = 从未入库。

## 技能列表

### 自研（owned）

| 技能 | 触发条件 | 作用 | 出处 |
|------|---------|------|------|
| `persona-audit` | 审查人设文件 | 5 文件审计 + 精简方案 | 本仓 canonical |
| `interrupted-task-resume` | 任务被重复派发 / turn 中途 abort | 先找已落盘进度再续跑；先写后验 | 本仓 canonical |

### 上游安装（upstream，不在本仓管理）

以下技能由 ClawHub 安装，**升级只走 `clawhub`，本仓不得存放同名副本**；此处仅登记，便于盘点。

| 技能 | owner | 版本 | 说明 |
|------|-------|------|------|
| `self-improving-agent` | pskoett | 4.0.1 | capture → promote → extract 闭环 |
| `imap-smtp-email` | gzlicanyi | 0.0.19 | live-only，无仓内对应 |

### 仓内未部署（repo-only，仅存档）

仓内有、live 上不部署，保留作历史与参考。**以下 legacy 技能仅在本表登记，其它文档不得引为规则出处或权威源。**

| 技能 | 触发条件 | 作用 | 状态 |
|------|---------|------|------|
| `company-dialogue` | 跨 agent 对话、发消息 | 单世界线通信规则 | legacy（已由 Company OS 工具取代） |
| `company-org-chart` | 查询组织架构 | 等级、汇报关系、权限权威源 | legacy（同上） |
| `company-task-dispatch` | 创建任务、派活 | company_task 全流程 | legacy（同上） |
| `company-task-execution` | 收到任务、提交交付 | start → progress → submit | legacy（同上） |
| `company-code` | 写代码、改代码 | 工程规范、git 流程 | legacy（同上） |
| `company-reporting` | 工作总结、对外汇报 | 总结结构、授权规则 | legacy（同上） |
| `self-improvement` | 犯错、纠正、发现 | capture → promote → extract 闭环 | **冻结**：上游 v4.0.0 的改名 fork，不得覆盖 live；如需推进去重整合须**换名另行立项** |

## 部署

按类别执行，**不存在一刀切的安装命令**：

- **自研**：`diff -r skills/<name> ~/.openclaw/skills/<name>` → 确认差异为口径类 → **合并**（保留 live 独有步骤）→ 两侧保持一致。
- **上游安装**：不动。需要升级时用 ClawHub 流程；本仓只维护登记表。
- **仓内未部署**：不部署。

## 技能分配

技能按来源三分（自研 / 上游安装 / 仓内未部署），分类判据、名册与部署方式见上文「三类技能与判据」。

- **1 级（管理者）**：拥有 dispatch + execution + 所有协作和工程技能
- **2 级（执行者）**：拥有 execution + 协作技能，不拥有 dispatch

> 组织架构与技能分配**不由技能承载**：组织权威源 = `company-info/role-requirements/*.md` + 公告板，操作走 `company_org_*`。

## 自定义

每个技能的 `SKILL.md` 是独立的 markdown 文件，可以直接编辑修改。技能之间通过名称引用，不需要硬编码路径。
