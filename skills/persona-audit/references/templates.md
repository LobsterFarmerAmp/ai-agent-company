# Persona Audit Output Templates

## Single-agent persona simplification plan

Write the plan as `<agent-name>人设配置精简方案.md`.

```markdown
# <agent-name>人设配置精简方案

## 1. Overview

- Agent: `<agentId>` / <agent-name>
- Workspace: `<absolute-path>`
- Audited files: AGENTS, SOUL, IDENTITY, MEMORY, TOOLS, USER
- Main conclusion: <1-3 bullets>

## 2. Size budget

| File | Current lines | Current bytes | Target lines | Verdict |
|---|---:|---:|---:|---|
| AGENTS.md | | | ≤40 (hook injection not counted) | |
| SOUL.md | | | ≤35 | |
| IDENTITY.md | | | ≤15 | |
| USER.md | | | ≤15 | |
| TOOLS.md | | | ≤40 | |
| MEMORY.md | | | ≤60 | |

## 3. Per-file findings

### AGENTS.md

- Keep:
- Move:
- Delete:
- Hook restatement check (HIGH if any local restatement of safety redlines or skill router from `~/.openclaw/company-info/company-hard-rules.md`):
- Suggested structure:

### SOUL.md

- Keep:
- Move:
- Delete:
- Suggested structure:

### IDENTITY.md

- Keep:
- Move:
- Delete:
- Suggested structure:

### USER.md

- Keep:
- Move:
- Delete:
- Suggested structure:

### TOOLS.md

- Keep:
- Move:
- Delete:
- Suggested structure:

### MEMORY.md

- Keep:
- Move to `memory/`:
- Move to project docs/skills:
- Delete:
- Suggested structure:

## 4. Cross-file contradictions

| Priority | Files | Problem | Source of truth | Suggested fix |
|---|---|---|---|---|

## 5. Workspace cleanup

| Path | Type | Recommendation | Needs coordination? |
|---|---|---|---|

## 6. Risks / coordination

- <risk or none>

## 7. Execution plan

1. <ordered step>
2. <ordered step>
3. <ordered step>

## 8. Non-execution statement

This is a proposal only. No persona files were modified.
```
