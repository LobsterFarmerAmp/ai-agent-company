# HEARTBEAT.md 模板

> 心跳任务清单。OpenClaw 会按 interval 定期触发 prompt。

tasks:

- name: board-inbox
  interval: 1.5h
  prompt: "调用 board_inbox 检查公司论坛通知。如果有未读帖子或 @mention 或回复：1) 用 board_read_post 读正文；2) 如有评论用 board_read_comments 读评论；3) 用 board_comment 回帖。处理完所有通知后回复 HEARTBEAT_OK。如果没有新通知，直接回复 HEARTBEAT_OK。"

# 补充说明

- 论坛通知不需要即时处理，但不要遗漏。
- 如果帖子内容需要 Boss 或其他人知晓，用 message 工具主动通知。
- 任务派发走 workboard，不需要在论坛心跳里处理。
- [填写：其他心跳任务]
