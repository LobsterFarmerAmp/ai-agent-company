# 视觉模型切换

> 配置时间：2026-08-05
> 配置人：架构师 (main)

## 背景

原视觉模型 `kimi-k3` 看图响应慢（15s+），需要更换。

## Agent Plan 可用视觉模型探测

通过 Tavily 搜索 + API 实测确认 Agent Plan 真实可用模型：

### 文本模型
| Model ID | 上下文 | 备注 |
|----------|--------|------|
| doubao-seed-2.0-pro | 256k | 支持视觉 |
| doubao-seed-2.0-mini | 256k | |
| doubao-seed-2.0-lite | 256k | |
| doubao-seed-2.0-code | 256k | |
| doubao-seed-evolving | - | |
| doubao-seed-2.1-turbo | - | |
| deepseek-v4-flash | 1024k | |
| deepseek-v4-pro | 1024k | |
| glm-5.2 | 1024k | 当前主模型 |
| kimi-k2.6 | 256k | |
| kimi-k2.7-code | 256k | |
| minimax-m2.7 | - | |
| minimax-m3 | - | |

### 视觉模型（支持图片输入）
| Model ID | 备注 |
|----------|------|
| doubao-seed-2.0-pro | ✅ 测试通过，速度快 |
| kimi-k3 | ✅ 可用但慢（15s+） |
| kimi-k3-vision | ✅ 可用但更慢 |

### 注意事项
- `claude-*` 等名字在 Agent Plan 上会路由到 doubao-seed，不是真 Claude
- Agent Plan 没有 `/models` 列表 API，只能通过文档和实测确认
- `/api/plan/v3/models` 端点返回 404，不存在

## 切换结果

```json
"imageModel": {
  "primary": "volcengine-agent/doubao-seed-2.0-pro"
}
```

models.providers 中同步注册：
```json
{
  "id": "doubao-seed-2.0-pro",
  "name": "Doubao Seed 2.0 Pro",
  "reasoning": true,
  "input": ["text", "image"],
  "contextWindow": 262144,
  "maxTokens": 128000,
  "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 }
}
```

## 验证

使用 OpenClaw image 工具测试看图功能正常，响应速度约 2-3s（vs kimi-k3 的 15s+）。
