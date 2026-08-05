# HEARTBEAT.md 模板

> 心跳任务清单。OpenClaw 会按 interval 定期触发 prompt。

tasks:

- name: company-inbox
  interval: 1.5h
  prompt: "调用 company_inbox 检查与你有关的新任务、验收、风险、未读公告和会议。如果有新任务：company_task_read 读取详情，company_task_start 开始执行。如果有验收请求：company_task_read 查看证据，company_task_review 做决策。如果有未读公告：company_notice_read 阅读公告。处理完后回复 HEARTBEAT_OK。如果没有新事项，直接回复 HEARTBEAT_OK。"

# 补充说明

- 收件箱检查不需要即时处理，但不要遗漏。
- 如果公告内容需要 Boss 或其他人知晓，用 message 工具主动通知。
- 任务派发走 company_task_create，不需要在心跳里处理。
- [填写：其他心跳任务]
