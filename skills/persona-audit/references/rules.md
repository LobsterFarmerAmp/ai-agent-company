# Persona Audit Rules

## Target budgets

Budgets are guidance, not hard truncation. Exceed only when there is a clear operational reason.

- `IDENTITY.md`: ≤ 15 lines
- `USER.md`: ≤ 15 lines
- `SOUL.md`: ≤ 35 lines
- `AGENTS.md`: ≤ 40 lines, excluding hook-injected company hard rules
- `TOOLS.md`: ≤ 40 lines
- `MEMORY.md`: ≤ 60 lines for durable facts/rules; move dated history to `memory/`

## Per-file rules

### AGENTS.md

Keep: workspace declaration, startup/loading instructions, workspace-specific governance, memory-writing boundaries, one short pointer to hook-injected content.

Remove: persona descriptions, stale task lists, **anything already in `company-hard-rules.md`** (hook injects it), skill workflows that exist as skills, detailed SOPs.

### SOUL.md

Keep: archetype/temperament, decision style, communication posture, behavioral limits.

Remove: domain knowledge, project SOPs, exact commands/paths, long motivational prose.

### IDENTITY.md

Keep: name, role (one sentence), operating posture (2-5 bullets).

Remove: governance rules, tool instructions, detailed boundaries, model names.

### USER.md

Keep: user name, preferred address, role/title, reporting relationship, timezone, 1-2 sentence context.

Remove: agent self-description, behavior instructions, workflow rules, technical details.

### TOOLS.md

Keep: critical paths, commands actually used, short durable gotchas.

Remove: long warnings, domain knowledge, detailed SOPs, plaintext secrets.

### MEMORY.md

Keep: durable identity facts, stable org/collaboration facts, long-lived preferences, standing rules.

Move to `memory/`: dated incidents, session summaries, project-specific details, solved debugging narratives.

Test: would this still matter if the agent switched projects? If not, move it out.

## Mandatory checks

- Line/byte count vs target budget.
- Stale model names, paths, commands, tool names.
- Key paths still exist.
- No plaintext secrets; credentials via env vars.
- Org consistency with `company_org_list`.
- **Hook duplication**: persona files must NOT restate content from `~/.openclaw/company-info/company-hard-rules.md`. Any restatement is HIGH priority — delete it.

## Cross-file consistency

| Pair | Check |
|---|---|
| IDENTITY ↔ SOUL | Role and boundaries match? |
| AGENTS ↔ MEMORY | Governance and collaboration facts match? |
| TOOLS ↔ MEMORY | Paths and commands match? |
| USER ↔ `company_org_list` | Reporting relationship correct? |
| MEMORY ↔ `company_org_list` | Agent IDs, levels, reporting lines match? |

Contradictions: fix in favor of the authoritative source (org-chart > MEMORY > IDENTITY).

## Reality sync

After structural checks, verify persona files match the latest real state by reviewing the last 24h of activity:

**Sources to check:**
- `memory_search` — query for the agent's own name, role, recent decisions, corrections, rule changes
- Latest `memory/YYYY-MM-DD.md` files — read the most recent 1-2 daily memory files
- `sessions_history` — scan recent session messages for decisions or corrections not yet captured

**What to look for:**
- New durable facts: role changes, new responsibilities, updated collaboration relationships
- Boss corrections or feedback that change how the agent should operate
- New standing rules discovered during work (e.g. "this project uses pnpm not npm")
- Updated tool paths, environment details, or credentials scope
- Organizational changes visible via `company_org_list`

**Action:** update the relevant persona file to reflect the current truth. If a session/memory item is dated and project-specific, it belongs in `memory/` not in persona files — but if it changes a durable fact, the persona file must be updated to match.

## Workspace cleanliness

Root should contain only:

- **Allowed files**: `AGENTS.md`, `SOUL.md`, `IDENTITY.md`, `MEMORY.md`, `TOOLS.md`, `USER.md`, `HEARTBEAT.md` (if used)
- **Allowed dirs**: `memory/`, `skills/`, `avatars/`, `hooks/` (if agent owns local hooks), intentional project dirs

Everything else: move, archive, or delete. Do not move cross-agent project directories without Boss coordination.
