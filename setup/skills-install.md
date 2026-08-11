# 技能安装

> 配置日期：2026-08-04  
> 更新日期：2026-08-06  
> 执行者：架构师

## 已安装技能

### self-improving-agent 4.0.1

- **来源**：ClawHub `@pskoett/self-improving-agent`
- **功能**：记录教训、错误、纠正，形成持续改进闭环
- **安装方式**：`openclaw skills install @pskoett/self-improving-agent`

与项目 `skills/self-improvement/` 本地版本（4.0.0）的差异：
- ClawHub 4.0.1 是 OpenClaw 专用版，移除了多平台支持
- 多了 hooks（session-end 错误扫描 + bootstrap 提醒）
- 多了 assets 模板和 CHANGELOG
- 少了 `learnings.py` CLI 管理工具（4.0.0 起移除）

### imap-smtp-email 0.0.19

- **来源**：ClawHub `@gzlicanyi/imap-smtp-email`
- **功能**：通过 IMAP/SMTP 收发邮件，支持多邮箱服务商
- **安装方式**：`openclaw skills install @gzlicanyi/imap-smtp-email`
- **安全扫描**：clean（静态扫描 + VirusTotal 均通过）
- **配置文件**：`~/.config/mail-skills/.env`（权限 600）

### coding-agent（bundled）

- **来源**：OpenClaw 内置
- **功能**：将编码任务委派给 Claude Code 等 coding agent
- **安装方式**：随 OpenClaw 捆绑，无需额外安装
- **配置详情**：见 [`coding-agent.md`](coding-agent.md)

## Web 搜索配置

### 2026-08-06：Tavily skill 替换为内置 web_search

**变更：** 移除独立的 Tavily skill（`~/.openclaw/skills/tavily/`），改为安装 Tavily 插件（`@openclaw/tavily-plugin`）作为内置 `web_search` 工具的 provider。

**原因：** OpenClaw 内置 `web_search` 工具 + Tavily 插件提供 provider 支持，比独立 skill 更集成化，无需通过 exec 调用 Python 脚本。

**当前配置：**

```json
{
  "tools": {
    "web": {
      "search": {
        "enabled": true,
        "provider": "tavily"
      }
    }
  }
}
```

Tavily API Key 通过环境变量 `TAVILY_API_KEY` 注入（写入 `~/.openclaw/service-env/ai.openclaw.gateway.env`），Keychain 解析器保留不变。

**安装方式：**

```bash
openclaw plugins install @openclaw/tavily-plugin
```

**注意：** Tavily 插件仅提供 `web_search` provider 支持，不再有独立的 `tavily_search` / `tavily_extract` 工具。如需 URL 内容提取，使用内置 `web_fetch` 工具。

## Tavily API Key 配置

### 1. 存入 Keychain

```bash
security add-generic-password \
  -a "$USER" \
  -s "tavily_api_key" \
  -U \
  -w
```

### 2. 安装 Keychain 解析器

```bash
install -m 700 \
  bootstrap/bin/openclaw-keychain-tavily \
  ~/.openclaw/bin/openclaw-keychain-tavily
```

解析器脚本内容：

```sh
#!/bin/sh

account=$(/usr/bin/id -un)
exec /usr/bin/security find-generic-password \
  -a "$account" \
  -s "tavily_api_key" \
  -w
```

不能在解析器中使用 `$USER`。OpenClaw 的 exec Secret provider 使用净化环境，
而本配置的 `passEnv` 只传递 `HOME`；LaunchAgent 下 `$USER` 为空时，`security`
会以退出码 `44` 报告无法找到 Keychain 条目，并导致 Gateway 启动失败。

### 3. 注入环境变量

在 `~/.openclaw/service-env/ai.openclaw.gateway.env` 中添加：

```bash
export TAVILY_API_KEY='***'
```

Keychain 解析器在 Gateway 启动前解析并注入环境变量。

### 4. 验证

```bash
# 在 LaunchAgent 类似的净化环境中测试，不输出 Key
env -i HOME="$HOME" PATH=/usr/bin:/bin \
  ~/.openclaw/bin/openclaw-keychain-tavily >/dev/null
echo $?
```

## IMAP/SMTP Email 配置

### 1. 配置文件

配置存储在 `~/.config/mail-skills/.env`（权限 600）：

```bash
PROVIDER=qq
USERNAME=your@qq.com
PASSWORD=<授权码，不是QQ密码>
ALLOWED_READ_DIRS=~/Downloads
ALLOWED_WRITE_DIRS=~/Downloads
```

QQ 邮箱需要 IMAP/SMTP 授权码，在 QQ 邮箱设置 -> 账户 -> POP3/SMTP 服务中生成。

### 2. 安装依赖

```bash
cd ~/.openclaw/workspace/skills/imap-smtp-email
npm install --production
```

### 3. 验证

```bash
node scripts/imap.js check
```

返回最新邮件 JSON 即为成功。

### 注意事项

- 授权码是邮箱专用密码，不是 QQ 登录密码。
- 配置文件权限必须 600，禁止他人读取。
- `ALLOWED_READ_DIRS` / `ALLOWED_WRITE_DIRS` 限制附件读写范围。
