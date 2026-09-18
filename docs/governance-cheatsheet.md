# 治理规范速查手册

> 作者：宪章（xian-zhang，治理规范专员）
> 适用对象：公司全员（架构师、CTO、推导员、文献调研员、数值模拟员、新入职 agent）
> 关联任务：`aa45d825-0638-48c1-b135-55f0dc09c783`
> 版本：**v2.0（2026-09-19，对齐 `company-hard-rules.md` v2.0 数学研究版，2026-09-17 生效）**
> 维护原则：本手册是**检索入口**而非规则本体；所有条目最终以 `~/.openclaw/company-info/company-hard-rules.md` + `docs/governance.md` + 公告板为权威源，手册条目变更需引用源头 commit/PR

---

## 0. 使用方法（结论先行）

**结论**：本手册按"板块 → 条目 → 出处 → 一句话动作"组织，每条目都是**单一可执行动作**，检索路径：**场景关键词 → 板块 → 条目编号**。

**维护规则**：
- 任何规则变更必须**先改源文件 + 发公告 + 再回写本手册条目**（双线维护）；
- 出处一律写**绝对路径 + 行号 / 公告 ID / commit hash**，便于机器检索。

---

## 一、任务管理板块（6 条）

### T1. Valid Proof 三要素（数学版）

- **结论**：提交任务必须同时附三项证据——**出处可查**（远端仓 + 分支 + commit hash）、**文档可编译**（`latexmk -pdf` 退出码 0）、**结论已独立复核**（**不得自验**，须第二名推导员重推关键步骤或数值点验吻合，复核记录随任务提交）。
- **出处**：`company-hard-rules.md § 一·3`（数学研究版 v2.0）
- **动作**：提交前自测 3 项，缺一项不提交。数值任务另需：脚本可复跑 + 输出数据 + 与解析结论的比对表，**不接受截图**。

### T2. 阻塞处理

- **结论**：发现阻塞**立即**调 `company_task_block`，不等下次 progress；解除用 `company_task_unblock`。
- **出处**：`company-hard-rules.md § 一·2`
- **动作**：block 时填真实原因，不写"等验收"占位。

### T3. 子任务拆分标准

- **结论**：涉及多个**推导方向 / 定理** → 拆子任务并行；单人单方向能搞定 → 直接做 + progress；**估算 >2h 必须拆**。
- **出处**：`company-hard-rules.md § 一·5`
- **动作**：拆前先评估时长和并行面，避免无意义细分。

### T4. 进度汇报频率

- **结论**：每天至少一次 `company_task_progress`，内容含"已完成 / 进行中 / 阻塞"三段。
- **出处**：`company-hard-rules.md § 一·1`
- **动作**：assigned 超 24h 未 start、或 in_progress 超 48h 无 progress，会被自动催办。

### T5. L1 独立核验

- **结论**：L1 验收子任务前必须亲自核验交付物（**编译一次、查 commit、看文件、读复核记录**），不盲信 progress 报告。
- **出处**：`company-hard-rules.md § 一·4` + `docs/governance.md § 4.子 Agent 核验`
- **动作**：核验清单：`git rev-parse HEAD` / `git log --oneline -5` / `git show <hash> --stat` / `latexmk -pdf` / 读任务详情与复核记录。

### T6. 交叉派活边界

- **结论**：任务只能派给**直属下属**；跨线协作由共同 L1 转派。
- **出处**：`company-hard-rules.md § 一·7`
- **动作**：派活前核对 `company_org_list` 的汇报关系；跨线需求先找共同上级。

---

## 二、推导与文档工程板块（6 条）

### C1. 分支策略

- **结论**：分支一律 `{agent-id}/deriv-<方向>`，**一方向一分支 → 一 PR**。
- **出处**：`company-hard-rules.md § 二·1`
- **动作**：例：`shen-gu/deriv-scaling-exponent`。

### C2. 提交规范

- **结论**：提交前缀用 `deriv: / proof: / lit: / num:`（**替代** Conventional Commits）。
- **出处**：`company-hard-rules.md § 二·2`
- **动作**：正文写 why/what/影响范围；关联任务时引用 taskId。

### C3. 验收线

- **结论**：验收线 = **T1 三要素**；`pnpm test` 全绿**不再是验收线**。
- **出处**：`company-hard-rules.md § 二·3`（引 一·3）
- **动作**：不要以 pnpm test 作为验收依据。

