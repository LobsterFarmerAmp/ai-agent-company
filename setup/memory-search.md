# 记忆搜索配置

> 配置日期：2026-08-04（云端 Agent Plan 首次部署）
> 更新日期：2026-08-09（v2 切换为本地代理 + token 计费新 key + launchd 常驻）
> 执行者：架构师（配置切换）+ 治理岗（文档同步）
> 前置条件：bootstrap 完成、Gateway 本机运行、Keychain 含 volcengine_token

## 方案

**v2（当前 2026-08-09 起）**：本地 multimodal 代理 + 火山方舟 token 计费新 key。

记忆搜索的嵌入请求路径：
```
OpenClaw memory_search
  → openclaw.json memorySearch.remote.baseUrl = http://127.0.0.1:8791
  → ~/.openclaw/bin/doubao-embedding-proxy.js （launchd 常驻）
  → /v1/embeddings (OpenAI-style) → POST https://ark.cn-beijing.volces.com/api/v3/embeddings/multimodal
  → 模型：doubao-embedding-vision-251215（方舟 multimodal endpoint）
```

为什么走本地代理：
- 走方舟 multimodal endpoint（`/api/v3/embeddings/multimodal`）每次只能返回 1 个 embedding
- 代理把 OpenAI 风格的批量 input 拆成多次单条调用，合并为 OpenAI-style 响应
- 代理只绑 `127.0.0.1`，不暴露外网
- Keychain key 不写入 plist，wrapper 在启动时注入

## 当前配置（openclaw.json）

| 项目 | 值 |
|------|-----|
| Provider | `volcengine-token`（解析为 `openai-compatible`，走 token 计费） |
| Model | `doubao-embedding-vision-251215` |
| Base URL | `http://127.0.0.1:8791`（本地代理） |
| Ark upstream | `https://ark.cn-beijing.volces.com/api/v3/embeddings/multimodal` |
| API Key | Keychain service `volcengine_token`（wrapper 启动时注入） |
| Fallback | `none`（不设 fallback——方舟 multimodal 单独 endpoint，配 fallback 易触发次生症状） |
| Sources | `["memory", "sessions"]` |
| 检索模式 | 混合检索（BM25 + 向量） |
| 向量权重 | 0.6 |
| 关键词权重 | 0.4 |
| 候选集倍数 | 3 |
| 最大返回 | 10 |
| 最低相似度 | 0.3 |
| 分块大小 | 512 tokens |
| 分块重叠 | 64 tokens |
| 文件监听 | 开启，防抖 2000ms |
| 会话开始同步 | 开启 |
| 搜索前同步 | 开启 |
| 缓存 | 开启，上限 1000 条 |
| 向量维度 | 2048 |

## 变更历史

### 2026-08-09：v2 本地代理 + token 计费新 key

**原因：** Coding Plan 周配额耗尽 → 嵌入 provider 持续 HTTP 429 AccountQuotaExceeded → 全公司 8/8 agent memory_search paused（ERR-20260808-001）。火山方舟为该账户开通 token 计费新 key（独立于 Coding Plan 周配额），但 multimodal endpoint 与原 Plan 入口不兼容，必须通过本地代理透传。

**变更：**
- Provider: `volcengine-agent` → `volcengine-token`
- Model: `doubao-embedding-vision` → `doubao-embedding-vision-251215`
- Base URL: `https://ark.cn-beijing.volces.com/api/plan/v3` → `http://127.0.0.1:8791`（代理）
- Ark upstream endpoint: `/api/plan/v3` → `/api/v3/embeddings/multimodal`
- 嵌入调用: 火山方舟云端直连 → OpenClaw → 本地代理 → 火山方舟 multimodal
- Keychain: 新增 `volcengine_token` service（新 key，与 Agent Plan key 分开）
- Fallback: `none`（之前为 `volcengine-plan` Plan endpoint，但 multimodal 无 Plan 等价物，移除避免 429 链式触发）

**新增基础设施：**
- 本地代理脚本：`~/.openclaw/bin/doubao-embedding-proxy.js`（架构师编写）
- Wrapper：`~/.openclaw/service-env/ai.doubao-embedding-proxy-wrapper.sh`（从 Keychain 注入 ARK_EMBEDDING_KEY）
- launchd plist：`~/Library/LaunchAgents/ai.doubao.embedding.proxy.plist`（label `ai.doubao.embedding.proxy`，KeepAlive=true）
- 日志：`~/Library/Logs/doubao-embedding-proxy.log`

**事故关联：** 全员 memory_search 不可用 8/9 02:34 → 11:35 恢复，详见
`docs/ops/memory-search-incident-2026-08-09.md`（阶段1 核验）、`docs/ops/memory-search-rootcause-2026-08-09.md`（根因定位）、`docs/ops/memory-search-reindex-2026-08-09.md`（重建执行）、`docs/ops/memory-search-regression-acceptance-2026-08-09.md`（回归验收）。

