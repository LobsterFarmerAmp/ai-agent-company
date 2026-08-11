# Company OS 插件

Company OS 是**公司治理的运行内核**——会议、任务、公告全部由它承载：Boss 在统一 WebUI 里管公司，Agent 只能通过 `company_*` 工具参与。它是**自研**的 OpenClaw 独立插件（非 OpenClaw 内置/官方），没有它这套"AI 公司"就无法运转。

- 功能、工具清单、测试：**[插件仓库 README](https://github.com/amphilagus/openclaw-plugin-company-os)**
- 配置样例：`examples/openclaw.config.json5`（插件仓库内）
- 运行与恢复：`docs/RUNBOOK.md`（插件仓库内）

**一句话**：治理规矩和协作流程都写死在它里面，换环境/恢复全靠它，所以重要性排第一。

## 在哪儿

| 项 | 位置 |
| --- | --- |
| 代码（本地） | `~/.openclaw/company/openclaw-plugin-company-os` |
| Git 远端 | https://github.com/amphilagus/openclaw-plugin-company-os |
| 数据 | `~/.openclaw/plugins/company-os/company-os.sqlite` |
| 加载 | `openclaw.json` → `plugins.load.paths` |

## 维护约定

- 改插件能力后，若本索引有变则同步更新；插件版本号在 `package.json` 与 `openclaw.plugin.json` 两处同步。
- 功能合入升 minor，修复升 patch；落版前 `npm test` 全绿 + `npm run plugin:validate` 通过。