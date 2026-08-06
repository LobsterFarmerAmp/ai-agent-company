---
name: persona-audit
description: "Audit and directly simplify an agent's own persona files; fix bloat, contradictions, and workspace clutter in-place."
---

# Persona Audit

Use when Boss asks an agent to audit and simplify its own persona files.

## Hard rules

- Audit only YOUR own workspace. Never inspect or edit other agents' workspaces unless explicitly asked by Boss.
- Before auditing, read `~/.openclaw/company-info/company-hard-rules.md` and `~/.openclaw/hooks/company-guidelines/HOOK.md` to know what is hook-injected.
- Use `company_org_list` as the authoritative org source for consistency checks.
- `main` is never in scope.

## References

Load when running this skill:

- `references/rules.md` - file budgets, removal rules, consistency checks, workspace cleanliness

## Workflow

1. Read your six persona files: `AGENTS.md`, `SOUL.md`, `IDENTITY.md`, `MEMORY.md`, `TOOLS.md`, `USER.md`.
2. Note `HEARTBEAT.md` / `DREAMS.md` anomalies only; they are not primary persona files.
3. Count current lines/bytes for each file.
4. List workspace-root files/directories, excluding `.git`, `.openclaw`, `memory/`, `skills/`, `avatars/`.
5. Apply `references/rules.md`.
6. **Directly edit** persona files: trim over-budget content, remove hook duplication, resolve cross-file contradictions, clean up workspace.
7. Report what was changed.

## Output

Brief summary after editing:

- Per file: before → after line count, key changes
- Cross-file contradictions found and resolved
- Workspace cleanup actions taken
- Anything needing Boss coordination (e.g. cross-agent project files)
