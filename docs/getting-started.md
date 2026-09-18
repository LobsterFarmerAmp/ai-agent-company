# 快速上手

本次 `jia-goushi` 架构师部署的可执行基础配置、Keychain 解析脚本和初始化进度统一维护在 [`../bootstrap/`](../bootstrap/README.md)。本文件保留通用安装流程。

## 前置条件

1. 安装 [OpenClaw](https://github.com/openclaw/openclaw)
2. 创建至少 2 个 Agent（1 个管理者 + 1 个执行者）
3. 配置好飞书或其他 IM 通道（可选但推荐）

## 步骤一：设置组织架构

组织架构**不由技能承载**，权威源 = `~/.openclaw/company-info/role-requirements/*.md`（岗位定义）+ 公告板。启用 Company OS 后（见步骤五），用 `company_org_*` 工具维护成员、职位、层级、汇报关系。

```text
# 不要用 cp -r 部署 company-org-chart（该技能为 legacy / repo-only，不部署）
# 组织架构走：company_org_add / company_org_update / company_org_list
```

## 步骤二：安装公司规则 Hook

1. 在 `~/.openclaw/company-info/company-hard-rules.md` 建立硬规则文件（唯一源，见文末指针）
2. 安装 company-guidelines hook

```bash
mkdir -p ~/.openclaw/company-info ~/.openclaw/hooks
cp -r hooks/company-guidelines ~/.openclaw/hooks/
```

3. 安装 self-improvement hook

```bash
cp -r hooks/self-improvement ~/.openclaw/hooks/
```

## 步骤三：安装技能

**不存在通配符批量安装。** 按技能来源分三类，逐技能、显式、可核验地部署（分类判据与名册见 [`../skills/README.md`](../skills/README.md)）：

- **自研（owned）**：先 `diff -r` 比对仓内与 live，确认差异为口径类后**合并**，**禁止整体覆盖**。
  ```bash
  diff -r skills/persona-audit ~/.openclaw/skills/persona-audit
  ```
- **上游安装（upstream）**：**不部署**仓内副本；需要时走 ClawHub 安装。
  ```bash
  openclaw skills install @pskoett/self-improving-agent
  ```
- **仓内未部署（repo-only）**：**不部署**，仅存档（含全部 legacy `company-*` 技能）。

本次部署约定 `jia-goushi` Agent 担任首席架构师。不要在 Hook 或技能路由中排除 `jia-goushi`；它与其他 Agent 一样接收公司规则。

## 步骤四：创建 Agent 人设

为每个 Agent 创建 workspace，使用 `templates/` 下的模板：

```bash
# 为每个 agent 创建 5 个核心文件（TOOLS.md 已废止，不创建）
mkdir -p ~/.openclaw/workspace-<agent-id>
cp templates/AGENTS.md ~/.openclaw/workspace-<agent-id>/
cp templates/SOUL.md ~/.openclaw/workspace-<agent-id>/
cp templates/IDENTITY.md ~/.openclaw/workspace-<agent-id>/
cp templates/MEMORY.md ~/.openclaw/workspace-<agent-id>/
cp templates/USER.md ~/.openclaw/workspace-<agent-id>/
```

编辑每个文件，填入该 Agent 的具体信息。

## 步骤五：启用 Company OS

Company OS 是独立插件，需要配置加载路径后启用。在 `openclaw.json` 中添加：

```json
{
  "plugins": {
    "load": {
      "paths": [
        "/path/to/openclaw-plugin-company-os"
      ]
    },
    "entries": {
      "company-os": {
        "enabled": true
      }
    }
  }
}
```

> 插件源码位于 `~/.openclaw/company/openclaw-plugin-company-os`，由架构师负责开发和维护。

启用后，以下工具自动可用：
- `company_task_*` -- 任务创建、启动、进度、提交、验收、阻塞、重派、取消、修订
- `company_meeting_*` -- 会议申请、授权发言、发言、结束、查看、取消
- `company_notice_*` -- 公告发布、列表、阅读
- `company_org_*` -- 成员管理、组织架构
- `company_inbox` -- 统一收件箱

## 步骤六：配置心跳任务（可选）

编辑 `HEARTBEAT.md`，设置定期检查收件箱等任务：

```bash
cp templates/HEARTBEAT.md ~/.openclaw/workspace-<agent-id>/
```

## 步骤七：验证

1. 重启 OpenClaw Gateway
2. 检查 Hook 是否正确注入：与某个 Agent 对话，确认它知道公司规则
3. 测试任务派发：管理者创建任务 -> 执行者 company_task_start -> submit -> 管理者 review
4. 测试公告：管理者 company_notice_publish -> 确认所有 Agent 可通过 company_notice_list 看到
5. 测试会议：管理者 company_meeting_request -> delegate 授权发言 -> 参会者 speak -> end 总结

## 公司硬规则：唯一源

公司硬规则**只存在于** `~/.openclaw/company-info/company-hard-rules.md`（由 hook 注入各 agent 的 `AGENTS.md`）。

**本仓不存内嵌副本**——避免出现与源文件漂移的第二份规则文本。查看现行规则请直接读源文件；规则变更走「改源文件 → 发公司公告 → 回写引用它的文档」。

## 下一步

- 阅读 [`docs/overview.md`](overview.md) 理解体系全景
- 阅读 [`docs/architecture.md`](architecture.md) 理解架构设计
- 阅读 [`docs/governance.md`](governance.md) 理解治理铁律
- 参考 [`examples/org-chart-example.md`](../examples/org-chart-example.md) 设计你的组织架构
