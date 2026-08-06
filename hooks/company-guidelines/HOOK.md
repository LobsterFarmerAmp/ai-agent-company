---
name: company-guidelines
description: "Prepend company hard rules to every agent's AGENTS.md at bootstrap time, including jia-goushi"
metadata:
  { "openclaw": { "emoji": "📋", "events": ["agent:bootstrap"] } }
---

# Company Guidelines Hook

Reads `~/.openclaw/company-info/company-hard-rules.md` and prepends its content to every agent's `AGENTS.md` workspace bootstrap file before prompt injection. The `jia-goushi` agent is included because it serves as the OpenClaw architect in this deployment.

The injected file contains:
- Universal safety redlines (always in effect)
- A skill directory index that routes agents to the correct company skill (`company-dialogue`, `company-task-dispatch`, `company-task-execution`, `company-code`, `company-reporting`, `company-org-chart`) before performing covered work.
- Company OS meeting participation rules for participants and hosts.
