# AGENTS.md

Guidance for coding agents (Codex, Claude Code) working in this repository. This is the single source; `CLAUDE.md` only imports it.

## What this is

Vibe-coded prototypes ("toys") that show what Quantum State might look and feel like. Toys are smoke and mirrors: fake data, scripted AI, nothing breaks. They are not the MVP.

There is one app, `app/`, for the whole toybox (decision QS-030). New toys are built on branches, and their requirements are added to `PRD.md`. Build nothing for later toys ahead of time. The first toy is the Governance Brain. It is designed but not built yet: `app/` holds only a placeholder.

## Sources of truth

- `PRD.md` covers behavior, scope, stack, allowed dependencies, fixtures, build order and acceptance checks (A1–A11, which map to behaviors B1–B16). Read it before planning any app work.
- `DESIGN.md` covers looks: section 1 is the universal toy style every toy uses, section 2 is the Governance Brain.
- Figma (file `lWqJ4xxExzCi9KsAotwLDe`, Toy Designs) beats DESIGN.md on looks. If they disagree, report the conflict and never "fix" DESIGN.md yourself.
- For whoever builds the app, `PRD.md`, `DESIGN.md`, `README.md` and everything outside `app/` are read-only. All app files (package files, config, source, assets, build output, `app/qa/` screenshots) go inside `app/`. No root-level config.

## Stack and limits (from PRD §6)

- React + Vite + TypeScript, from the default template. State lives in local component state.
- The allowed dependencies are only: `react`, `react-dom`, `vite`, `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom`, `@base-ui/react`, and optionally `d3-force` with `@types/d3-force`. Anything else, ESLint included, needs approval.
- Not allowed: no UI kit, CSS framework, state library, router, backend, live AI calls, analytics, or mobile layout. The minimum viewport is 1280px.
- Base UI (unstyled) handles the standard controls only (the PRD lists the mapping). The Graph, Wheel, sphere, details panel, insight cards and risk ledger are custom React and SVG. Every visual comes from DESIGN.md tokens.
- Fixtures live in `app/src/data/{documents,wheels,smart-search}.json`. Keep the PRD's filenames, fields, domain names and insight tags.
- Popups need `isolation: isolate` on the app root. Vite `base: '/product-toybox/app/'` (GitHub Pages). Google Fonts is the only external request allowed.

## Commands (run from `app/` once it is scaffolded)

```
npm install
npm run dev
npm run typecheck
npm run build
npm run preview
```

There is no test runner. Acceptance means typecheck and build after the last edit, then walking the PRD §8 checks in the user's Chrome (Claude in Chrome or the Codex Chrome plugin) at 1280 and 1440px, never in a terminal browser. Report each check as pass, fail or unverified.

## Working rules

- Stop and record a blocker if a change needs behavior the docs don't cover, an unlisted dependency, or a write outside `app/`, then carry on with independent work. Silence is never approval.
- Work on a branch, never on `main`. Commit after each milestone, push the branch and open a pull request to `main`; the user reviews and merges. Commit subjects are short and descriptive ("Add DESIGN.md"), no prefixes.

## Tasks (tsk)

Tasks live on the user's tsk board, and this repo is a tsk project. Run these commands from the repo root so new tasks land here. Every new task gets its ordered steps straight away, the way you would write your own todo list. Tick each step as you finish it.

```
tsk list --json                     # this project's live tasks
tsk list T12 --json                 # one task: notes, steps (short_id), thread
tsk add -t "Verb-first outcome" -n "notes" --thread setup
tsk status T12 start                # when you begin
tsk steps T12 add "step text"
tsk steps T12 toggle <short_id>     # not idempotent: re-list before retrying
tsk edit T12 --notes "…"            # replaces the whole notes body
tsk status T12 review               # hand back; only the user marks done
```
