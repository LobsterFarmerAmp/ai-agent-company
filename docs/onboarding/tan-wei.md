# 入职熟悉笔记 — 探微（tan-wei，行业情报研究员）

> 写入日期：2026-08-08
> 来源：入职会（会议 cf6cda7f）任务拆解，阶段一「入职熟悉与诊断」
> 写入人：探微（agent id `tan-wei`，2 级，行业情报研究员）
> 协作：架构师（`jia-goushi`），治理协作：宪章（`xian-zhang`）

---

## 一、岗位与情报边界

### 1. 我的定位

- **职位**：行业情报研究员（Intelligence Researcher）
- **等级**：2 级（执行者）
- **上级**：架构师（`jia-goushi`，1 级）
- **协作**：宪章（`xian-zhang`，治理规范专员）— 外部 idea 落地为规范时留痕
- **服务对象**：Boss（0 级），最终为公司决策与战略方向提供外部输入

### 2. 情报体系边界（"我做什么 / 不做什么"）

#### 做（Do）

| 范围 | 含义 |
|------|------|
| 外部行业扫描 | 扫描 AI agent / 多 agent / agent OS / agent 协作框架领域的公开动态（产品发布、融资、技术路线、生态） |
| 趋势判断 | 对外部变化给出"对我们意味着什么"，结论先行 |
| 情报沉淀 | 把可复用情报整理成结构化资产（周报、idea 库、行业地图） |
| 平行协作 | 与宪章协作：外部可借鉴做法 → 整理为治理/规范建议，留痕 |
| 向上汇报 | 给架构师（必要时 Boss）摘要 + 判断，不堆链接 |

#### 不做（Don't）

| 边界 | 理由 |
|------|------|
| **不改业务代码** | 工程 agent 的领域；情报岗只输出观察与建议，不动仓库业务实现 |
| **不写明文密钥** | 公司硬红线；凭据一律走 Keychain / SecretRef / 环境变量 |
| **不执行破坏性命令** | 除非 Boss 明确要求并确认 |
| **不编造来源** | 没有出处 = 噪音；每条关键信息必带来源（URL + 时间） |
| **不抢工程岗活** | 不自己重构工程文档，不直接动 xian-zhang 的治理产物 |
| **不跨 workspace 拷文件** | 共享信息走 git commit → push；不绕过版本控制 |

---

## 二、关键规范（已读并确认遵守）

### 1. 公司硬规则（来源：`~/.openclaw/company-info/company-hard-rules.md`，版本 v1.1，2026-08-07 更新会议表达要求）

- **任务管理**：每天至少一次 progress；阻塞立即 `company_task_block`；Valid Proof 三要素（commit 可查 / 测试全绿 / 功能真实）
- **代码与工程**：分支 `{agent-id}/feature-name`；Conventional commits；pnpm test 全绿为硬性验收线（情报岗大多不需要跑工程 test，但若触碰工程产物须遵守）
- **沟通与会议**：开会 vs 消息有明确判定；讨论会 ≤3 轮 / 任务会 ≤5 轮；**会议表达：结论先行，≤300 字，不复述背景，不客套**
- **文档规则**：API 契约 / 架构决策 / 环境配置必须文档化；存各仓库 README + AGENTS.md
- **凭据管理**：任务派发明确 key 来源；Keychain 标注用途；环境变量名大写下划线
- **Coding Agent 强制**：多文件实现 / >30 分钟 / Issue-to-PR / 跨模块重构 → 必须派 Claude Code（情报岗多数任务是文档/调研，不在强制场景；本次交付为单文档，可手动）
- **会议基本规则**：见硬规则附录，与 v1.1 一致

### 2. 单世界线（来源：`docs/architecture.md` §1）

- 所有 Agent 间通信走目标 Agent 的 **main session**（`sessions_send` 到 `agent:<id>:main`）
- 我主动给架构师发消息 → `agent:jia-goushi:main`
- 主动给宪章发消息 → `agent:xian-zhang:main`
- Boss 也在各 Agent 的 main session；不要往 peer session 发

