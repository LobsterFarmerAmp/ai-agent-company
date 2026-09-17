# Persona Audit Rules

## Target budgets

Budgets are guidance, not hard truncation. Exceed only when there is a clear operational reason.

- `IDENTITY.md`: ≤ 15 lines
- `USER.md`: ≤ 15 lines
- `SOUL.md`: ≤ 35 lines
- `AGENTS.md`: ≤ 90 lines, excluding hook-injected company hard rules. Since the 2026-09-16 platform migration, `openclaw doctor --fix` archives `TOOLS.md` into the `## Tools` section of `AGENTS.md`; the historical 40+40 content budget is unchanged and roughly 10 of the lines are merge framing. Keep net-zero growth: new lines must displace equal lines.
- `TOOLS.md`: retired — do not recreate it; the platform re-archives it. Audit its former content under `AGENTS.md §Tools`.
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

Retired by the platform: do not create or restore it. Verify the former content still exists under `AGENTS.md §Tools` (critical paths, commands actually used, short durable gotchas); if a durable note is missing, add it there and stay within the AGENTS.md budget. A reappearing `TOOLS.md` is a migration artifact — fold it into `AGENTS.md`, do not maintain it. When folding it in, keep critical paths/commands/short gotchas and drop long warnings, domain knowledge, detailed SOPs, and plaintext secrets.

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
| AGENTS §Tools ↔ MEMORY | Paths and commands match? |
| USER ↔ `company_org_list` | Reporting relationship correct? |
| MEMORY ↔ `company_org_list` | Agent IDs, levels, reporting lines match? |

Contradictions: fix in favor of the authoritative source (org-chart > MEMORY > IDENTITY).

## Budget measurement

Measure `MEMORY.md` against its 60-line budget by **agent-authored content only**: stop counting at the first `## Promoted From Short-Term Memory` heading. The marked legacy-keywords block counts toward the budget (keep it ≤ 8 lines).

Machine-managed regions are excluded from both the budget and the legacy-keyword check:

- `## Promoted From Short-Term Memory (...)` sections and their `<!-- openclaw-memory-promotion:... -->` comments (dreaming automation).
- Hook-injected company hard rules.

Report the machine-region line count separately (e.g. `24/60 durable + 55 machine`). Clean the machine regions with the `memory-budget-cleanup` skill when a single file holds more than 20 such lines or more than 2 dated promotion sections.

## Legacy-narrative keyword check

When checking a persona file set for software-era residue, scan for the legacy keyword set:
`超人计划` / `superman-plan` / `pnpm` / `monorepo` / `卡路里` / `calorie` / `实机体验平台` / `自主调试平台` / `agent-engine` / `Expo` / `drizzle`.

- **Only whitelisted span**: in `MEMORY.md` only, the block between `<!-- legacy-keywords:start -->` and `<!-- legacy-keywords:end -->` (the 检索守则 / 思想钢印 block). Keywords inside that span are intentional — they exist so `memory_search` can hit stale references — and must NOT be reported as residue.
- A missing, unclosed, duplicated, or misplaced whitelist span is itself a finding.
- Everything outside the whitelist span is zero-tolerance residue.
- The block counts against the `MEMORY.md` budget (≤ 60 lines); keep it ≤ 8 lines.

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

- **Allowed files**: `AGENTS.md`, `SOUL.md`, `IDENTITY.md`, `MEMORY.md`, `USER.md`, `HEARTBEAT.md` (if used)
- **Allowed dirs**: `memory/`, `skills/`, `avatars/`, `hooks/` (if agent owns local hooks), intentional project dirs

Everything else: move, archive, or delete. Do not move cross-agent project directories without Boss coordination.
