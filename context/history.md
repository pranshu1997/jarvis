# History

Session log — most recent first. Entries older than 30 days are archived to context/archive/.

### [2026-06-08] — Added external XP-award endpoint for the Personal OS (`POST /api/xp/award`)
**What changed:** Added `src/app/api/xp/award/route.ts` and `src/lib/auth/external.ts` (`isExternalAuthorized`/`FORGE_API_TOKEN` — a shared-secret bearer-token check mirroring Strata's `isAuthorized`/`STRATA_API_TOKEN` pattern). The route looks up the sole local user directly (no session — this is server-to-server), applies a flat `amount` of XP via the existing `total_xp`/`levelFromXp` machinery, and appends a `recentXpEvents` entry with no streak/combo/momentum multipliers (those describe Forge's own habit cadence, not an external one-off award). Documented `FORGE_API_TOKEN` in `.env.example`.
**Why:** Closes the gap in the Personal OS spec's §6 ("expose an `awardXp(event)` that the router and Janus can call, so habit logging happens via Vox instead of manual entry") — this existed in the spec but was never built when Janus/Forge were scaffolded. Janus's `completeTask` now calls it (see `janus/context/history.md`).
**Verified live:** ran Forge in local mode, POSTed a real award, confirmed `total_xp`/`recentXpEvents[0]` updated correctly in `data/users.json`, then drove the full chain from Janus with Playwright (click "Done" → Strata task `done` → this endpoint → +15 XP with correct `entity_id`). Reverted all test XP/events afterward — no residue.
**Files affected:** `src/app/api/xp/award/route.ts` (new), `src/lib/auth/external.ts` (new), `.env.example`
**Open threads:** Mind's router could call this too when it routes a habit/workout capture (the spec mentions "habit logging happens via Vox") — not wired yet; `entityType`/`source` are already generic enough to support it without changes to this endpoint.

<!-- git-backfill -->

### [backfill] — Rebuild Jarvis as a full-stack personal evolution RPG.
**What changed:** `b91354b` Rebuild Jarvis as a full-stack personal evolution RPG.
**Files affected:** (see `git show b91354b --stat`)
**Open threads:** —

### [backfill] — first_attempt
**What changed:** `268ca1b` first_attempt
**Files affected:** (see `git show 268ca1b --stat`)
**Open threads:** —

