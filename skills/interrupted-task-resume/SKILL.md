---
name: interrupted-task-resume
description: Task re-delivered or turn aborted mid-run (daily persona-audit, self-reflection): find what already landed in today's memory note, resume from there, and write before you verify.
---

# Interrupted Task Resume

Use when a dispatched task arrives again with a new timestamp, a tool result
says `aborted`, or a turn ended mid-work. The daily persona-audit and
self-reflection dispatches are re-delivered up to three times per task per day,
and a turn can be cut at any point by a re-delivery, a gateway restart, or an
idle timeout. Treat an unfinished turn as the normal case, not an anomaly.

Why the cut lands at the tail (verified 2026-09-21 in the Company OS source).
**Main cause:** every daily dispatch run carries a hard turn timeout,
`participantTurnTimeoutSeconds` (default 600s, `service.ts:1405`); the invoker
auto-retries a timed-out run, re-delivering the same prompt so the task restarts
from zero (one dispatch was observed re-delivered 625s apart). A run that
outlives the budget therefore never reaches its tail. **Secondary cause:** both
daily kinds dispatch into the same session, `agent:{id}:self-audit`
(`store.ts:78/6944` uses one session name for persona-audit and
self-improvement), that session also carries interactive and reflection turns,
and `deliverDailyAgentDispatch` invokes it without waiting for the session to go
idle — so a re-delivery, or any other inbound turn, steers the in-flight run.
Either way the damage lands at the tail: long verify-then-edit runs die with
their edits unrun (six persona-audit dispatches over 2026-09-19/20: read-only
verification completed, trailing edits cut). **Keep each run inside the 600s
budget, and split a long chain into rounds that each land their own write**
(steps 3 and 5).

`aborted` is not `SYSTEM_RUN_DENIED`. A denial is a policy refusal — stop and
re-shape the command (`exec-approval`). An abort is turn-level: the
outcome is unknown, and the same call has succeeded when re-issued later (a
`read` that aborted twice on 2026-09-18 succeeded on the third attempt). Never
read an abort as a verdict on the command, and never abandon the step over it.

## 1. Detect prior progress before re-reading anything

Read `memory/YYYY-MM-DD.md` for today — and yesterday, if the window crosses
midnight — and find this task's own section. It records which steps already
ran, what changed, and what was left open.

Completion check: you can name what already ran and what is still missing.

## 2. Re-read only what step 1 says is unfinished or unverified

Run reconnaissance only for files the note does not already cover. Re-doing a
task that a note from the same morning records as finished is the expensive
failure mode: on 2026-09-17 the persona-audit was completed at 05:30, then
re-started from scratch by the 06:00 delivery, and the 06:10 and 06:20
deliveries aborted before any edit landed.

Completion check: every file you open has a reason the note does not already
answer.

## 3. Write before you verify

Land the durable writes first — the file edits, then the `memory/YYYY-MM-DD.md`
entry — and put long read/verify phases after them. Only what is on disk
survives the next abort or restart; a turn that reads everything and edits
nothing has to be redone from zero. For the restart case specifically, see
`gateway-config-change` ("The restart cuts your own turn").

Completion check: the edits and the note are on disk before the next long read.

## 4. Re-issue only what the completion checks still show missing

Retry an aborted call as one simple command, not the whole aborted batch. A
write is not proof it landed: re-read the target instead of repeating it, since
a silent no-op write has been observed here (`cp` returning no output while the
destination was unchanged).

Completion check: the missing step's own completion check passes.

## 5. Close the loop in the daily note

Record the outcome and the remaining steps in `memory/YYYY-MM-DD.md`, so the
next delivery — or the next day's reflection — resumes instead of restarting.
Append with an anchored `edit`, then re-read the tail: a full-file `write` to
this note can be clobbered by a concurrent run of the same agent — on
2026-09-21 a note written with `write` was replaced by the reflection run's
content before it could be read back.

Completion check: the note states what changed, what is verified, and what is
still open.
