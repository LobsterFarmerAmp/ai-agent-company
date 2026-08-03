---
name: persona-audit
description: "Audit and simplify one agent's persona files; produce a review plan for 架构师 without editing files."
---

# Persona Audit

Use when Boss or 架构师 asks an agent to audit/simplify its own persona files.

## Hard rules

- Audit only YOUR own workspace. Never inspect or edit other agents' workspaces unless explicitly asked by 架构师/Boss.
- Do **not** modify persona files. Produce a plan for review.
- Before auditing, read `~/.openclaw/company-info/company-hard-rules.md` and `~/.openclaw/hooks/company-guidelines/HOOK.md` to know what is hook-injected (safety redlines + skill router).
- Use `~/.openclaw/skills/company-org-chart/` as the authoritative org source.
- Use absolute paths when citing company rules or company info.
- `main` is never in scope.

## References

Load when running this skill:

- `references/rules.md` — file budgets, removal rules, consistency checks
- `references/templates.md` — required output template

## Workflow

1. Read your six persona files: `AGENTS.md`, `SOUL.md`, `IDENTITY.md`, `MEMORY.md`, `TOOLS.md`, `USER.md`.
2. Note `HEARTBEAT.md` / `DREAMS.md` anomalies only; they are not primary persona files.
3. Count current lines/bytes for each file.
4. List workspace-root files/directories, excluding `.git`, `.openclaw`, `memory/`, `skills/`, `avatars/`.
5. Apply `references/rules.md`.
6. Write `<agent-name>人设配置精简方案.md` with the template in `references/templates.md`.
7. Send the plan to 架构师 for review. If cross-session messaging is unavailable, present the plan in your current reply.

## Output contract

The plan must include:

- current size and target size per file
- keep / move / delete recommendations
- cross-file contradictions
- workspace cleanup items
- risks or coordination needed
- ordered execution steps

Do not execute the plan unless 架构师 approves it later.