### 2026-08-06：从本地 Ollama 切换到云端 Agent Plan

**原因：** 本地 Ollama 运行 `qwen3-embedding:4b`（4B 参数）内存压力大。

**变更：** Provider: `ollama` → `volcengine-agent`、Model: `qwen3-embedding:4b` → `doubao-embedding-vision`、向量维度: 2560 → 2048。

## 部署方式

### 1. 前置条件

```bash
# 1.1 Keychain 含 volcengine_token（架构师维护）
security find-generic-password -s volcengine_token
# 期望：返回 key（不应为空）

# 1.2 代理脚本存在且可执行
ls -la ~/.openclaw/bin/doubao-embedding-proxy.js ~/.openclaw/service-env/ai.doubao-embedding-proxy-wrapper.sh
# 期望：两个文件存在，wrapper 有执行位
```

### 2. 写入 openclaw.json

写入 `~/.openclaw/openclaw.json` 的 `agents.defaults.memorySearch`：

```json
{
  "enabled": true,
  "provider": "volcengine-token",
  "model": "doubao-embedding-vision-251215",
  "fallback": "none",
  "remote": {
    "baseUrl": "http://127.0.0.1:8791"
  },
  "sources": ["memory", "sessions"],
  "extraPaths": [],
  "store": {
    "driver": "sqlite",
    "vector": { "enabled": true }
  },
  "chunking": {
    "tokens": 512,
    "overlap": 64
  },
  "sync": {
    "onSessionStart": true,
    "onSearch": true,
    "watch": true,
    "watchDebounceMs": 2000
  },
  "query": {
    "maxResults": 10,
    "minScore": 0.3,
    "hybrid": {
      "enabled": true,
      "vectorWeight": 0.6,
      "textWeight": 0.4,
      "candidateMultiplier": 3
    }
  },
  "cache": {
    "enabled": true,
    "maxEntries": 1000
  }
}
```

注意：`memorySearch` 全部字段是受保护路径，`config.patch` 无法热加载，必须直接编辑 `openclaw.json`。

### 3. 部署 launchd plist

```bash
# 3.1 复制 plist 到 LaunchAgents（plist 由架构师维护在治理仓外）
# 源：~/Library/LaunchAgents/ai.doubao.embedding.proxy.plist

# 3.2 验证 plist 语法
plutil -lint ~/Library/LaunchAgents/ai.doubao.embedding.proxy.plist

# 3.3 加载（unload 旧版本如有）
launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/ai.doubao.embedding.proxy.plist 2>/dev/null
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/ai.doubao.embedding.proxy.plist

# 3.4 验证 launchd 接管
launchctl list | grep ai.doubao.embedding.proxy
# 期望：PID + LastExitStatus 0
```

### 4. 验证代理存活

```bash
# 4.1 进程与端口
lsof -nP -iTCP:8791 -sTCP:LISTEN
# 期望：node 进程 LISTEN 在 8791

# 4.2 健康检查
curl -sS -X POST http://127.0.0.1:8791/v1/embeddings \
  -H "Content-Type: application/json" \
  -d '{"model":"doubao-embedding-vision-251215","input":"smoke test"}' \
  --max-time 15 | head -c 200
# 期望：返回 {"id":"embed-...","object":"list","model":"doubao-embedding-vision-251215","data":[{"object":"embedding","index":0,"embedding":[...]}]}
```

### 5. 重启 Gateway + 重建记忆索引

```bash
# 5.1 重启 gateway 让 memorySearch.remote 生效
openclaw gateway restart

# 5.2 串行重建所有 agent 索引（参见阶段2 重建报告 §"执行流水"）
for ag in jia-goushi lin-zhiheng shen-gu lu-jian wei-shu tan-wei gu-quan xian-zhang; do
  openclaw memory index --force --agent ${ag}
done
```

> 串行依据：`docs/ops/memory-search-incident-2026-08-09.md` §D — `openclaw memory status --index` 会触发跨 agent reindex，并发执行会引发 reindex lock 冲突。

### 6. 验收

```bash
# 6.1 索引状态
openclaw memory status --index --agent <id>
# 期望：
# - Provider: openai-compatible (requested: volcengine-token)
# - Model: doubao-embedding-vision-251215
# - Vector dims: 2048
# - Embeddings: ready
# - Dirty: no

# 6.2 检索实测
openclaw memory search --query "memory_search 回归验收" --agent <id> --max-results 1
# 期望：返回真实命中（score + file:path + 摘要），无 disabled/error
```

## 故障 fallback 路径

### 故障 A：代理进程不在

**症状：** `lsof -nP -iTCP:8791 -sTCP:LISTEN` 无输出；`memory_search` 返回 `disabled=true / error="index provider settings changed"`。

**恢复步骤：**
1. 检查 launchd：`launchctl list | grep ai.doubao.embedding.proxy`
   - 无 PID → 拉起：`launchctl kickstart -k gui/$(id -u)/ai.doubao.embedding.proxy`
   - LastExitStatus 非 0 → 看日志：`tail -50 ~/Library/Logs/doubao-embedding-proxy.log`
