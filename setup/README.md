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
| `memory-search.md` | 记忆搜索配置方案、操作步骤与验证标准 |

## 更新原则

与 `bootstrap/` 一致：运行环境中验证有效的配置改进，先更新本目录文档，再同步部署。机器专属路径必须参数化，所有凭据必须保留在外部 Secret provider 中。