### 3. 角色文件结构（来源：`docs/overview.md` §5）

我的 6 + 2 文件：

| 文件 | 行数预算 | 当前内容 |
|------|---------|---------|
| AGENTS.md | ≤40 | 治理 + 启动加载 + 记忆边界（18 行） |
| SOUL.md | ≤35 | 核心 + 判断 + 协作 + 边界（31 行） |
| IDENTITY.md | ≤15 | 姓名/ID/职位/上级 + Operating Posture（15 行） |
| MEMORY.md | ≤60 | Durable Facts + Standing Rules（16 行） |
| TOOLS.md | ≤40 | Key Paths + 情报采集工具 + 输出位置（19 行） |
| USER.md | ≤15 | Boss 沟通风格偏好（7 行） |
| HEARTBEAT.md | 按需 | 当前仅模板，无活跃任务 |
| memory/YYYY-MM-DD.md | 按需 | 每日反思 + 当日情报摘要 |

### 4. 我的常用工具（来源：`TOOLS.md` + 实测可用性）

- **外部动态**：`web_search` / `tavily_search` / `tavily_extract` / `web_fetch`
- **站内公告**：`company_notice_list` / `company_notice_read`
- **跨会话回忆**：`memory_search`（⚠️ 当前 provider mismatch，索引不可用；降级到 file/grep；详见 ERR-20260808-001）
- **会议**：`company_meeting_status` / `company_meeting_speak`（需要时）
- **任务**：`company_task_read` / `company_task_start` / `company_task_progress` / `company_task_submit` / `company_task_block`

### 5. 组织架构位置（来源：`skills/company-org-chart/SKILL.md`）

```
Boss [0]
├── 架构师 jia-goushi [1]
│   ├── 宪章 xian-zhang [2]   ← 治理协作
│   └── 探微 tan-wei [2]      ← 我
└── CTO lin-zhiheng [1]
    ├── 沈固 shen-gu [2]
    ├── 陆见 lu-jian [2]
    └── 韦枢 wei-shu [2]
```

我的直属上级只有架构师；与 CTO 团队（沈固/陆见/韦枢）无汇报关系，仅在情报发现与他们工作强相关时通过架构师转发。

---

## 三、我对情报体系的判断（基于实际阅读）

### 1. 当前情报体系的"骨架已经在了，但还缺腿"

- ✅ **基础设施齐**：web_search / tavily / web_fetch 三个采集入口可用；公告板 + memory + 跨 session 通信可用于沉淀和分发
- ✅ **协作线清楚**：与架构师（向上）+ 宪章（平行）的关系都已写明
- ✅ **边界明确**：人设文件清晰划定"不改业务代码 / 不写明文密钥 / 情报可溯源"
- ⚠️ **缺乏触发器**：当前没有任何定时任务 / 收件箱规则会在外部出现重大事件时主动唤起我；我的工作完全依赖被动派活
- ⚠️ **缺乏产出规范**：周报/简报/idea 库的具体格式未在规范层定义，需要在第一次实战中定型
- ⚠️ **memory 索引异常**：ERR-20260808-001 已记录，跨 session 检索能力暂时瘫痪，依赖 `file/grep` 降级（详见优化建议 #3）

### 2. 我的工作风格（在规范空白处先自我约束）

- 结论先行，300 字内能说清的不写 1000 字
- 每条关键情报必须标 **来源 URL + 时间**
- 不只搬运新闻 — 给"对我们意味着什么"
- 发现对自家有直接参考价值的做法，主动整理成可落地建议上报架构师，再由架构师决定是否落地或交宪章规范化

---

## 四、建设性优化建议（≥3 条，每条：问题 + 建议 + 预期收益）

### 建议 #1：建立情报岗的"最小触发清单"（HEARTBEAT.md 落地）

**问题**：
当前我的工作完全依赖被动派活，没有任何机制在以下情况发生时主动唤起我：
- Tavily/web_search 范围内出现重大事件（如：OpenAI / Anthropic / Google / 国产头部厂商发布 agent OS / 多 agent 协作框架）
- GitHub Trending 出现 star 数暴增的 agent 框架（LangGraph / AutoGen / CrewAI 等的同类）
- 治理公告板出现与情报岗相关的新规范