2. 检查 wrapper：`sh -x ~/.openclaw/service-env/ai.doubao-embedding-proxy-wrapper.sh`
   - ARK_EMBEDDING_KEY 为空 → Keychain 没 key，看 §故障 B
   - node 启动失败 → 看代理脚本权限
3. 检查代理脚本：`node ~/.openclaw/bin/doubao-embedding-proxy.js`（前台跑看 stderr）

### 故障 B：Keychain key 缺失或失效

**症状：** wrapper 启动时 `security find-generic-password` 返回非 0；代理日志 `ARK_EMBEDDING_KEY not set`；方舟端 401/403。

**恢复步骤：**
1. 验证 Keychain：`security find-generic-password -s volcengine_token -w`（应返回 key）
2. 缺失 → 架构师重新签发（不能从治理仓写入明文）
3. 失效 → 架构师在火山方舟控制台刷新 key，再 update Keychain

### 故障 C：方舟 multimodal endpoint 不可达

**症状：** 代理日志 `ark HTTP 5xx` 或连接超时；`memory_search` 命中率下降或全 0。

**恢复步骤：**
1. 测试上游：`curl -sS -X POST https://ark.cn-beijing.volces.com/api/v3/embeddings/multimodal ...`
2. 5xx → 等方舟恢复（参考火山方舟公告）
3. 401/403 → Keychain key 失效，见 §故障 B
4. 长期不可达 → 切回 v1（云端 Agent Plan 直连），但需确认 Plan endpoint `/api/plan/v3` 是否仍在服务（2026-08-09 阶段1 实测该路径返回 HTTP 429 AccountQuotaExceeded）

### 故障 D：代理可达但方舟 multimodal 限流

**症状：** 代理日志 `ark HTTP 429`；`memory_search` 部分成功部分失败。

**恢复：**
- 等方舟配额恢复（参考 ERR-20260808-001 解封时间窗）
- 短期不接受：临时下调重建频率，避免撞限流

### 故障 E：openclaw.json 配置漂移

**症状：** `memory status --index` 显示 `requested: volcengine-agent`（非 token）或模型名不对。

**恢复：**
1. 与本文档 §"当前配置" 段对照
2. 直接编辑 `openclaw.json` 修正（受保护路径必须直接编辑）
3. `openclaw gateway restart`
4. 串行重建 8/8 agent 索引

## 注意事项

- **改 provider/model 后必须重建索引**：`openclaw memory index --force`，否则运行时报 index identity 不匹配。
- **gateway 重启刷新 session 缓存**：配置写入后，已存在的 session 可能仍缓存旧 provider。Gateway 重启后自动刷新。
- **不混用 Plan 与 multimodal key**：Agent Plan 专属 Base URL 含 `/plan`，multimodal endpoint 不含 `/plan`；走错路径会 401/403。
- **受保护路径**：`memorySearch` 全部字段都是受保护路径，`gateway config.patch` 无法修改，必须直接编辑 `openclaw.json` 后重启。
- **模型固定版本**：火山方舟建议固定使用同一版本的向量化模型，不要混用不同版本。
- **launchd plist 路径在治理仓外**：本机 `~/Library/LaunchAgents/` 是机器专属，新机器部署时需从架构师私仓或本地备份复制（plist 模板在治理仓外维护，不入治理仓）。
- **代理进程是 8/8 agent memory_search 的硬依赖**：代理挂掉 = 全员 memory_search paused。这是架构决策，**不引入冗余代理**（架构师结论）。

## 治理追踪

- 事故报告：
  - `docs/ops/memory-search-incident-2026-08-09.md`（阶段1 核验）
  - `docs/ops/memory-search-rootcause-2026-08-09.md`（根因定位）
  - `docs/ops/memory-search-reindex-2026-08-09.md`（阶段2 重建 + 新增整改项）
  - `docs/ops/memory-search-regression-acceptance-2026-08-09.md`（阶段2 回归验收）
- 个人学习记录：
  - `~/.openclaw/workspace-xian-zhang/.learnings/ERRORS.md` → ERR-20260809-001（治理报告事实错误）
  - `~/.openclaw/workspace-xian-zhang/.learnings/LEARNINGS.md` → LRN-20260809-002（治理报告进程归属双信号验证）
- 相关 agent：
  - 架构师 jia-goushi（plist / wrapper / Keychain key 维护）
  - 治理岗 xian-zhang（本机文档同步 + setup/ 双线维护）

## 配置参考

- OpenClaw 文档：`docs/concepts/memory-search.md`、`docs/reference/memory-config.md`
- 火山方舟 multimodal 文档：`https://www.volcengine.com/docs/82379/1520757`（方舟 multimodal endpoint 协议）
- 火山方舟 Agent Plan（v1 fallback 参考）：`https://console.volcengine.com/ark/region:cn-beijing/docs/82379/2375464`