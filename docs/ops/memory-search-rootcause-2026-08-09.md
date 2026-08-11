# memory_search 根因定位报告

- **任务**: 1ed2bf1a-76cf-47b0-a2c2-8937cca196a4（阶段1·根因定位）
- **报告人**: 宪章（xian-zhang）
- **报告时间**: 2026-08-09 02:38 GMT+8
- **关联**: 任务 7e4d2ac7（阶段1·现状核验，已验收通过）、公告 8c8613cb
- **基础证据来源**: `~/.openclaw/company/ai-agent-company/docs/ops/memory-search-incident-2026-08-09.md`

## TL;DR（结论）

**根因 = 配额类**。嵌入主 provider `volcengine-agent` 配额耗尽触发 HTTP 429，
OpenClaw 切到 fallback `openai-compatible`，原索引矢量失配 → memory_search 全部 paused。
**不是**索引类（索引本身健康），**不是**配置类（配置文件未变）。

- **覆盖范围**: 全公司 8/8 agent，无单点异常。
- **主备同源**: 是。`volcengine-agent` 与 `openai-compatible` 共享同一账户配额池，
  fallback 也持续 429（shen-gu status 实测），主备 = 一根管子，拔了塞两边都断。
- **解封时间**: 2026-08-10 00:00:00 +0800 CST（HTTP 429 响应头明示）。

## 三类成因区分

| 候选 | 是否成立 | 证据 | 判断 |
|---|---|---|---|
| **配额耗尽** | ✅ 成立 | shen-gu status 实测到 `HTTP 429: AccountQuotaExceeded ... reset at 2026-08-10 00:00:00 +0800 CST`；日志反复出现 `embeddings retryable error` 后 `switched to fallback provider (volcengine-plan)` | **根因** |
| **索引失配** | ⚠️ 是症状不是病因 | 8/8 agent `Index identity: index provider settings changed`，但这是 provider 切换的**次生结果**，不是索引构建失败或损坏 | 排除为根因 |
| **配置错乱** | ❌ 不成立 | `requested: volcengine-agent` 字段在所有 agent 一致，配置文件未变；CLI `--fix`/`--deep` 均能正常解析 | 排除为根因 |

## 主备同源证据

```
Provider: openai-compatible (requested: volcengine-agent)   ← 配置里写的主
Fallback: openai-compatible                                 ← 实际兜底
Embeddings: ready
Vector dims: 2048
```

8/8 agent 字段完全一致 → 所有 agent 共享同一份 OpenClaw 配置 + 同一账户嵌入配额池。

主备同源进一步证据（shen-gu status 实时日志）：

```
openai-compatible embeddings failed: HTTP 429: AccountQuotaExceeded
... reset at 2026-08-10 00:00:00 +0800 CST
```

→ fallback 也 429，说明主备是**同账户同配额池**，不是两套独立资源。
切换 fallback 不是"换条路"，而是"同一根管子"——配额耗尽时主备同时失败。

## 覆盖范围

8/8 agent 全部命中：

| Agent | 命中症状 | 配字段一致 |
|---|---|---|
| jia-goushi | ✅ disabled / index provider settings changed | ✅ |
| lin-zhiheng | ✅ | ✅ |
| shen-gu | ✅ | ✅（额外捕获 429 原文） |
| lu-jian | ✅ | ✅ |
| wei-shu | ✅ | ✅ |
| tan-wei | ✅ | ✅ |
| gu-quan | ✅ | ✅ |
| xian-zhang | ✅ | ✅ |

无一单独异常 → 无单点根因，纯全局配额/配置层问题。

## 解封时间与恢复路径

- **官方解封时间**: 2026-08-10 00:00:00 +0800 CST（来自 HTTP 429 响应 `reset` 头）
- **解封后统一操作**: 由治理岗（xian-zhang）单 agent **串行**执行
  `openclaw memory index --force`；禁止并发（实测发现 reindex lock 冲突，详见 §附）。
- **纪律约束**: 解封前任何 agent 不得自行触发 `--force`，避免版本漂移
  （公告 8c8613cb）。

## 排除项说明

### 为什么不是索引类根因

- 索引文件本身完好（"Indexed: 22/22 files · 90 chunks"、"Dirty: no"）；
- `Vector dims: 2048` 是有效值，不是不支持的异常维度；
- "index provider settings changed" 是 OpenClaw **自动**触发的保护机制：
  检测到 provider 切换后主动暂停，避免语义错乱的检索结果污染。
- 如果是索引类（损坏/缺失），`openclaw memory search` 在 `Embeddings: ready` 的情况下
  本应能继续检索；但实际是直接 disabled → 验证了根因在 provider 层而非索引层。

### 为什么不是配置类根因

- `requested: volcengine-agent` 在 8/8 agent 一致 → 配置未被人为篡改；
- CLI 命令（`memory status`、`memory search`）都能正常解析，没有"unknown provider"类报错；
- 如果是配置类，会看到 provider 不识别 / 模型找不到之类的硬错误，而不是 429 后 fallback 链路。

## 附：阶段2 输入（新发现）

`openclaw memory status --index` 实测中发现跨 agent **reindex lock 冲突**：

```
Memory reindex lock is held at
  /Users/amphilagusgu/.openclaw/agents/<ag>/agent/openclaw-agent.sqlite.reindex-lock.sqlite;
  another reindex is active.
```

→ 多 agent 并发跑 status/index 会互相抢同一把锁。
→ **建议阶段2 acceptanceCriteria 必须包含**: 单 agent 串行、禁止并发（架构师已确认采纳）。
→ 引用: 阶段1 报告 §D。

## 出处索引

- 任务 7e4d2ac7（阶段1·现状核验，已关闭）
- 公告 8c8613cb（嵌入 provider 配额耗尽）
- 阶段1 报告 `docs/ops/memory-search-incident-2026-08-09.md`
- ERR-20260808-001（memory_search 索引失效）
- OpenClaw CLI: `memory status --index`、`memory_search` 工具返回结构