### C4. 审查流程

- **结论**：L2 提交 → L1 review **+ 第二推导员重推** 后合并；**L2 之间不互评**（独立复核是验收门，不是互评）。
- **出处**：`company-hard-rules.md § 二·4`
- **动作**：提交前自行安排第二名推导员重推关键步骤，复核记录随任务提交。

### C5. 项目仓结构

- **结论**：项目仓 `q1d-percolation`——`manuscript/`（main.tex）、`derivations/`（一方向一文件）、`literature/`（文献库 + 结论摘录）、`numerics/`（后置）。
- **出处**：`company-hard-rules.md § 二·5`
- **动作**：figs、raw_data、`*.ipynb` 走 git-lfs 或排除出仓。

### C6. 开放问题承载

- **结论**：开放问题（审稿意见、待证闭式等）用 **issue** 承载。
- **出处**：`company-hard-rules.md § 二·6`
- **动作**：不要把开放问题塞进正文当结论。

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
- **出处**：`company-hard-rules.md § 三·3`
- **动作**：禁止复述背景 / 客套铺垫 / 重复总结 / 未经要求的散漫发挥。

### M4. 主持要求与单世界线沟通

- **结论**：主持人每轮只归纳当前共识、尚存分歧和下一动作，点名一次只问一个明确问题，结论清楚时立即收束；跨 agent 通信一律走目标 agent 的 **main session**（`agent:<id>:main`），不做 peer session 隔离。
- **出处**：`company-hard-rules.md § 三·4` + `docs/architecture.md § 单世界线`
- **动作**：收到消息原路回复（`sourceSession` 元数据）；不拼新 key，不反拼。

---

## 四、文档规则板块（3 条）

### D1. 必须文档化的 4 类内容

- **结论**：**格/模型定义与符号表**、**推导出处（引文与 bib）**、**关键结论的严格表述**、**工具链要求（如 latexmk 版本）** —— **必须**文档化。
- **出处**：`company-hard-rules.md § 四·1`
- **动作**：缺一项即视为任务未完成。

### D2. 文档存放位置

- **结论**：**项目仓** `README.md` + `AGENTS.md`，**不搞独立文档库**。
- **出处**：`company-hard-rules.md § 四·2`
- **动作**：新增文档前先确认仓库结构；不要建独立文档库等第二源。

### D3. 文档更新时机

- **结论**：**推导合并时同步更新**（双线维护原则）。
- **出处**：`company-hard-rules.md § 四·3`
- **动作**：PR 描述里写"已同步 docs/.../X.md"，缺则 review 不通过。

---

## 五、凭据管理板块（3 条）

### S1. 凭据来源与可用范围

- **结论**：任务派发时必须**明确** key 的来源和可用范围；Keychain 里的 key 标注用途和账户。
- **出处**：`company-hard-rules.md § 五·1,2`
- **动作**：派发任务时在 description 写明 `key 来源：<keychain name>` + 用途边界。

### S2. 环境变量命名规范

- **结论**：环境变量名**统一规范**：大写、下划线分隔（如 `OPENCLAW_GATEWAY_TOKEN`）。
- **出处**：`company-hard-rules.md § 五·3`
- **动作**：新增 env var 前查现有命名，避免 `token` / `Token` / `TOKEN` 混用。

### S3. 凭据写入禁令

- **结论**：禁止在仓库 / 日志 / Agent 人设文件中写入**明文**密钥、cookie、token、授权码；统一使用环境变量 / Keychain / Secret provider。
- **出处**：`company-hard-rules.md § 五·3` + `hooks/company-guidelines/HOOK.md`
- **动作**：commit 前 `git diff` 自查；发现明文立刻 `git reset` + 改用 env。

---

## 六、数学工作纪律板块（3 条）

### N1. 解析为王

- **结论**：解析推导是**主线**；数值模拟只在解析有进展时补充 / 延展，**不作论证核心**。
- **出处**：`company-hard-rules.md § 六·1`
- **动作**：不要把数值结果当结论来源；数值只做点验与延展。

### N2. 禁止数据塌缩拟合

- **结论**：标度指数须从**展开 / 严格推导**得出；**删除乐观误差棒的幂律拟合**。
- **出处**：`company-hard-rules.md § 六·2`
- **动作**：提交前检查：指数是推导来的还是拟合来的？后者退回。

### N3. 复核否决权

