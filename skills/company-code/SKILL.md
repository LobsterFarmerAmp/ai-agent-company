---
name: "company-code"
description: "公司代码规则：uv优先、coding-agent派发、Codex review优先、最小变更、凭据保护、验证要求、git流程、<project-name> 仓库治理"
---

# 公司代码规则

触发条件：写代码、改代码、运行测试、安装依赖、提交/推送代码、派发 coding-agent/Codex 工程任务；进入或操作 <project-name> 项目。

## 必须遵守

1. 先读现状：确认项目路径、README/AGENTS/TOOLS、依赖管理方式、git 状态。
2. Python 项目统一使用 `uv`：
   - 运行脚本优先 `uv run ...`
   - 安装/同步依赖优先 `uv sync`
   - 新 Python 项目优先 `uv init`
3. 复杂工程任务优先使用 `coding-agent` 技能派发 Codex；简单单文件/小改动直接完成。
4. 如果接到使用 Codex 的指令，就必须使用 Codex。即使你认为改动不复杂也不能绕开 Codex 直接改。
5. 使用 Codex 时命令必须包含：`codex exec --sandbox workspace-write`。
6. **复杂代码 review 必须派发 Codex**：涉及多文件、架构判断、安全风险、性能影响或超过 50 行的代码审查，agent 不得自行 review。必须将代码上下文和审查目标派发给 Codex，agent 根据 Codex review 结果做决策和后续行动。
7. **复杂编码任务只定方向，不定实现**：派发 Codex 编码任务时，agent 只提供：
   - **上下文**：项目背景、相关文件、依赖关系、约束条件
   - **大致方法**：推荐的技术路线或架构思路（如"用异步队列解耦"），不写具体代码或伪代码
   - **最终目标**：期望的输出、验收标准、边界条件
   - **禁止**：逐行指导、具体 API 调用方式、变量命名、代码结构细节
8. 代码变更必须最小化，不做无关重构，不顺手改无关格式。
9. 不写明文密钥、cookie、token、授权码；需要凭据时使用环境变量。
10. 变更后必须做最小验证：测试、lint、typecheck、build、脚本 smoke test 或直接检查。
11. 涉及共享项目时遵守 git 流程：add → commit → push；禁止跨 workspace 直接拷贝作为协作方式。

## 项目仓库治理

### <project-name>

- **Remote**：`https://github.com/<github-org>/<project>.git`（GitHub private）
- **Default branch**：`main`
- **治理状态**：自 2026-07-02 T1（commit `fc020aa`）起纳入标准 push 治理；**废弃** 2026-06-13 “无 remote 则 commit+tag 即完成”的旧决议。
- **新 agent 首次接手**：若本 workspace `projects/<project-name>/.git/config` 无 `[remote "origin"]`，需先执行：
  ```bash
  git remote add origin https://github.com/<github-org>/<project>.git
  git fetch origin
  git branch --set-upstream-to=origin/main main
  ```
- **所有 <project-name> 代码变更**：必须 add → commit → push 到 `origin/main`（或 PR 分支），不再允许“仅本地 commit”。

## 开工前检查

- 当前目录是否是目标项目？
- 是否存在 `.git`？git 状态是否干净？
- 依赖管理器是什么？是否为 Python 项目且应使用 `uv`？
- 这次改动是否需要派发 coding-agent？
- **如果是复杂 review（多文件/架构/安全/性能/>50行），是否已准备派发 Codex 而非自审？**
- **如果是复杂编码任务，是否只准备了上下文/方法/目标，没有写具体实现指导？**
- 是否会触碰凭据、账号、生产数据或外部系统？如会，先确认授权。
- **若项目是 <project-name>，remote 是否已配为 `<github-org>/<project>`？**

## 完成前检查

- 交付物是否覆盖 Boss 的请求？
- 是否运行了最小验证？
- 是否有失败项或未验证项？必须明确说明。
- 需要提交/推送的项目是否已 commit/push？
- **复杂 review 是否由 Codex 完成（非 agent 自审）？**
- **复杂编码任务派发时是否只提供了方向性指导？**
