# memory_search 索引重建执行记录（阶段2）

- **任务**: 28b96af4-d2d9-41e1-8679-250f8a39d12f（阶段2·重建索引）
- **执行人**: 宪章（xian-zhang）
- **执行时间**: 2026-08-09 11:35-11:36 CST
- **关联**:
  - 阶段1 报告 `docs/ops/memory-search-incident-2026-08-09.md`（§D reindex lock 冲突）
  - 阶段1 根因报告 `docs/ops/memory-search-rootcause-2026-08-09.md`
  - 公告 8c8613cb（嵌入 provider 配额耗尽 → 8/10 00:00 解封预期）

## TL;DR

**8/8 agent memory_search 全部恢复可用**。串行执行，零并发，全程无 reindex lock 报错。
每个 agent 重建后立即 memory_search 探针验证，命中真实内容（不再是阶段1 的
`disabled=true / error="index provider settings changed"`）。

## 阻塞推翻

原计划等 2026-08-10 00:00 CST 配额解封。**阻塞前提被架构师推翻**：

- Boss 切换为火山方舟 token 计费（新 key，**不受** Coding Plan 周配额 429 限制）
- 架构师完成 OpenClaw 配置切换 + 本地 multimodal 代理部署
- 代理路径：`~/.openclaw/bin/doubao-embedding-proxy.js`（PID 11388，launchd 守护，端口 8791）
- 代理环境：`ARK_EMBEDDING_KEY` 从 Keychain service `volcengine_token` 读取
- OpenClaw `memorySearch.remote.baseUrl` → `http://127.0.0.1:8791`
- 架构师本人（jia-goushi）已实测 `memory index --force` 成功 + memory_search 正常返回

## 执行流水

| 时间 | Agent | 操作 | 结果 | memory_search 验证 |
|---|---|---|---|---|
| 11:29 | jia-goushi | `--force --agent jia-goushi`（架构师本人执行） | ✅ 索引已重建 | — |
| 11:35:34 | xian-zhang | `--force --agent xian-zhang`（治理岗验证） | ✅ Memory index updated | ✅ 命中 `memory/2026-08-09-meeting-memory-search.md` |
| 11:35:45 | lin-zhiheng | `--force --agent lin-zhiheng` | ✅ Memory index updated | ✅ 命中 `memory/2026-08-09.md` |
| 11:35:54 | shen-gu | `--force --agent shen-gu` | ✅ Memory index updated | ✅ 命中 `memory/2026-08-09.md` |
| 11:36:01 | lu-jian | `--force --agent lu-jian` | ✅ Memory index updated | ✅ 命中 `memory/dreaming/light/2026-08-09.md` |
| 11:36:06 | wei-shu | `--force --agent wei-shu` | ✅ Memory index updated | ✅ 命中 `memory/2026-08-09.md` |
| 11:36:13 | tan-wei | `--force --agent tan-wei` | ✅ Memory index updated | ✅ 命中 `memory/dreaming/rem/2026-08-09.md` |
| 11:36:20 | gu-quan | `--force --agent gu-quan` | ✅ Memory index updated | ✅ 命中 `memory/2026-08-09.md` |

- **总耗时**: ~50s（11:35:34 → 11:36:24）
- **平均每个 agent**: ~7s（含索引重建 + 立即探针验证）
- **串行约束遵守**: 每个 `--force` 串行执行，无并发，**全程无 reindex lock 报错**

## 串行依据（引用阶段1 §D）

阶段1 实测发现 `openclaw memory status --index` 会触发跨 agent reindex，
多 agent 并发执行会出现 reindex lock 冲突：

```
Memory reindex lock is held at
  /Users/amphilagusgu/.openclaw/agents/<ag>/agent/openclaw-agent.sqlite.reindex-lock.sqlite;
  another reindex is active.
```

→ 架构师据此为阶段2 任务追加 acceptanceCriteria ② "单 agent 串行、禁止并发"。
本执行严格遵守：每个 agent 等待前一个完整退出再开始下一个，**无并发**。

## 验收标准三要素核对

| # | 验收项 | 结果 |
|---|---|---|
| ① | 全部 agent 索引重建成功，无自主重建痕迹 | ✅ 8/8 重建成功；重建全部由架构师 + 治理岗统一执行，各 agent 自身未触发 --force |
| ② | 单 agent 串行、全程无并发冲突 | ✅ 见执行流水，~7s × 8 = ~50s 总耗时，无 lock 报错 |
| ③ | 引用阶段1 §D 说明串行依据 | ✅ 本报告 §"串行依据" + §D 引用 |

## 残留观察（非阻塞）

- **陈旧 reindex-lock 文件**：8/8 agent 都存在 `*.reindex-lock.sqlite`（mtime 8/7 23:03），
  这是阶段1 status --index 探测遗留的，无人持锁真实 reindex，不影响功能。
  → 可作治理项清理由后续统一 cleanup 脚本处理。
- **代理进程长稳运行**：PID 11388 PPID=1（launchd），自动重启策略由架构师负责。
- **token 计费** vs Coding Plan：本次切换到 token 计费，避免 Coding Plan 周配额 429。
  新 key（ark-18e...42833）走方舟 endpoint，非订阅配额。

## 附：阶段2 验收任务 1570c23d 启动条件

- 28b96af4 关闭后，治理岗立即 unblock 任务 1570c23d（全员回归验收）。
- 重跑 8/8 agent memory_search 探针 + 汇总验收报告（按 1570c23d acceptanceCriteria
  "全部 agent memory_search 可用，验收报告含逐 agent 实测证据"）。
- 预计 30 分钟内出验收报告。

## 出处索引

- 公告 8c8613cb（嵌入 provider 配额耗尽）
- 阶段1 报告 `docs/ops/memory-search-incident-2026-08-09.md`
- 阶段1 根因报告 `docs/ops/memory-search-rootcause-2026-08-09.md`
- 任务 28b96af4 revision 2（架构师加串行约束）
- 代理源码 `~/.openclaw/bin/doubao-embedding-proxy.js`
- Keychain service `volcengine_token`