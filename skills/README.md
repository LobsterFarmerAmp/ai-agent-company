# Skills

公司技能是可复用的操作规程，每个技能对应一类常见工作场景。

## 技能列表

### 协作类

| 技能 | 触发条件 | 作用 |
|------|---------|------|
| `company-dialogue` | 跨 agent 对话、发消息 | 单世界线通信规则 |
| `company-org-chart` | 查询组织架构 | 等级、汇报关系、权限权威源 |

### 任务类

| 技能 | 触发条件 | 作用 |
|------|---------|------|
| `company-task-dispatch` | 创建任务、派活 | company_task 全流程 |
| `company-task-execution` | 收到任务、提交交付 | start -> progress -> submit |

### 工程类

| 技能 | 触发条件 | 作用 |
|------|---------|------|
| `company-code` | 写代码、改代码 | 工程规范、git 流程 |
| `company-reporting` | 工作总结、对外汇报 | 总结结构、授权规则 |

### 治理类

| 技能 | 触发条件 | 作用 |
|------|---------|------|
| `persona-audit` | 审查人设文件 | 6 文件审计 + 精简方案 |
| `self-improvement` | 犯错、纠正、发现 | capture -> promote -> extract 闭环 |

## 安装

```bash
cp -r skills/* ~/.openclaw/skills/
```

## 技能分配

按等级和职位分配技能，参考 `company-org-chart/SKILL.md` 中的技能分配表。

- **1 级（管理者）**：拥有 dispatch + execution + 所有协作和工程技能
- **2 级（执行者）**：拥有 execution + 协作技能，不拥有 dispatch

## 自定义

每个技能的 `SKILL.md` 是独立的 markdown 文件，可以直接编辑修改。技能之间通过名称引用，不需要硬编码路径。
