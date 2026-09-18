# 治理规范速查手册

> 作者：宪章（xian-zhang，治理规范专员）
> 适用对象：公司全员（架构师、CTO、工程师、新入职 agent）
> 关联任务：`aa45d825-0638-48c1-b135-55f0dc09c783`
> 版本：v1.0（2026-08-08）
> 维护原则：本手册是**检索入口**而非规则本体；所有条目最终以 `~/.openclaw/company-info/company-hard-rules.md` + `docs/governance.md` + 公告板为权威源，手册条目变更需引用源头 commit/PR

> **⚠ 版本状态（2026-09-19）**：本手册为 **v1.0（2026-08-08，软件版）**，早于公司硬规则 **v2.0（数学研究版，2026-09-17 生效）**。下方 **一、任务管理 / 二、代码工程 / 四、文档规则** 三板块中与 v2.0 冲突的条目已就地标 `[DEPRECATED]`；**全篇 v2.0 重写列入批 B**（架构师签）。检索时以 `company-hard-rules.md`（唯一硬规则源）为准。

---

## 0. 使用方法（结论先行）

**结论**：本手册按"板块 → 条目 → 出处 → 一句话动作"组织，每条目都是**单一可执行动作**，检索路径：**场景关键词 → 板块 → 条目编号**。

**维护规则**：
- 任何规则变更必须**先改源文件 + 发公告 + 再回写本手册条目**（双线维护）；
- 条目数 ≥10，源文件新增条款时 24h 内补条目；
- 出处一律写**绝对路径 + 行号 / 公告 ID / commit hash**，便于机器检索。

---

## 一、任务管理板块（5 条）

### T1. Valid Proof 三要素（数学版）

- **结论**：提交任务必须同时附三项证据——**出处可查**（远端仓 + 分支 + commit hash）、**文档可编译**（`latexmk -pdf` 退出码 0）、**结论已独立复核**（不得自验，须第二名推导员重推或数值点验吻合，复核记录随任务提交）。
- **出处**：`company-hard-rules.md § 一·3`（数学研究版 v2.0，2026-09-17 生效）
- **动作**：提交前自测 3 项，缺一项不提交。
- **[DEPRECATED]**：旧表述「`root pnpm test` 退出码 0 / 不是 mock / 不是 dummy key」已随 v2.0 作废（见 C3）。

### T2. 阻塞处理

- **结论**：发现阻塞**立即**调 `company_task_block`，不等下次 progress；解除用 `company_task_unblock`。
- **出处**：`company-hard-rules.md § 一·2` + Company OS 工具 `company_task_block` / `company_task_unblock`
- **动作**：block 时填真实原因，不写"等验收"占位。

### T3. 子任务拆分标准

- **结论**：多包/多模块并行 → 拆子任务；单模块直接做 + progress；**估算 >2h 必须拆**。
- **出处**：`company-hard-rules.md § 一·5`
- **动作**：拆前先评估时长和并行面，避免无意义细分。

### T4. 进度汇报频率

- **结论**：每天至少一次 `company_task_progress`，内容含"已完成 / 进行中 / 阻塞"三段。
- **出处**：`company-hard-rules.md § 一·1`
- **动作**：assigned 超 24h 未 start、或 in_progress 超 48h 无 progress，会被自动催办。

### T5. L1 独立核验

- **结论**：L1 验收子任务前必须亲自核验交付物（跑 test、查 commit、看文件），不盲信 progress 报告。
- **出处**：`company-hard-rules.md § 一·4` + `docs/governance.md § 4.子 Agent 核验`
- **动作**：4 步核验清单：`git rev-parse HEAD` / `git log --oneline -5` / `git show <hash> --stat` / 读任务详情。

---

## 二、代码工程板块（5 条）

### C1. 分支命名

- **结论**：分支一律 `{agent-id}/feature-name`，例：`xian-zhang/governance-cheatsheet`。
- **出处**：`company-hard-rules.md § 二·1`
- **动作**：禁止 `main`/`develop`/`test` 直推，必须开特性分支。

### C2. Conventional Commits

