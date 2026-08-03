---
name: company-guidelines
description: "Prepend company hard rules to every non-main agent's AGENTS.md at bootstrap time"
metadata:
  { "openclaw": { "emoji": "📋", "events": ["agent:bootstrap"] } }
---

# Company Guidelines Hook

Reads `~/.openclaw/company-info/company-hard-rules.md` and prepends its content to each non-main agent's `AGENTS.md` workspace bootstrap file before prompt injection.

The injected file contains:
- Universal safety redlines (always in effect)
- A skill directory index that routes agents to the correct company skill (`company-dialogue`, `company-task-dispatch`, `company-task-execution`, `company-code`, `company-reporting`, `company-org-chart`, `company-board`) before performing covered work.
