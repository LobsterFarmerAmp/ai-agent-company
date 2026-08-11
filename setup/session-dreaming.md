# Session 与 Dreaming 配置

> 配置日期：2026-08-04  
> 执行者：架构师

## Session 配置

位置：`openclaw.json` -> `session`

```json
{
  "session": {
    "dmScope": "per-channel-peer",
    "reset": {
      "mode": "daily",
      "atHour": 4
    }
  }
}
```

| 字段 | 值 | 说明 |
|------|-----|------|
| `dmScope` | `per-channel-peer` | DM 按频道+对方隔离，不同渠道不同对话 |
| `reset.mode` | `daily` | 每日定时重置 |
| `reset.atHour` | `4` | 凌晨 4:00 重置（Asia/Shanghai） |

### 注意事项

- `session` 全部字段是受保护路径，必须直接编辑 `openclaw.json` 后重启。
- 每日重置不会清空记忆文件，只重置会话上下文（transcript）。
- `session-memory` hook 可在重置时自动保存会话摘要。

## Dreaming 配置

位置：`openclaw.json` -> `plugins.entries.memory-core.config.dreaming`

```json
{
  "plugins": {
    "entries": {
      "memory-core": {
        "config": {
          "dreaming": {
            "enabled": true,
            "frequency": "0 3 * * *",
            "timezone": "Asia/Shanghai"
          }
        }
      }
    }
  }
}
```

| 字段 | 值 | 说明 |
|------|-----|------|
| `enabled` | `true` | 启用记忆整理 |
| `frequency` | `0 3 * * *` | 每天凌晨 3:00 执行 |
| `timezone` | `Asia/Shanghai` | 时区 |

### Dreaming 三阶段

| 阶段 | 作用 | 写入 |
|------|------|------|
| Light | 排序和暂存近期短期记忆 | 否 |
| REM | 反思主题和重复想法 | 否 |
| Deep | 评分并提升持久候选到 MEMORY.md | 是 |

### 产出文件

- `memory/.dreams/` -- 机器状态（recall store、phase signals）
- `DREAMS.md` -- 人类可读的梦境日记
- `MEMORY.md` -- Deep 阶段提升的持久记忆

### 注意事项

- Dreaming 默认使用主模型（GLM-5.2）运行 Dream Diary 子代理。
- 如需指定模型，设置 `dreaming.model`，但需要同时设置 `plugins.entries.memory-core.subagent.allowModelOverride: true`。
- Dreaming 是 opt-in 功能，默认关闭。
