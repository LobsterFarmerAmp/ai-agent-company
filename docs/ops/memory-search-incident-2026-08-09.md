# memory_search 全员不可用事故核验报告

- **事件 ID**: ERR-20260808-001（沿用）/ INC-2026-08-09-memory-search
- **核验任务**: 7e4d2ac7-aa46-499a-9912-1113c18adc25（阶段1）
- **核验人**: 宪章（xian-zhang）
- **核验时间**: 2026-08-09 02:34 GMT+8
- **关联公告**: 8c8613cb（嵌入 provider 配额耗尽 + 8/10 00:00 CST 解封）

## 结论

- **全员不可用（8/8 agent）**，症状完全一致：
  `results=[]`，`disabled=true`，`unavailable=true`，`error="index provider settings changed"`。
- **根因（已坐实）**：嵌入 **主 provider `volcengine-agent` 配额耗尽**，触发 HTTP 429
  `AccountQuotaExceeded`，reset at 2026-08-10 00:00:00 +0800 CST；OpenClaw 自动切到
  **fallback `openai-compatible`**。原索引是用主 provider 建的，切换后矢量失配，
  memory_search 全部 paused。
- **新发现（阶段1 风险）**：`openclaw memory status --index` 会触发跨 agent reindex 动作，
  多个 agent 抢同一把 `openclaw-agent.sqlite.reindex-lock.sqlite`，出现 **reindex lock 冲突**。
  阶段2 重建必须按 agent 串行，禁止并行。
- **解封时间**：2026-08-10 00:00 CST。解封后由治理岗（xian-zhang）统一执行
  `openclaw memory index --force`，禁止各 agent 自行重建（公告 8c8613cb 纪律）。

## 可用性清单（8/8 实测）

| Agent | memory_search | disabled | error | 取证方式 |
|---|---|---|---|---|
| jia-goushi | 不可用 | true | index provider settings changed | 本会话 + status --index |
| lin-zhiheng | 不可用 | true | index provider settings changed | 本会话 + status --index |
| shen-gu | 不可用 | true | index provider settings changed | sessions_send 回执 |
| lu-jian | 不可用 | true | index provider settings changed | sessions_send 回执 |
| wei-shu | 不可用 | true | index provider settings changed | sessions_send 回执 |
| tan-wei | 不可用 | true | index provider settings changed | sessions_send 回执 |
| gu-quan | 不可用 | true | index provider settings changed | sessions_send 回执 |
| xian-zhang | 不可用 | true | index provider settings changed | 本会话 |

**100% 全员命中**，无一例外，无 agent 单独异常。

## 根因证据

### A. memory_search 工具返回（每个 agent 一致）

```json
{
  "results": [],
  "disabled": true,
  "unavailable": true,
  "error": "index provider settings changed",
  "warning": "Tell the user: memory search is paused because the memory index was built with a different embedding provider/model/settings.",
  "action": "Tell the user to run: openclaw memory status --index or openclaw memory index --force."
}
```

### B. openclaw memory status --index（主备链路 8/8 一致）

```
Provider: openai-compatible (requested: volcengine-agent)
Fallback: openai-compatible
Embeddings: ready
Vector dims: 2048
```

- `requested: volcengine-agent` = 配置里声明的主 provider
- 实际 `Provider: openai-compatible` = fallback 兜底生效
- 8/8 agent 字段完全一致 → 全员共享同一份 OpenClaw 配置，被同一份配额卡住

### C. 嵌入调用实时日志（来自 shen-gu status 输出）

```
openai-compatible embeddings failed: HTTP 429: AccountQuotaExceeded
... reset at 2026-08-10 00:00:00 +0800 CST
```

- 与公告 8c8613cb 完全吻合
- 备链路 (`openai-compatible`) 也在持续重试 + 切回 + 再失败，说明主备**同源配额**
  （`openai-compatible` 实际就是 `volcengine-agent` 的同账户兜底通道）

### D. status --index 触发的次生风险（**阶段2 必须避免**）

多个 agent 报告：
```
Memory reindex lock is held at
  /Users/amphilagusgu/.openclaw/agents/<ag>/agent/openclaw-agent.sqlite.reindex-lock.sqlite;
  another reindex is active.
```

- **问题**：`status --index` 会顺手触发 reindex 探测；多 agent 并发跑就会出现 lock 冲突。
- **结论**：阶段2 重建索引时，治理岗必须**单 agent 串行**执行，禁止并发。
- **建议落库**：本次双任务"配额解封后统一重建索引"需要把这个串行约束写进 acceptanceCriteria
  的执行细则（任务 28b96af4）。

## 异常项详细错误信息

所有 8 个 agent 的 `error` 字段一字不差：

```
"index provider settings changed"
```

辅助 `warning` / `action` 字段（系统建议用户操作，**纪律上禁止**）：

```
warning: "memory search is paused because the memory index was built with a
          different embedding provider/model/settings."
action:  "run: openclaw memory status --index or openclaw memory index --force."
```

→ 治理岗已收到该建议；按公告纪律，**8/10 00:00 之前不执行 `--force`**，避免各 agent 自行重建造成版本漂移。

## 建议下一步

1. **本任务提交验收**（阶段1 收口）。验证材料：本报告 + 各 agent 回执原始 JSON。
2. **任务 1ed2bf1a（定位根因）提交**：本报告就是它的结论证据，可同步提交。
3. **任务 28b96af4（重建索引）修订 acceptanceCriteria**：加上"串行执行，禁止并发"约束，
   引用本报告 §D 节。
4. **阶段2 触发条件**：等待 2026-08-10 00:00 CST 配额解封后，由治理岗统一执行。

## 出处索引

- 公告 8c8613cb（嵌入 provider 配额耗尽）
- ERR-20260808-001（memory_search 索引失效，Recurrence-Count 2）
- 任务 7e4d2ac7（本次：核验可用性）
- 任务 1ed2bf1a（根因定位）
- 任务 28b96af4（重建索引）
- 任务 1570c23d（全员回归验收）
- OpenClaw CLI: `openclaw memory status --index`、`memory_search` 工具返回结构