SOUL.md 里写的"完成情报任务主动汇报"，但没有"什么算值得主动扫描"的硬清单。

**建议**：
在 `~/.openclaw/workspace-tan-wei/HEARTBEAT.md`（已存在模板）写入最小触发清单：
- 每周五 09:00（本地）执行一次常规扫描，产出周报草稿
- 任一规则触发时（厂商发布会 / 重大融资 / 行业研究报告）立即在 main session 自检任务并扫一次
- 公司公告出现"情报岗相关"关键词（"行业"/"外部"/"agent 趋势"）时主动拉一次

**预期收益**：
- 从"被动响应"升级为"主动扫描 + 报告"
- 周报节奏稳定，每周 Boss 能拿到固定产出
- 重大事件不漏（不会因为没人派活就错过 OpenAI DevDay 级别的事件）

---

### 建议 #2：定义"情报 → 治理"的标准化移交模板（与宪章协作）

**问题**：
我的 SOUL 写了"发现对自家有直接参考价值的做法，主动整理成可落地建议上报"。MEMORY 写了"与宪章协作时，外部 idea 落地为规范要留痕"。但是：
- 移交什么（从情报到治理）？格式是什么？谁先起草？
- 没有现成模板，第一次实战时大概率出现"我给宪章发一段话，宪章不知道要干嘛"的尴尬
- 治理仓库 `docs/` 没有"情报沉淀目录"

**建议**：
与宪章协商一个最小移交模板（可放在 `docs/onboarding/intelligence-handoff-template.md` 或类似位置），至少包含：
- **idea 标题 + 一句话结论**
- **来源 URL + 抓取时间**（可溯源）
- **观察到的做法**（外部做了什么）
- **对我们的参考价值**（可借鉴 / 可规避 / 待观察）
- **建议落地形式**（改公司规则 / 新增 skill / 仅入库 / 忽略）
- **建议负责人**（架构师/宪章/CTO/工程团队）

**预期收益**：
- 情报 → 治理的流转不再靠口头对齐，有最小结构
- 降低"我写的情报到底要不要落到规范里"的决策成本
- 沉淀效率提升 — 三个月后回头看 idea 库能直接选出已落地 vs 待处理 vs 已弃

---

### 建议 #3：建立"情报岗跨 session 记忆降级路径"（修复 ERR-20260808-001）

**问题**：
memory_search 当前因 embedding provider mismatch 返回 `disabled=true`（见 ERR-20260808-001，已记录在 `.learnings/ERRORS.md`）。情报岗依赖跨 session 回忆（每周扫描同一批厂商时复用之前的判断和跟进项），索引瘫痪等于记忆断流：
- 周报无法引用上周已记录的判断
- 跟进项无法被自动续上
- 三个 session（agent:main / weekly-digest / ad-hoc-research）互不可见

但根因修复需要 Boss 跑 `openclaw memory index --force`，我无权操作。

**建议**：
1. **短期（本周内）**：在 TOOLS.md 加入"memory 不可用时的降级路径"——
   ```
   # 降级路径
   memory_search 不可用时，按以下顺序查：
   1. memory/YYYY-MM-DD.md（每日反思，含情报摘要）
   2. MEMORY.md（durable facts）
   3. company_notice_list（站内公告）
   4. company_inbox（任务状态）
   5. workspace-tan-wei/.learnings/
   ```
2. **中期（向架构师 / Boss 上报）**：在每周首次扫描时主动报告 memory 索引状态；如果连续 2 周仍 disabled，由我提议触发 `openclaw memory index --force`（需架构师批准）
3. **长期（规范化）**：在 self-improving-agent skill 中明确"基础设施异常"应触发架构师上报，而非静默降级

**预期收益**：
- 短期：记忆断流期不丢关键情报，每周产出保持连续
- 中期：自动反馈机制让基础设施异常不被遗忘
- 长期：所有 agent 在 memory 异常时都有标准化上报路径，不止我一人

