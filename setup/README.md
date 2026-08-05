# 基础施工

`setup/` 记录架构师上线后自行完成的基础设施配置--在 bootstrap 之上、让龙虾池真正可运转的必要设施。

与 `bootstrap/` 的分工：

| 目录 | 执行者 | 时机 | 内容 |
|------|--------|------|------|
| `bootstrap/` | Codex | 架构师上线前 | 仓库部署、Keychain、模型 Provider、Gateway token、初始配置 |
| `setup/` | 架构师 | 上线后 | 记忆搜索、Skills 安装、Hooks 安装、人设替换、Workboard、插件、Channel、Heartbeat 等 |

## 目录内容

| 路径 | 作用 |
|------|------|
| `memory-search.md` | 记忆搜索配置（ollama + qwen3-embedding:4b） |
| `skills-install.md` | 技能安装与 API Key 配置（self-improving-agent、tavily、imap-smtp-email） |
| `hooks-install.md` | Hooks 配置（compaction-notifier、self-improvement） |
| `session-dreaming.md` | Session 重置策略与 Dreaming 记忆整理 |
| `incidents/2026-08-04-tavily-secretref-startup.md` | Tavily SecretRef 导致 Gateway 启动失败的根因与修复 |
| `cto-agent-lin-zhiheng.md` | CTO Agent（林知衡 / lin-zhiheng）配置 |
| `agent-setup-guide.md` | Agent 配置通用操作规程（命名、workspace、注册、验证） |
| `image-model-switch.md` | 视觉模型从 kimi-k3 切换到 doubao-seed-2.0-pro |

## 更新原则

与 `bootstrap/` 一致：运行环境中验证有效的配置改进，先更新本目录文档，再同步部署。机器专属路径必须参数化，所有凭据必须保留在外部 Secret provider 中。
