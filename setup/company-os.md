# Company OS 插件（索引）

> 本文档是**索引**，不是插件说明的副本。插件是什么、怎么用、有哪些功能，**一律以插件仓库为准**，本文只回答"它是什么、在哪儿、怎么加载、去哪看细节"。

## 是什么

Company OS 是**我们自研**的 OpenClaw 独立插件（非 OpenClaw 内置/官方），承载公司治理：会议、严格层级任务、公司公告。Boss 用统一 WebUI 操作，Agent 只能通过 `company_*` 工具参与。

## 在哪儿

| 项 | 位置 |
| --- | --- |
| 代码（本地） | `~/.openclaw/company/openclaw-plugin-company-os` |
| Git 远端 | `https://github.com/amphilagus/openclaw-plugin-company-os.git` |
| 数据 | `~/.openclaw/plugins/company-os/company-os.sqlite` |
| 加载 | `openclaw.json` → `plugins.load.paths` |

## 去哪看细节

- 功能、工具清单、测试：插件仓库 `README.md`（唯一事实源，本文不复制）。
- 配置样例：插件仓库 `examples/openclaw.config.json5`。
- 运行与恢复：插件仓库 `docs/RUNBOOK.md`。

## 维护约定

- 改插件能力后，同步更新本索引（若有变化）与 `setup/README.md` 表格。
- 插件版本号在 `package.json` 与 `openclaw.plugin.json` 两处同步；功能合入升 minor，修复升 patch。
- 落版前必须 `npm test` 全绿 + `npm run plugin:validate` 通过。