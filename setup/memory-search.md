# 记忆搜索配置

> 配置日期：2026-08-04  
> 执行者：架构师  
> 前置条件：bootstrap 完成，Gateway 本机运行，Ollama 已安装且有可用 embedding 模型

## 方案

使用本地 Ollama 提供 embedding，不依赖远程 API。

| 项目 | 值 |
|------|-----|
| Provider | `ollama` |
| Model | `qwen3-embedding:4b` |
| Fallback | `none`（本地服务，不做远程备用） |
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

## 前置检查

```bash
# 确认 Ollama 已安装
which ollama

# 确认 embedding 模型可用
ollama list | grep qwen3-embedding
```

如果 `qwen3-embedding:4b` 不存在，先拉取：

```bash
ollama pull qwen3-embedding:4b
```

## 配置内容

写入 `~/.openclaw/openclaw.json` 的 `agents.defaults.memorySearch`：

```json
{
  "enabled": true,
  "provider": "ollama",
  "model": "qwen3-embedding:4b",
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

注意：`memorySearch` 的所有字段都是受保护路径，`config.patch` 无法热加载，必须直接编辑配置文件。

### 2. 验证 JSON 合法性

```bash
python3 -c "import json; json.load(open('$HOME/.openclaw/openclaw.json')); print('JSON OK')"
```

### 3. 重启 Gateway

```bash
openclaw gateway restart
```

### 4. 重建记忆索引

```bash
openclaw memory index --force
```

### 5. 验证

```bash
# 检查索引状态
openclaw memory status --index

# CLI 搜索测试
openclaw memory search "架构师"

# 期望输出：
# - Provider: ollama
# - Model: qwen3-embedding:4b
# - 返回匹配的记忆片段
```

验收标准：

- `openclaw memory status --index` 显示 Provider 为 `ollama`，Model 为 `qwen3-embedding:4b`。
- `openclaw memory search` 返回匹配结果，不报 `index was built for model X, expected Y` 错误。
- Agent 运行时 `memory_search` 工具调用返回结果，`disabled` 为 `false`。

## 注意事项

- **改 provider/model 后必须重建索引**：`openclaw memory index --force`，否则运行时报 index identity 不匹配。
- **Gateway 重启刷新 session 缓存**：配置写入后，已存在的 session 可能仍缓存旧 provider。Gateway 重启后自动刷新。
- **Ollama 服务必须在线**：如果 Ollama 未运行，memory_search 会返回 unavailable，不会静默降级到 FTS-only。
- **向量维度**：qwen3-embedding:4b 输出 2560 维向量，由 sqlite-vec 自动管理，无需手动指定。
- **受保护路径**：`memorySearch` 全部字段都是受保护路径，`gateway config.patch` 无法修改，必须直接编辑 `openclaw.json` 后重启。

## 配置参考

- OpenClaw 文档：`docs/concepts/memory-search.md`、`docs/reference/memory-config.md`
- 配置手册：`/Users/amphilagusgu/Downloads/openclaw-config-reference.md` 第 4 节
