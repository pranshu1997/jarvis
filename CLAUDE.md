# Global Claude Configuration

This file is synced to every project under ~/code/ by the `sync_claude` script.
It defines universal conventions and agent routing that apply regardless of project.

---

## Project Context (REQUIRED on every task)

### On every task start
1. Read `context/history.md` — recent session log (last 30 days; older entries in `context/archive/`)
2. Read `context/decisions.md` — architectural decisions and key choices
3. Read `context/gotchas.md` — known bugs, pitfalls, and unexpected behaviors
4. Read `context/todo.md` — current task scratchpad (done / in-progress / blocked)
5. Read `CONVENTIONS.md` — code style, naming rules, folder structure (read before writing any code)

If the `context/` directory doesn't exist, invoke `context-manager` to bootstrap it.

### On every task completion
1. Append a brief summary to `context/history.md` (date, task, what changed, files touched)
2. If an architectural or design decision was made: append to `context/decisions.md`
3. If a bug or unexpected behavior was found: append to `context/gotchas.md`
4. Update `context/todo.md`: mark completed items done, add new items discovered
5. If `context/history.md` has entries older than 30 days: move them to `context/archive/history-YYYY-MM.md`

### CONVENTIONS.md enforcement
Before writing any code, read `CONVENTIONS.md`. If a task would violate a convention, flag it explicitly before proceeding. If no `CONVENTIONS.md` exists, invoke `context-manager` to create one.

These files are the persistent memory for this project across sessions. Always read them before planning or implementing — they contain context not visible in the code.

### Automation (Claude Code hooks)

Projects synced via `sync_claude` include `.claude/settings.json` hooks that:

- **SessionStart** — inject a short summary from `context/` into the session
- **SessionEnd** — append a git-based stub to `context/history.md` if there were commits in the last 24h
- **PostToolUse (Bash)** — refresh the stub after `git commit`
- **Stop** — prompt hook nudges Claude to update `context/history.md` before stopping when work was done

Hooks call scripts in `~/code/claude_config/hooks/`. Cursor uses the same `context/` files via `.cursor/rules/project-context.mdc`; invoke the `update-project-context` skill at session end in Cursor.

Per-project stack and commands belong in `CLAUDE.project.md` (merged into `CLAUDE.md` on sync, never overwritten).

### Deprecated files

Do not create or update `MEMORY.md` or `STATUS.md`. Cross-session memory lives in `context/`; live session task state goes in `context/todo.md` via `recorder`.

---

## Definition of Done

A task is done when:
- The code change works correctly for the stated requirement
- Existing tests pass (or no tests exist yet)
- No new lint errors introduced
- The change is committed with a clear message
- `context/history.md` has been updated with a summary of what was done
- `context/todo.md` has been updated to reflect current task state

Do not mark a task done if tests are red, the build is broken, or the requirement is only partially met.

---

## Git Workflow

- Default branch is `main`
- Work directly on `main` for infrastructure, tooling, and solo projects
- Use short-lived feature branches (`feature/<slug>`) only when a PR review is needed
- Commit messages: use prefixes `add:`, `fix:`, `update:`, `remove:`, `refactor:`, `docs:`
- Never amend published commits; create a new commit instead
- Never force-push to `main`
- Never skip hooks (`--no-verify`) without explicit user instruction
- Always stage specific files — never `git add -A` blindly when sensitive files may be present

---

## Agent Routing Rules

Use the right sub-agent for each class of work. Do not default to the general-purpose agent when a specialist is available.

| Task | Agent |
|---|---|
| Bootstrap or update project context files | `context-manager` |
| Explore codebase / find files / search code | `Explore` |
| Plan implementation strategy | `Plan` |
| Design feature architecture (multi-file) | `code-architect` |
| Trace existing code execution paths | `code-explorer` |
| Write or modify production code | `implementer` |
| Simplify complex code after implementation | `code-simplifier` |
| Run tests, lint, commit, open PR | `verifier` |
| Trace bugs and fix errors | `debugger` |
| Improve code structure without changing behavior | `refactorer` |
| Design new features / write specs | `planner` |
| Review a spec before implementation | `spec-reviewer` |
| Critique an architecture / find simpler alternatives | `architecture-critic` |
| Read-only codebase research | `researcher` |
| Deep-read legacy codebases | `legacy-analyst` |
| Write characterization tests for legacy code | `test-engineer` |
| Scan for security issues | `security-auditor` |
| Review code for bugs, quality, conventions | `code-reviewer` |
| Find silent failures and swallowed errors | `silent-failure-hunter` |
| Review PR test coverage | `pr-test-analyzer` |
| Review type design quality | `type-design-analyzer` |
| Analyze code comments for accuracy/rot | `comment-analyzer` |
| Write tests for new or existing code | `tester` |
| Update CHANGELOG after a merge | `changelog` |
| Maintain live task state in `context/todo.md` during a session | `recorder` |
| Time agent runs | `timer` |
| Simulate side-effectful scripts before running | `dry-run` |
| Multi-step tasks with no single specialist | `general-purpose` |

---

## Task size routing

| Size | Examples | Workflow |
|------|----------|----------|
| **Trivial** | Typo, comment, one-line fix | Edit directly → commit → update `context/history.md` |
| **Small** | Single file, obvious test | Read context → implementer → verifier |
| **Medium+** | Multi-file, new behavior | Full Standard Task Workflow below |
| **Risky** | Auth, email sends, money, deletes | Add `security-auditor` and/or `dry-run` before implementer |

Do not invoke `planner` or `Plan` for trivial changes.

---

## Standard Task Workflow

For any non-trivial task, follow this sequence:

1. Read `context/history.md`, `context/decisions.md`, `context/gotchas.md`
2. `Explore` or `researcher` — understand relevant code
3. `Plan` or `planner` — design the approach (skip for small/obvious changes)
4. `implementer` — write the code
5. `tester` — add tests if new behavior was introduced
6. `code-reviewer` or `silent-failure-hunter` — review before committing
7. `verifier` — run tests, lint, commit, push
8. Update `context/history.md` (and `decisions.md` / `gotchas.md` if applicable)

---

## Background Execution Rules

- Run agents in the background (`run_in_background: true`) only when their result is not needed before the next step
- Never sleep-poll a background agent — wait for the completion notification
- Foreground agents: research that informs the next action, any agent whose output is an input to another agent
- Background agents: independent record-keeping (`recorder`), timing (`timer`), parallel linting

---

## Sub-Agent Routing Logic

Before spawning any sub-agent:
1. Identify whether the task is read-only (research/explore) or write (implement/fix)
2. Pick the most specific agent for the task — avoid general-purpose when specialist applies
3. Provide a detailed prompt: include file paths, function names, error messages, and expected outcome
4. Avoid duplicating work — if an agent is researching, do not run the same searches in the main context
5. After implementation, always run `verifier` as the final step before handing back to the user

---

## Response Style

- Short and direct — lead with the action or answer, not the reasoning
- No trailing summaries of what was just done
- No emojis unless the user explicitly requests them
- Reference code locations as `file_path:line_number`
- Ask before taking irreversible or high-blast-radius actions (destructive git ops, pushing, deleting)


---

# Project overrides

# Project: jarvis

## Stack
- TypeScript, Next.js (App Router), React
- Supabase (auth, DB)
- UI: Radix, Tailwind

## Test / lint commands
- Dev: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build`

## Key directories
- Source: `src/app/`, `src/components/`
- API routes: `src/app/api/`

## Project-specific conventions
- Do not commit `.env.local` or Supabase secrets
- WebAuthn and session routes under `src/app/api/auth/`
