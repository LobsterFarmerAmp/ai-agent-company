# memory_search 全员回归验收报告（阶段2）

- **任务**: 1570c23d-a670-4bb7-8170-5e9105c37848（阶段2·全员回归验收）
- **验收人**: 宪章（xian-zhang）
- **验收时间**: 2026-08-09 11:40 CST
- **关联**:
  - 阶段1 报告 `docs/ops/memory-search-incident-2026-08-09.md`（核验可用性 + 异常清单）
  - 阶段1 根因报告 `docs/ops/memory-search-rootcause-2026-08-09.md`（配额/索引/配置三类成因）
  - 阶段2 重建执行记录 `docs/ops/memory-search-reindex-2026-08-09.md`（8/8 串行重建成功）
  - 公告 8c8613cb（嵌入 provider 配额耗尽 → token 计费切换）

## TL;DR

**8/8 agent memory_search 全部恢复正常，返回真实命中**。验收通过。

| 项 | 结果 |
|---|---|
| memory_search 可用率 | **8/8 = 100%** |
| 实测证据 | 每个 agent 含 score + path + 内容摘要（非 disabled/empty） |
| 主备链路 | 8/8 `Embeddings: ready`、`Vector dims: 2048`、`requested: volcengine-token` |
| 索引健康度 | 8/8 100% files indexed, `Dirty: no` |
| 配置切换 | volcengine-agent → **volcengine-token**（新 key，token 计费） |

## memory_search 实测证据（逐 agent）

探针 query: `memory_search 回归验收`，max-results: 1

| Agent | 命中 | 摘要 |
|---|---|---|
| jia-goushi | `0.557 memory/dreaming/light/2026-08-09.md:1-22` | Light Sleep（REM 周期浅睡） |
| lin-zhiheng | `0.589 memory/2026-08-09.md:1-16` | Memory · 2026-08-09 |
| shen-gu | `0.284 memory/2026-08-09.md:18-39` | memory_search 不可用降级反思（已知 infra 故障文档化） |
| lu-jian | `0.513 memory/dreaming/light/2026-08-09.md:28-47` | Promotion 候选评估 |
| wei-shu | `0.525 memory/2026-08-09.md:1-25` | 2026-08-09 每日反思（韦枢） |
| tan-wei | `0.000 memory/dreaming/rem/2026-08-09.md:1-15` | REM Sleep |
| gu-quan | `0.484 memory/2026-08-09.md:25-46` | ERR-20260809-001（memory_search 不可用降级协议） |
| xian-zhang | `0.279 memory/dreaming/light/2026-08-09.md:1-27` | Light Sleep（含本人候选 promote） |

→ 每个 agent 都返回了 score（0~1，越高越相关）、文件路径、内容摘要，**无 disabled/error/空响应**。

## 主备链路 4 字段（status --index）

| Agent | Provider (requested) | Embeddings | Indexed | Vector dims |
|---|---|---|---|---|
| jia-goushi | openai-compatible (volcengine-token) | ready | 32/32 · 108 chunks | 2048 |
| lin-zhiheng | openai-compatible (volcengine-token) | ready | 22/22 · 90 chunks | 2048 |
| shen-gu | openai-compatible (volcengine-token) | ready | 16/16 · 43 chunks | 2048 |
| lu-jian | openai-compatible (volcengine-token) | ready | 15/15 · 26 chunks | 2048 |
| wei-shu | openai-compatible (volcengine-token) | ready | 17/17 · 40 chunks | 2048 |
| tan-wei | openai-compatible (volcengine-token) | ready | 9/9 · 24 chunks | 2048 |
| gu-quan | openai-compatible (volcengine-token) | ready | 6/6 · 9 chunks | 2048 |
| xian-zhang | openai-compatible (volcengine-token) | ready | 11/11 · 18 chunks | 2048 |

→ 所有 agent 字段完全一致，配置统一切换到 token 计费。

## 配置变化追踪

| 时间 | Provider 配置 | 备注 |
|---|---|---|
| 阶段1（8/9 02:34） | `requested: volcengine-agent` | 失败（429 AccountQuotaExceeded） |
| 阶段2（8/9 11:30） | `requested: volcengine-token` | Boss 切换新 key，token 计费 |

## 验收标准核对

| # | 验收项 | 结果 |
|---|---|---|
| 1 | 全部 agent memory_search 可用 | ✅ 8/8 = 100% |
| 2 | 验收报告含逐 agent 实测证据 | ✅ 8 行命中表 + 8 行主备链路表 |
| 3 | 实测 memory_search 返回结构（含 score/path/摘要） | ✅ 全部命中含完整三元组 |

## 与阶段1 对比

| 指标 | 阶段1（8/9 02:34） | 阶段2（8/9 11:40） |
|---|---|---|
| 可用率 | 0/8（0%） | **8/8（100%）** |
| 统一症状 | disabled=true / error="index provider settings changed" | 无 |
| 嵌入状态 | fallback openai-compatible + 429 AccountQuotaExceeded | volcengine-token ready |
| reindex lock | 跨 agent 冲突 | 串行重建后正常 |

## 残留观察（非阻塞，可作治理改进项）

1. **陈旧 reindex-lock 文件**：8/8 agent 都存在 `*.reindex-lock.sqlite`（mtime 8/7），
   这是阶段1 status --index 探测遗留的，无人持锁真实 reindex。
   → 建议：治理岗后续出 cleanup 脚本统一清理，避免误判。
2. **配置切换文档化**：架构师把 volcengine-agent → volcengine-token 写入配置，
   但 setup/ 目录的嵌入 provider 文档未同步更新。
   → 建议：双线维护原则要求同步 `setup/` 文档；下个治理任务周期处理。
3. **本地代理依赖**：当前依赖本地代理 127.0.0.1:8791（launchd 守护 PID 11388）。
   → 建议：setup 文档应记录代理故障时的 fallback 路径。

## 出处索引

- 公告 8c8613cb
- 阶段1 报告 `docs/ops/memory-search-incident-2026-08-09.md`
- 阶段1 根因报告 `docs/ops/memory-search-rootcause-2026-08-09.md`
- 阶段2 重建执行记录 `docs/ops/memory-search-reindex-2026-08-09.md`
- ERR-20260808-001（memory_search 索引失效）
- OpenClaw CLI: `openclaw memory search --query --agent --max-results`、`memory status --index`