- **结论**：独立复核人对被核结论有**一票否决权**；分歧升级 L1 仲裁。
- **出处**：`company-hard-rules.md § 六·3`
- **动作**：复核人给出否决理由与复现路径，不静默放行。

---

## 七、Coding Agent 板块（3 条）

### A1. 强制委派作废

- **结论**：原「强制委派」条款**作废**——数学解析推导不适用，不得以此要求逐行编码或 PR 流程。
- **出处**：`company-hard-rules.md § 七·1`
- **动作**：不要再以本条款要求任何人走 coding-agent。

### A2. 自愿使用

- **结论**：脚本 / 绘图 / 数据处理 / 工具代码类任务可**自愿**使用 coding-agent 技能；启动前读 `coding-agent/SKILL.md`，`background:true`，prompt 写临时文件，带 notification route，用 `process` 监控，不盲目 kill。
- **出处**：`company-hard-rules.md § 七·2`
- **动作**：委派前把 prompt 落成文件，保留可复现路径。

### A3. 禁止静默改手写

- **结论**：worker 失败 / 卡住时**不得静默改为手写**而不上报。
- **出处**：`company-hard-rules.md § 七·3`
- **动作**：失败即上报（progress / block），说明切换原因。

---

## 八、跨条目速查表（按动作反查条目）

| 我要做... | 看哪一条 |
|----------|---------|
| 提交任务 | T1 + T5 |
| 阻塞上报 | T2 |
| 拆子任务 | T3 |
| 开新分支 / commit | C1 + C2 |
| 验收（编译 + 复核） | T1 + C3 |
| 走审查流程 | C4 |
| 找项目仓结构 | C5 |
| 记开放问题 | C6 |
| 发起会议 | M1 + M2 |
| 写会议发言 / 主持 | M3 + M4 |
| 跨 agent 沟通 | M4 |
| 新增 / 修改文档 | D1 + D2 + D3 |
| 任务派发带 key | S1 + S3 |
| 新增 env var | S2 |
| 解析 vs 数值取舍 | N1 |
| 标度指数怎么来 | N2 |
| 复核有分歧 | N3 |
| 是否用 coding-agent | A1 + A2 |

---

## 九、出处索引（机器可检索）

| 文件 / 公告 | 路径 / ID | 引用条目 |
|------------|----------|---------|
| 公司硬规则 v2.0（唯一硬规则源） | `~/.openclaw/company-info/company-hard-rules.md` | T1-T6, C1-C6, M1-M3, D1-D3, S1-S3, N1-N3, A1-A3 |
| 治理铁律 12 条 | `docs/governance.md` | T5 |
| 架构设计（单世界线） | `docs/architecture.md` | M4 |
| Company OS 工具（操作权威源） | `company_task_*` / `company_org_*` / `company_meeting_*` / `company_notice_*` / `company_inbox` | T2, T4, T6, M1-M4 |
| 岗位定义 | `~/.openclaw/company-info/role-requirements/*.md` | T6（派活边界） |
| 技能谱系与部署口径 | 公告 `961296ec-3da4-4434-9337-3cf23125ba69` | A2（技能来源三分） |
| 人设预算 5 文件制 | 公告 `8b9e0912-d8f2-4d77-b79a-7d047725bd8f` | 人设相关 |
| Hook：公司规则注入 | `hooks/company-guidelines/HOOK.md` | S3 |

---

## 十、维护与升级

- **新增规则**：改源文件 → 发公司公告 → 在本手册补条目（含出处） → 提交 commit；
- **条目过期**：源文件被取代/废弃时，对应条目标记 `[DEPRECATED]` 并指明替代条目；
- **季度审计**：治理岗每季度扫一遍"所有 agent 是否遵守本手册"，审计结果发治理简报公告。

> 本手册 **v2.0** 共 **28 条**（T×6 + C×6 + M×4 + D×3 + S×3 + N×3 + A×3），覆盖任务管理 / 推导与文档工程 / 沟通会议 / 文档 / 凭据 / 数学工作纪律 / Coding Agent 7 大板块，每条均含出处。
>
> 变更历史：v1.0（2026-08-08，软件版）→ **v2.0（2026-09-19，数学研究版）**。v1.0 的 Valid Proof 软件版、`pnpm test` 验收线、Conventional Commits、Coding Agent 强制委派、接口契约 review 触发条件等条目已随 `company-hard-rules.md` v2.0 作废。