- **结论**：提交信息用 `type(scope): subject`，type ∈ {feat / fix / docs / refactor / test / chore}。
- **出处**：`company-hard-rules.md § 二·2`
- **动作**：subject 中文 ≤30 字；正文写 why/what/影响范围；关联任务时引用 taskId。
- **注**：v2.0 § 二·2 已改用 `deriv: / proof: / lit: / num:` 提交前缀（替代 Conventional Commits），全篇口径待批 B 重写。

### C3. [DEPRECATED] 验收硬线：root pnpm test 全绿

- **[DEPRECATED]**：`pnpm test` 全绿**不再是验收线**（公司硬规则 v2.0 § 二·3 明文作废）。
- **现行验收线**：见 **T1**（数学版 Valid Proof 三要素：出处可查 / `latexmk -pdf` 退出码 0 / 独立复核）。
- **出处**：`company-hard-rules.md § 二·3`（v2.0：`pnpm test` 不再是验收线）
- **动作**：不要再以 pnpm test 作为验收依据。

### C4. L2→L1 Review 流程

- **结论**：L2 提交 → L1 review 后合并；L2 之间不互评；跨板块 review 仅在接口契约变更时需要。
- **出处**：`company-hard-rules.md § 二·4`
- **动作**：跨板块 review 触发条件 = 接口（DTO / API / schema）变更；纯内部实现不需要对方 review。

### C5. [DEPRECATED] Coding Agent 强制使用

- **[DEPRECATED]**：「强制委派」条款已**作废**（公司硬规则 v2.0 § 七·1 明文作废，数学解析推导不适用）。
- **现行口径**：**自愿使用**——脚本 / 绘图 / 数据处理 / 工具代码类任务可自愿使用 coding-agent 技能（启动前读 `coding-agent/SKILL.md`，`background:true`，prompt 写临时文件，带 notification route，用 `process` 监控，不盲目 kill）；禁止 worker 失败/卡住时静默改为手写而不上报。
- **出处**：`company-hard-rules.md § 七`（v2.0）
- **动作**：不再以本条目要求逐行编码或 PR 流程。

---

## 三、沟通与会议板块（4 条）

### M1. 开会 vs 直接消息判定

- **结论**：方案讨论 / 多人协作对齐 → 开会；单人任务分配 / 进度催办 → 消息 + 任务系统；规则制定 / 重大决策 → 讨论会 → Boss 批准。
- **出处**：`company-hard-rules.md § 三·1`
- **动作**：发起前自问 3 句：是不是多人？是不是方案分歧？是不是规则/决策？

### M2. 会议轮数上限

- **结论**：讨论会 ≤3 轮发言；任务会 ≤5 轮。**超了说明议题没拆清楚**。
- **出处**：`company-hard-rules.md § 三·2`
- **动作**：主持人及时收束，不为凑轮次继续讨论。

### M3. 会议表达格式

- **结论**：每条发言"**结论先行**"，默认结构 = 结论 + 最多 3 条关键依据 + 下一步/风险；正文 ≤300 字。
- **出处**：`company-hard-rules.md § 三·3`（v1.1，2026-08-07 更新）
- **动作**：禁止复述背景 / 客套铺垫 / 重复总结 / 未经要求的散漫发挥。

### M4. 单世界线沟通

- **结论**：跨 agent 通信一律走目标 agent 的 **main session**（`agent:<id>:main`），不做 peer session 隔离。
- **出处**：`docs/architecture.md § 单世界线`
- **动作**：收到消息原路回复（`sourceSession` 元数据）；不拼新 key，不反拼。

---

## 四、文档规则板块（3 条）

### D1. 必须文档化的 3 类内容

- **结论**：API 契约（contracts DTO）/ 架构决策（为什么这么分）/ 环境配置（需要哪些 key）—— **必须**文档化。
- **出处**：`company-hard-rules.md § 四·1`
- **动作**：缺一项即视为任务未完成。

### D2. 文档存放位置

- **结论**：各仓库 `README.md` + `AGENTS.md`，**不搞独立文档库**。
- **出处**：`company-hard-rules.md § 四·2`
- **动作**：新增文档前先确认仓库结构；不要建 Confluence / 飞书文档库等独立源。

### D3. 文档更新时机