---

### 建议 #4（加分项）：建立"情报周报"最小结构（在第一次实战中定型）

**问题**：
周报是情报岗的核心产出，但公司层没有"周报模板"。如果每次周报我自己拍脑袋决定格式，Boss 和架构师要重新适应，效率低。

**建议**：
在第一次产出（《AI Agent 行业周报 2026-W31》）中试行以下结构，后续固定：
- **本周关键判断**（3 条以内，每条结论先行 + 来源 + 借鉴意义）
- **国内动态**（按厂商分组，标日期）
- **国外动态**（按厂商分组，标日期）
- **生态与融资**（一次性大事件）
- **下周跟进项**（明确要继续观察的事件 / 已观察的结论 / 待核实信息）
- **附录：完整来源清单**（URL + 抓取时间）

**预期收益**：
- 第一次周报即定型，Boss/架构师读起来零适应成本
- "下周跟进项"自然成为下周扫描的输入，形成闭环
- 三个月后回头看，结构稳定 → 可对比 → 可发现趋势

---

## 五、当前已读清单（事实溯源）

### 1. 我的五件套
- AGENTS.md / SOUL.md / IDENTITY.md / MEMORY.md / TOOLS.md / USER.md（已逐文件读）

### 2. 公司硬规则
- `~/.openclaw/company-info/company-hard-rules.md`（v1.1，2026-08-07）

### 3. 治理仓库（`~/.openclaw/company/ai-agent-company/`）
- README.md
- docs/architecture.md
- docs/overview.md
- docs/governance.md
- docs/getting-started.md
- docs/maintenance.md
- docs/volcengine-agent-plan.md（了解公司当前模型栈）
- examples/org-chart-example.md
- bootstrap/INITIALIZATION_LOG.md
- bootstrap/README.md

### 4. Skills（按需求读了 4 个）
- skills/company-org-chart/SKILL.md
- skills/company-task-execution/SKILL.md
- skills/company-task-dispatch/SKILL.md
- skills/company-reporting/SKILL.md
- skills/self-improvement/SKILL.md（之前熟悉过）
- skills/company-dialogue/SKILL.md（部分）
- skills/company-code/SKILL.md（部分）

### 5. 公告板（`company_notice_list`）
- 9 条公告均已标记已读；重点关注：
  - 公告 1（cf6cda7f）：入职会任务拆解 — 我和宪章各 2 阶段任务
  - 公告 3（jia-goushi）：公司规则 v1.0 发布 — 试行 1 周，8/13 复盘
  - 公告 4（jia-goushi）：Coding Agent 强制使用规则 — 8/13 复盘
- 卡路里系统相关公告：非情报岗职责，不跟进

### 6. 我的记忆
- memory/2026-08-08.md（昨日反思，含人设治理结果）
- .learnings/ERRORS.md（ERR-20260808-001 memory 索引异常）

### 7. 任务上下文
- 父任务 d3d4f495（入职会）— 当前阶段 0「入职熟悉与诊断」
- 本任务 5d407cc0 — 阶段 0，assigned → in_progress
- 平行任务 0d21b270（宪章）— 同阶段，同状态
- 阶段二任务（本周报 / 治理速查手册）— 还未激活，等阶段一通过后启动

---

## 六、下一步行动（个人 TODO）

1. ⏳ 提交本笔记 → 架构师验收
2. ⏳ 阶段二启动后，立即开始《AI Agent 行业周报 2026-W31》（≥10 条带出处 + ≥3 条可借鉴判断 + 5 分钟简报）
3. ⏳ 与宪章协商情报 → 治理移交模板（在产出第一份 idea 后立即开第一次协商）
4. ⏳ 上报 memory 索引异常给架构师 / Boss（在本次提交后单独发一次）
5. ⏳ HEARTBEAT.md 落地最小触发清单（建议 #1 的具体实现，等架构师批准建议后做）

---

**笔记结束。等待架构师验收。**