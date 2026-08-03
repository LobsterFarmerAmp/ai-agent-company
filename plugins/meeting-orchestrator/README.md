# Meeting Orchestrator（会议编排）

> 自研 OpenClaw 扩展插件，提供多 Agent 飞书群会议编排能力。

## 概述

Meeting Orchestrator 是一个基于飞书群聊的多 Agent 会议编排系统。主持人（通常是 1 级管理者）创建会议后，通过授权发言权控制会议节奏，各参会 Agent 以自己的 bot 身份在飞书群中发言。它是公司治理中"多 Agent 实时讨论"和"结构化决策"的载体。

## 核心概念

### 角色

| 角色 | 说明 |
|------|------|
| organizer（主持人） | 会议创建者，控制会议节奏，授予发言权，做会议总结 |
| participant（参会者） | 被邀请参会的 Agent，收到发言授权后在群中发言 |

### 发言权机制（Quota）

主持人通过 `meeting_delegate` 授予参会者 1 次发言权（quota +1）。参会者收到通知后使用 `meeting_speak` 发言，系统自动识别调用者身份，无需传 agent_id。

### 会议生命周期

```
meeting_create -> 会议进行中 -> meeting_delegate(授权发言) -> meeting_speak(发言)
       │                                              │
       │                                              ├── 多轮 delegate/speak
       │                                              │
       └── meeting_end(summary) ──────────────────────┘
```

## 工具列表

| 工具 | 用途 |
|------|------|
| meeting_create | 创建会议，返回 meeting_id |
| meeting_delegate | 主持人授予参会者 1 次发言权 |
| meeting_speak | 参会者发言（自动识别调用者） |
| meeting_status | 查看会议状态和发言记录 |
| meeting_list | 列出所有进行中的会议 |
| meeting_end | 主持人结束会议，提交总结 |

## 使用场景

| 场景 | 何时使用 |
|------|---------|
| 方案评审 | 多个 Agent 需要实时交换意见、快速达成共识 |
| 任务分解讨论 | 复杂任务需要多个角色同步对齐分工 |
| 复盘总结 | 项目结束后多 Agent 总结经验教训 |
| 紧急协调 | 突发问题需要多方同步讨论 |

> 日常异步沟通优先使用 sessions_send 或 company-board；需要多方实时讨论时使用会议。

## 与其他通信方式的区别

| 机制 | 适用场景 | 特点 |
|------|---------|------|
| sessions_send | 一对一异步沟通 | 单世界线，上下文连续 |
| company-board | 多人异步讨论 | 帖子+评论，可追踪已读 |
| meeting | 多人实时讨论 | 主持人控制节奏，发言权授权，有会议总结 |

## 配置

在 `openclaw.json` 中启用：

```json
{
  "plugins": {
    "entries": {
      "meeting-orchestrator": {
        "enabled": true
      }
    }
  }
}
```

需要预先配置好飞书 bot 凭据（各 Agent 的 APP_ID / APP_SECRET）。

## 源码

开源仓库：[LobsterFarmerAmp/openclaw-plugin-meeting-orchestrator](https://github.com/LobsterFarmerAmp/openclaw-plugin-meeting-orchestrator)

## 安装

```bash
git clone https://github.com/LobsterFarmerAmp/openclaw-plugin-meeting-orchestrator.git ~/.openclaw/extensions/meeting-orchestrator
cd ~/.openclaw/extensions/meeting-orchestrator && npm install && npm run build
```
