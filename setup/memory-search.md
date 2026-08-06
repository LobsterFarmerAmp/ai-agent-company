# 记忆搜索配置

> 配置日期：2026-08-04  
> 更新日期：2026-08-06  
> 执行者：架构师  
> 前置条件：bootstrap 完成，Gateway 本机运行，Agent Plan 已订阅并有专属 API Key

## 方案

使用火山引擎方舟 Agent Plan 的 `doubao-embedding-vision` 云端嵌入模型，不依赖本地 Ollama。

| 项目 | 值 |
|------|-----|
| Provider | `volcengine-agent`（解析为 `openai-compatible`） |
| Model | `doubao-embedding-vision` |
| Base URL | `https://ark.cn-beijing.volces.com/api/plan/v3` |
| API Key | Agent Plan 专属 API Key（Keychain） |
| Fallback | `none` |
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
| 向量维度 | 2048（doubao-embedding-vision 输出） |

## 变更历史

### 2026-08-06：从本地 Ollama 切换到云端 Agent Plan

**原因：** 本地 Ollama 运行 `qwen3-embedding:4b`（4B 参数）内存压力大，影响系统整体性能。

**变更：**
- Provider: `ollama` → `volcengine-agent`
- Model: `qwen3-embedding:4b` → `doubao-embedding-vision`
- 向量维度: 2560 → 2048
- 嵌入计算: 本地 CPU/GPU → 火山引擎云端
- 本地 Ollama 已停止，释放内存

**依据：** 火山方舟 Agent Plan 官方文档明确支持 OpenClaw 记忆搜索场景（文档路径：`/ark/region:cn-beijing/docs/82379/2375464`）。Coding Plan 虽然也支持嵌入模型，但有"不能用于 API 调用"的使用限制，不适合记忆搜索场景。

## 前置检查

```bash
# 确认 volcengine-agent provider 已在 openclaw.json 中配置
python3 -c "
import json
d=json.load(open('$HOME/.openclaw/openclaw.json'))
p=d['models']['providers'].get('volcengine-agent',{})
print('baseUrl:', p.get('baseUrl'))
print('models:', [m['id'] for m in p.get('models',[])])
"
# 期望输出：
# baseUrl: https://ark.cn-beijing.volces.com/api/plan/v3
# models: [..., 'doubao-embedding-vision']
```

如果 `doubao-embedding-vision` 不在 models 列表中，添加它：

```json
{"id": "doubao-embedding-vision", "name": "Doubao Embedding Vision"}
```

## 配置内容

写入 `~/.openclaw/openclaw.json` 的 `agents.defaults.memorySearch`：

```json
{
  "enabled": true,
  "provider": "volcengine-agent",
  "model": "doubao-embedding-vision",
  "fallback": "none",
  "sources": ["memory", "sessions"],
  "extraPaths": [],
  "store": {
    "driver": "sqlite",
    "vector": {
      "enabled": true
    }
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

## 操作步骤

### 1. 合并配置

将上述 JSON 合并进 `~/.openclaw/openclaw.json` 的 `agents.defaults` 下。

注意：`memorySearch` 的所有字段是受保护路径，`config.patch` 无法热加载，必须直接编辑配置文件。

### 2. 验证 JSON 合法性

```bash
python3 -c "import json; json.load(open('$HOME/.openclaw/openclaw.json')); print('JSON OK')"
```

### 3. 重启 Gateway

```bash
openclaw gateway restart
```

### 4. 重建记忆索引

对所有 agent 重建索引：

```bash
openclaw memory index --force --agent jia-goushi
openclaw memory index --force --agent lin-zhiheng
openclaw memory index --force --agent shen-gu
openclaw memory index --force --agent lu-jian
openclaw memory index --force --agent wei-shu
```

### 5. 验证

```bash
# 检查索引状态
openclaw memory status --deep --agent jia-goushi

# 期望输出：
# - Provider: openai-compatible (requested: volcengine-agent)
# - Model: doubao-embedding-vision
# - Vector dims: 2048
# - Embeddings: ready
# - Dirty: no
```

验收标准：

- `openclaw memory status --deep` 显示 Provider 为 `openai-compatible`，Model 为 `doubao-embedding-vision`。
- `openclaw memory search` 返回匹配结果，不报 `index was built for model X, expected Y` 错误。
- Agent 运行时 `memory_search` 工具调用返回结果，`disabled` 为 `false`。

## 注意事项

- **改 provider/model 后必须重建索引**：`openclaw memory index --force`，否则运行时报 index identity 不匹配。
- **Gateway 重启刷新 session 缓存**：配置写入后，已存在的 session 可能仍缓存旧 provider。Gateway 重启后自动刷新。
- **Agent Plan API Key 不可与 Coding Plan 混用**：Agent Plan 专属 Base URL 包含 `/plan`，使用 Coding Plan 的 key 会认证失败。
- **受保护路径**：`memorySearch` 全部字段都是受保护路径，`gateway config.patch` 无法修改，必须直接编辑 `openclaw.json` 后重启。
- **模型固定版本**：火山方舟建议固定使用同一版本的向量化模型，不要混用不同版本。

## 配置参考

- OpenClaw 文档：`docs/concepts/memory-search.md`、`docs/reference/memory-config.md`
- 火山方舟 Agent Plan 向量化模型文档：`https://console.volcengine.com/ark/region:cn-beijing/docs/82379/2375464`
