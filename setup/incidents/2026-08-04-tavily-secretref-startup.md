# Tavily SecretRef 导致 Gateway 启动失败

> 发生日期：2026-08-04  
> 状态：已修复

## 现象

- `openclaw gateway restart` 报告服务保持停止，18789 端口一直空闲。
- LaunchAgent 已加载，但进程立即以退出码 `1` 结束。
- 稳定性记录报告 `macos_keychain_tavily` exec provider 退出码 `44`。

## 根因

Tavily Keychain 解析器使用 `$USER` 定位 Keychain 账户，但 provider 配置只通过
`passEnv` 传递 `HOME`。LaunchAgent 的净化环境没有 `USER`，所以交互式 shell
中能成功的脚本在 Gateway 进程中失败。

净化环境复现：

```text
current resolver in launchd-like env: exit=44
id-derived account in launchd-like env: exit=0
```

## 修复

解析器改为使用 `/usr/bin/id -un` 推导当前账户，不依赖环境变量：

```sh
#!/bin/sh

account=$(/usr/bin/id -un)
exec /usr/bin/security find-generic-password \
  -a "$account" \
  -s "tavily_api_key" \
  -w
```

## 验收

- 解析器在 `env -i` 净化环境中退出码为 `0`。
- `openclaw config validate` 通过。
- `openclaw secrets audit --check --allow-exec` 显示无明文、无未解析引用。
- Gateway 恢复 `running`，连通探针为 `ok`。
- Dashboard `http://127.0.0.1:18789/` 返回 HTTP 200。
- canonical Main 会话 `agent:main:main` 保持完整。

## 预防规则

- exec Secret 解析器不得依赖未在 `passEnv` 中明确声明的环境变量。
- Keychain 解析器必须在 `env -i HOME="$HOME" PATH=/usr/bin:/bin` 环境中验收。
- 配置新的必需 SecretRef 后，必须立即重启 Gateway 并检查深度状态。
