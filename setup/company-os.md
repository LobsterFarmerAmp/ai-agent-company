# Company OS 插件

> 本文档记录 Company OS 插件的**当前能力与部署约定**（对齐 v0.7.0）。插件源码与完整说明见 `~/openclaw/company/openclaw-plugin-company-os`（下文简称“插件仓库”）。本文不复制插件 README 的每一条细节，只沉淀部署与运维所需的稳定事实。

## 是什么

`company-os` 是**自研的 OpenClaw 独立插件**（非 OpenClaw 内置/官方，代码由我们维护在 `~/.openclaw/company/openclaw-plugin-company-os`），把公司治理收敛到一套共享基础设施和三类业务对象：**会议、严格层级任务、公司公告**。Boss 在统一 WebUI 操作，Agent 只能通过 `company_*` 工具参与。

- **自研**：git 作者均为 `amphilagus`，从零开发，非 OpenClaw 官方项目产物。
- 独立插件，通过 `plugins.load.paths` 加载（不是 OpenClaw 内置插件）。
- 数据落 `company-os.sqlite`（默认 `~/.openclaw/plugins/company-os/company-os.sqlite`）。
- 前端 React + Vite，三个真实路由：`meeting-room`（会议室）、`tasks`（任务树）、`notices`（告示板）。
- 要求 OpenClaw `>=2026.7.1` 与支持 `node:sqlite` 的 Node.js。

## 安装与加载

```bash
cd ~/.openclaw/company/openclaw-plugin-company-os
npm install
npm test
npm run plugin:validate
openclaw plugins install --link ~/.openclaw/company/openclaw-plugin-company-os
openclaw config set gateway.controlUi.embedSandbox trusted
# 改插件/配置后必须强制重启进程（gateway tool 的 restart 可能被 coalesced 合并，插件不重载）
openclaw gateway restart
```

关键配置（见插件仓库 `examples/openclaw.config.json5`）：

- `plugins.entries.company-os.hooks.allowConversationAccess=true`：用于可信工具上下文回写会议专属 session。
- `organizationAdminAgentId`：显式指定组织架构师（默认取 OpenClaw 默认 Agent 的 ID）。
- 会议 `meetingAutoEndDelaySeconds`（默认 60）、公告 `noticeUnreadReminders.enabled/startHour/endHour`、任务回转池系数与工作窗口、每日自省治理 `dailySelfImprovement` / `dailyPersonaAudit` 等。

## 核心约束（稳定事实）

1. **一个 Boss、一间会议室、单一 Gateway、单一 SQLite。**
2. **任务是严格树，不是 DAG**：根任务只能由 Boss 派给一级直属员工；子任务以分阶段任务流原子创建，阶段内并行、阶段间按屏障顺序激活。任务只能自下而上关闭，负责人携 proof 提交 review，派发者验收后关闭。
3. **会议严格串行**；任务会议结束时子任务、总结、汇报公告、read mark、终局同步在同一事务原子提交。`bossParticipates=true` 时等待 Boss 手动开始，结束权固定归 Boss。
4. **公告不可编辑**，修正用 `supersedesNoticeId` 发新公告。
5. **Boss 写操作服务端固定记录 `actor=boss`**；Agent 身份只读取可信 `toolContext.agentId`。
6. **每位 Agent 预建 `meeting` 固定 session**（推荐 key `agent:<agentId>:meeting`）；`meeting_messages` 是共享事实源，main 只接收入会通知和散会总结。
7. 会议进入终态后向主持人及全部参会 Agent 的 main 写可见系统总结，全员送达后释放绑定。

## v0.7.0 功能面（相对 v0.6.0 的增量）

- **会议治理**：dedicated meeting session runtime（`MeetingControlState` 状态机、`MeetingSessionMode` dedicated/legacy_main）、BossMeetingGate 与会前拒绝、普通会议 60s 自动结束与重启恢复、全终态逐成员终局同步与严格散会屏障、会议历史页、系统头像。
- **验收交接**：`review-handoff`（workspace 交付 + `functionalVerification` 一键验收命令）、`EvidenceInput`、boss-task-correction API（二次审查不通过 / 恢复取消）。
- **任务附件**：`TaskImageAttachment` 图片附件 + 附件样式。
- **任务编排**：task flows v15（`expectedRevision` 追加/替换 waiting 阶段）、rolling pool（FIFO 回转池 + 个人倒计时 + 工作窗口/暂停）、prompt countdown 强化。
- **任务树 UI / registry**：task registry、task tree stage 控件。

## 与治理仓库的维护约定

- **双线维护**：改插件能力后，必须同步更新本文档与 setup/README 索引；插件版本（`package.json` + `openclaw.plugin.json`）与能力描述保持一致。
- **插件仓库**是唯一事实源，本文档只做部署侧索引；完整工具清单、测试覆盖、boss 参会细节见插件仓库 README。
- **版本节奏**：功能性改动合入 `main` 时升 minor（0.7.0 → 0.8.0），修复合入时升 patch。改完必须 `npm test` 全绿 + `npm run plugin:validate` 通过后再落版。

## 工具面一览

| 模块 | 工具 |
| --- | --- |
| 收件箱 | `company_inbox` |
| 组织 | `company_org_list` / `company_org_add` / `company_org_update` / `company_org_deactivate` |
| 告示板 | `company_notice_list` / `company_notice_read` / `company_notice_publish` |
| 会议 | `company_meeting_request` / `list` / `status` / `speak` / `delegate` / `set_task_drafts` / `yield_to_boss` / `submit_summary` / `end` / `cancel` |
| 任务 | `company_task_list` / `read` / `create` / `flow_update` / `start` / `progress` / `revise` / `block` / `unblock` / `submit` / `review` / `reassign` / `cancel` / `correct` |

## 踩坑记录（运维必读）

- **改配置/插件后必须强制重启真实进程**：gateway tool 的 restart 可能被 coalesced 合并（pid/etime 不变、插件没重载），必须用 `openclaw gateway restart` 并确认 pid/etime 变化，否则 `company_org_add` 报 "OpenClaw agent does not exist"。
- **新 Agent 入职必须预建 `main` + `meeting` 两个 session**：`ensureSession` 按 key 查找，漏建 meeting 会抛 "pre-created session named meeting is missing"，阻塞会议。
- **插件版本号在两处同步**：`package.json` 与 `openclaw.plugin.json`。
- `dist/`、`web/dist/` 不纳入版本控制，是构建产物；改源码后重新 `npm run build`。