- **结论**：代码合并时**同步**更新文档（双线维护原则）。
- **出处**：`company-hard-rules.md § 四·3` + `docs/maintenance.md § 协作流程`
- **动作**：PR 描述里写"已同步 docs/.../X.md"，缺则 review 不通过。

---

## 五、凭据管理板块（3 条）

### S1. 凭据来源与可用范围

- **结论**：任务派发时必须**明确** key 的来源和可用范围；Keychain 里的 key 标注用途和账户。
- **出处**：`company-hard-rules.md § 五·1,2` + 公告 `3a3843af-a051-4485-8d29-99b69afe6bc7`（公司规则 v1.0）
- **动作**：派发任务时在 description 写明 `key 来源：<keychain name>` + 用途边界。

### S2. 环境变量命名规范

- **结论**：环境变量名**统一规范**：大写、下划线分隔（如 `OPENCLAW_GATEWAY_TOKEN`、`MINIMAX_API_KEY`）。
- **出处**：`company-hard-rules.md § 五·3`
- **动作**：新增 env var 前查现有命名，避免 `token` / `Token` / `TOKEN` 混用。

### S3. 凭据写入禁令

- **结论**：禁止在仓库 / 日志 / Agent 人设文件中写入**明文**密钥、cookie、token、授权码；统一使用环境变量 / Keychain / Secret provider。
- **出处**：`company-hard-rules.md § 五·3` + `docs/maintenance.md § 安全边界` + `hooks/company-guidelines/HOOK.md`
- **动作**：commit 前 `git diff` 自查；发现明文立刻 `git reset` + 改用 env。

---

## 六、跨条目速查表（按动作反查条目）

| 我要做... | 看哪一条 |
|----------|---------|
| 提交任务 | T1 + T5 |
| 阻塞上报 | T2 |
| 拆子任务 | T3 |
| 开新分支 / commit | C1 + C2 |
| 跑测试验收 | C3 |
| 跨板块 PR | C4 |
| 写代码前评估工具 | C5 |
| 发起会议 | M1 + M2 |
| 写会议发言 | M3 |
| 跨 agent 沟通 | M4 |
| 新增 / 修改文档 | D1 + D2 + D3 |
| 任务派发带 key | S1 + S3 |
| 新增 env var | S2 |

---

## 七、出处索引（机器可检索）

| 文件 / 公告 | 路径 / ID | 引用条目 |
|------------|----------|---------|
| 公司硬规则 v2.0（唯一硬规则源） | `~/.openclaw/company-info/company-hard-rules.md` | T1-T5, C1-C5, M1-M4, D1-D3, S1-S3 |
| 公司规则 v1.0 公告 | `3a3843af-a051-4485-8d29-99b69afe6bc7` | S1 |
| 治理铁律 12 条 | `docs/governance.md` | T5 |
| 架构设计（单世界线） | `docs/architecture.md` | M4 |
| 维护协作约定 | `docs/maintenance.md` | D3, S3 |
| Company OS 工具（操作权威源） | `company_task_*` / `company_org_*` / `company_meeting_*` / `company_notice_*` / `company_inbox` | T2, M1-M4 |
| 岗位定义 | `~/.openclaw/company-info/role-requirements/*.md` | 组织/岗位相关条目 |
| 人设审查技能（自研 owned） | `skills/persona-audit/` | 人设相关 |
| 学习闭环技能（上游安装 upstream） | `self-improving-agent`（ClawHub pskoett v4.0.1） | 学习/教训相关 |
| Hook：公司规则注入 | `hooks/company-guidelines/HOOK.md` | S3 |

---

## 八、维护与升级

- **新增规则**：改源文件 → 发公司公告 → 在本手册补条目（含出处） → 提交 PR review；
- **条目过期**：源文件被取代/废弃时，对应条目标记 `[DEPRECATED]` 并指明替代条目；
- **季度审计**：治理岗每季度扫一遍"所有 agent 是否遵守本手册"，审计结果发治理简报公告。

> 本手册 v1.0 共 **20 条**（T×5 + C×5 + M×4 + D×3 + S×3），覆盖任务管理 / 代码工程 / 沟通会议 / 文档 / 凭据 5 大板块；超出验收标准 ≥10 条的下限，每条均含出处。
