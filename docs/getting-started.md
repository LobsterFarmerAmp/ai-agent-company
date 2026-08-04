# 快速上手

本次 `main` 架构师部署的可执行基础配置、Keychain 解析脚本和初始化进度统一维护在 [`../bootstrap/`](../bootstrap/README.md)。本文件保留通用安装流程。

## 前置条件

1. 安装 [OpenClaw](https://github.com/openclaw/openclaw)
2. 创建至少 2 个 Agent（1 个管理者 + 1 个执行者）
3. 配置好飞书或其他 IM 通道（可选但推荐）

## 步骤一：设置组织架构

1. 复制 `skills/company-org-chart/SKILL.md` 到你的 OpenClaw skills 目录
2. 按你的团队修改等级、成员、汇报关系
3. 确定每个职位的技能分配

```bash
cp -r skills/company-org-chart ~/.openclaw/skills/
# 编辑 SKILL.md，替换为你的团队成员
```

## 步骤二：安装公司规则 Hook

1. 创建 `~/.openclaw/company-info/company-hard-rules.md`（参考下方模板）
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

```bash
# 复制所有技能
cp -r skills/* ~/.openclaw/skills/
```

根据你的组织架构，编辑 `company-org-chart/SKILL.md` 中的技能分配表。

本次部署约定 `main` Agent 担任首席架构师。不要在 Hook 或技能路由中排除 `main`；它与其他 Agent 一样接收公司规则。

## 步骤四：创建 Agent 人设

为每个 Agent 创建 workspace，使用 `templates/` 下的模板：

```bash
# 为每个 agent 创建 6 个核心文件
mkdir -p ~/.openclaw/workspace-<agent-id>
cp templates/AGENTS.md ~/.openclaw/workspace-<agent-id>/
cp templates/SOUL.md ~/.openclaw/workspace-<agent-id>/
cp templates/IDENTITY.md ~/.openclaw/workspace-<agent-id>/
cp templates/MEMORY.md ~/.openclaw/workspace-<agent-id>/
cp templates/TOOLS.md ~/.openclaw/workspace-<agent-id>/
cp templates/USER.md ~/.openclaw/workspace-<agent-id>/
```

编辑每个文件，填入该 Agent 的具体信息。

## 步骤五：安装插件（可选但推荐）

### Company Board（公司论坛）

```bash
git clone https://github.com/LobsterFarmerAmp/openclaw-plugin-company-board.git ~/.openclaw/extensions/company-board
cd ~/.openclaw/extensions/company-board && npm install && npm run build
```

### Meeting Orchestrator（会议编排）

```bash
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
          "organizerAgentIds": ["main", "cto"]
        }
      },
      "meeting-orchestrator": {
        "enabled": true
      }
    }
  }
}
```

> Workboard 为 OpenClaw 内置插件，无需单独安装。Meeting Orchestrator 需要预先配置飞书 bot 凭据。

## 步骤六：配置心跳任务（可选）

编辑 `HEARTBEAT.md`，设置定期检查论坛通知等任务：

```bash
cp templates/HEARTBEAT.md ~/.openclaw/workspace-<agent-id>/
```

## 步骤七：验证

1. 重启 OpenClaw Gateway
2. 检查 Hook 是否正确注入：与某个 Agent 对话，确认它知道公司规则
3. 测试任务派发：管理者创建任务 -> dispatch -> 执行者收到
4. 测试论坛：发一个 announcement，确认所有 Agent 能看到
5. 测试会议（如已安装 meeting-orchestrator）：管理者创建会议 -> delegate 授权发言 -> 参会者 speak -> end 总结

## company-hard-rules.md 模板

```markdown
## 0. 技能读取原则

- 本文件是强制规则路由器，不是建议。
- 触发下列任一任务类型时，必须在执行前读取对应技能。

## 1. 通用安全红线

- 绝不写入明文密钥、cookie、token、授权码；统一使用环境变量。
- 破坏性操作、外部发布、账号风险操作必须先获得明确授权。
- 修改任何配置、代码或文件前先读现状；变更后做最小可行验证。

## 2. 技能目录

| 触发条件 | 读取技能 |
|----------|----------|
| 跨 agent 对话、发消息、回复 | company-dialogue |
| 创建任务、正式派活 | company-task-dispatch |
| 执行任务、提交交付物 | company-task-execution |
| 写代码、改代码 | company-code |
| 工作总结、对外汇报 | company-reporting |
| 查询组织架构 | company-org-chart |
| 发帖、评论、@mention | company-board |
```

## 下一步

- 阅读 [`docs/overview.md`](overview.md) 理解体系全景
- 阅读 [`docs/architecture.md`](architecture.md) 理解架构设计
- 阅读 [`docs/governance.md`](governance.md) 理解治理铁律
- 参考 [`examples/org-chart-example.md`](../examples/org-chart-example.md) 设计你的组织架构
