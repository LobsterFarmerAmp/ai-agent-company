# Persona Audit Rules

Use these rules to simplify one agent's persona files. The goal is a small, stable execution contract — not a biography, project log, or SOP dump.

## Target budgets

Budgets are guidance, not hard truncation. Exceed only when there is a clear operational reason.

- `IDENTITY.md`: target ≤ 15 lines
- `USER.md`: target ≤ 15 lines
- `SOUL.md`: target ≤ 35 lines
- `AGENTS.md`: target ≤ 40 lines, excluding hook-injected company hard rules
- `TOOLS.md`: target ≤ 40 lines
- `MEMORY.md`: target ≤ 60 lines for durable facts/rules; move dated history to `memory/`

## File responsibilities

### AGENTS.md

Keep:
- workspace declaration
- startup/loading instructions
- governance rules specific to this workspace
- memory-writing boundaries
- at most one short pointer indicating that company-wide rules and skill router are injected by `~/.openclaw/hooks/company-guidelines/` (no restatement of content)

Remove:
- persona descriptions, role prose, “you are …” text
- stale priority/task lists
- anything already injected by `~/.openclaw/hooks/company-guidelines/handler.ts` (safety redlines, skill router from `company-hard-rules.md`) — do not restate locally
- detailed skill workflows that already exist as a skill (read the skill instead of copying its workflow into AGENTS.md)
- detailed SOPs that belong in company rules, project docs, or skills

### SOUL.md

Keep:
- Core: archetype and role temperament
- Judgment: decision style
- Collaboration: communication posture
- Boundaries: behavioral limits

Remove:
- domain technical knowledge
- project-specific SOPs
- exact commands/paths
- long motivational prose that does not change execution

### IDENTITY.md

Keep:
- Name
- Role: one sentence
- Operating Posture: 2-5 bullets

Remove:
- governance rules
- tool instructions
- detailed boundaries that belong in SOUL/AGENTS
- model names or provider details

### USER.md

Keep:
- user name
- preferred address
- user role/title
- direct superior / reporting relationship as relevant
- timezone
- 1-2 sentence context

Remove:
- agent self-description
- behavior instructions
- workflow rules
- technical/project details

Use `~/.openclaw/skills/company-org-chart/` as the authoritative org source.

### TOOLS.md

Keep only:
- Key Paths: critical paths only
- Useful Commands: commands actually used
- Operating Notes: short, durable tool gotchas

Remove:
- long warnings
- domain knowledge
- detailed SOPs
- env var values or plaintext secrets
- commands that violate company standards

### MEMORY.md

Keep:
- durable identity facts
- stable organization/collaboration facts
- long-lived user preferences
- durable project direction
- standing rules that survive project changes
- pointers to durable skill governance decisions (allowlist, disabled skills, skill ownership, must-keep skills)

Move out:
- dated incidents and session summaries → `memory/YYYY-MM-DD*.md`
- project-specific technical details → project docs or project-specific skill
- tool command recipes → `TOOLS.md` or skill references
- solved one-off debugging narratives → dated memory

Test: would this still matter if the agent switched projects? If not, move it out of `MEMORY.md`.

## Mandatory checks

For every persona file:

- Current line/byte count vs target budget.
- Stale model names, paths, commands, or tool names.
- Path existence for key paths.
- Company rule compliance: absolute company rule paths, env vars for credentials, no plaintext secrets.
- Org consistency with `~/.openclaw/skills/company-org-chart/`.
- Hook injection awareness: AGENTS.md (and other persona files) must NOT restate hook-injected content from `~/.openclaw/company-info/company-hard-rules.md` (safety redlines, skill router). Any local restatement is a HIGH-priority finding.

## Cross-file consistency

Check and report contradictions:

- `IDENTITY.md` ↔ `SOUL.md`: role and boundaries match?
- `AGENTS.md` ↔ `MEMORY.md`: governance and collaboration facts match?
- `TOOLS.md` ↔ `MEMORY.md`: paths and commands match?
- `USER.md` ↔ `~/.openclaw/skills/company-org-chart/`: reporting relationship correct?
- `MEMORY.md` ↔ `~/.openclaw/skills/company-org-chart/`: agent IDs, levels, reporting lines match?
- `AGENTS.md` ↔ `~/.openclaw/company-info/company-hard-rules.md`: AGENTS.md does not duplicate hook-injected redlines or skill router; if it references the router, it must point to the hook source rather than restate it.

Mark contradictions HIGH priority and state which source should win.

## Workspace cleanliness

Root should contain only durable bootstrap/persona files and intentional directories.

Allowed root files:
- `AGENTS.md`, `SOUL.md`, `IDENTITY.md`, `MEMORY.md`, `TOOLS.md`, `USER.md`
- `HEARTBEAT.md`, `DREAMS.md` if used

Allowed root directories:
- `memory/`, `skills/`, `avatars/`, `hooks/` if the agent owns local hooks, project directories intentionally owned by this agent

Everything else should be proposed for move/delete/archive. Do not move shared or cross-agent project directories without coordination.
