# Quantum State toy: stages 5–7 implementation plan

Date: Tu-10-Nov 2026.
Deadline: Thursday night, Th-12-Nov 2026.
Status: Jacques approved the combined contract below.
This file plans the build. It does not authorize a build launch.

## 1. Delivery outcome

Dad creates one Query from prepared evidence. He tests the decision in the Room. He downloads the reviewed board material.

Build Query, Board Simulation Room, and Export Query in the existing app.
Keep the Governance Brain working.
Keep all AI behavior scripted.
Do not build upload, phase 1, or keyboard shortcuts.

Jacques puts his dad's dummy data in `app/src/data` himself.
Agents do not collect that data.
The build uses the current data first.
Dad's data plugs in when it is ready.
Dad's files use the same JSON format as the current data.
No build leaf waits for dad's data.
Jacques merges `style/query-space` into `main` before implementation starts.
Builders then work on a branch from the updated `main`.
Builders never merge or publish.

Refine Room and Export in code on the style page.
Do not add a Figma step.
Use `terminal-browser` for browser checks.
Export must download a file.

## 2. Approved contract

The following contract preserves the approved wording.

## Dad's click path
1. Click New Query in the sidebar.
2. Enter a question and focus. Select documents from Jacques's prepared fixture. Click Create Query.
3. Inspect a node or link and its source. Click Generate Analysis.
4. Read the sourced Analysis. Click Open Board Simulation Room.
5. Review the fixed setup. Click Run simulation.
6. Review What emerged. Open the disagreement detail and its evidence. Click Prepare for the board.
7. Review the Standard draft. Click Download HTML. Open the downloaded file.

## Query behavior and cuts
- Require a nonblank question, focus, and at least one supplied document before Create.
- Keep one active Query in memory. Disable New Query while that Query exists. Reload resets the toy.
- Use only relationships supplied in the fixture. Never invent a relationship between selected documents.
- Show source passages through the existing local viewer. Label absent source content as unavailable.
- Generate one deterministic Analysis. Keep agreement, conflict, assumptions, and unknowns distinct. Mark unsupported conclusions as unknown.
- Lock the evidence and focus after creation. Cut node add/remove, focus edits, regeneration, AI suggestions, hub, history, extra boards, and chats.
- Keep Smart Search Create a query disabled for this route. New Query in the sidebar is the only creation entry.

## Room behavior and cuts
- Require a generated Analysis before Room opens. Direct sidebar navigation obeys the same gate.
- Use the approved scenario: Can we proceed with the decision in this Query, and under what conditions?
- Fix Finance, Risk, Operations, and Challenger. Show the model as a scripted local-model representation, not an actual running model.
- Complete the four scripted steps at 2, 4, 6, and 8 seconds. Disable duplicate starts. Keep progress on navigation. Stop the timer at completion.
- Show agreement, material disagreement, and a missing-evidence condition. Base the script on Jacques's supplied case. Do not force a sourced claim that the fixture cannot support.
- Require opening the disagreement detail before Prepare. Keep assumptions, sources, and agent reasoning available one level down.
- Prepare retains one reviewed result. Rerun replaces it and invalidates the export draft. Cut configurable agents/models/prompts and version history.

## Export behavior and cuts
- Require a prepared, reviewed Room result. Direct sidebar navigation obeys the same gate.
- Offer Standard detail and HTML download only. Cut destinations, scope variants, alternate detail levels, and evidence attachments.
- Build the preview and file from the same current snapshot.
- Include question, focus, evidence summary, Analysis, Room findings, assumptions, unknowns, reasoning summary, source references, confidence, freshness, and scripted/model labels.
- Mark unavailable metadata explicitly. Escape supplied content. Make the HTML self-contained. Make no external requests.
- Show the filename after download initiation. Do not claim that the browser saved the file successfully. Keep Download available for retry.

## PRD amendments and checks
- Update §§1–7 and §9 for this scope, supplied fixtures, local state, source-of-truth exceptions, build order, and Th-12-Nov deadline.
- Keep B9/A9's disabled Smart Search Create action. Narrow old Query/fixture prohibitions to permit this route.
- Align AGENTS.md's browser, source, and named documentation-write rules. Keep code-first Room/Export refinement.
- Add checks for Query validation, supplied relationships, real Analysis output, source viewing, gated navigation, fixed timed Room completion, artifact review, rerun invalidation, preview/file equality, HTML escaping, and reset.
- Run typecheck/build after the last edit. Test production preview at the Pages base path.
- Use terminal-browser at 1280 and 1440 CSS pixels. Save screenshots, console/network evidence, and download inspection under app/qa/.
- Preserve existing Brain checks except named contract amendments. Keep upload, phase 1, and keyboard shortcuts out.
- Jacques approves the PRD diff before builders start. Jacques merges branches. No builder merges or publishes.

## 3. Build facts and boundaries

The current branch is `style/query-space`.
Production `App.tsx` still serves the Brain.
The style sidebar has full example content for only one Query.
Other style sidebar entries lead to placeholders.

`StageStyles.tsx` contains all three stage examples.
The Room example never completes its run.
The Export example does not download a file.
Several Query buttons have no behavior.
The chooser currently drops document IDs from its creation callback.
The Query graph currently creates generic relationships when adding documents.
Do not carry those shortcuts into the build.

Keep the existing Brain fixture files unchanged in this build.
Stages 5–7 read documents in the current `documents.json` format.
A stage script file adds what that format does not hold: the demo selection, the Analysis findings and the Room script.
The stage script refers to documents by their IDs.
Thus dad's data replaces files of the same format, and the stage code does not change.
Do not add production Brain edge selection to this scope.
Query node and link inspection remain required.
Jacques decided on Tu-10-Nov: "Query graph link clicks are enough for Thursday."
A link cannot start a Query in this build. T71 and T74 move out of this build.

Existing untracked files under `app/qa/` may be Jacques's work.
Do not delete, overwrite, or commit those files as a group.
Put new evidence under `app/qa/thursday-toys/`.

## 4. Shared implementation contract

Leaf 1.3 defines the TypeScript interfaces before feature work starts.
Use existing dependencies. Do not install a router, state library, PDF library, or test runner.
Keep stage state in React component state above the page switch.
Keep the Brain mounted when switching to a stage page.
Pass the Brain an inactive state when it is not visible.
Preserve the existing arrival pause behavior.

The shared interfaces cover these records:

- A case identifies supplied documents, relationships, sources, Analysis findings, and Room script entries.
- A Query records its ID, question, focus, selected document IDs, and selected relationship IDs.
- An Analysis records its Query ID and four finding groups.
- A source reference identifies its document and passage. Missing content has an explicit unavailable state.
- A Room run records its ID, start time, status, completed steps, result, and review state.
- An export snapshot records the Query, Analysis, reviewed run, claims, metadata, and source references.

Carry document IDs through creation. Do not reduce the selection to a count.
Only include supplied relationships whose endpoints belong to the Query.
Only include claims supported by the selected evidence.
If the selection lacks evidence for a scripted finding, mark the finding unsupported or unknown.
Never present the full case script as evidence for an unrelated selection.

Use one run ID for each rerun.
Reject completion events from an older run ID.
Use elapsed time to derive the four completion steps.
Navigation must not restart the clock or create another timer.
Rerun clears the prior review state and export snapshot.

Build the preview and HTML serializer from the same immutable snapshot.
Escape text and attributes in the serializer.
Do not embed executable supplied HTML or active source URLs.
Include readable source references in the downloaded file.
Do not attach source documents.
Use a local Blob download. Release its object URL after use.

Leaf 1.3 fixes exported names and callback signatures in `contracts.ts`.
Later leaves consume that file without changing it.
If an interface must change, stop affected work and return the change to its owner.

## 5. Agent Routing

The build orchestrator uses Claude Code, `Opus 5.5 @ medium`.
The designer uses Claude Code, `Opus 5.5 @ medium`.
Ordinary implementation uses Codex, `gpt-6.1-sol @ medium`.
Bounded fixture checks use Codex, `gpt-6-luna @ medium`.
Independent critique uses opencode, `google/gemini-4-argon` only.
The critic reviews other agents' work. The critic does not implement fixes.

Use `Sonnet 5 @ high` when the documented provider fallback applies.
Apply the usage ladder in Agent Routing before each dispatch.
Do not raise effort merely because the deadline matters.

Do not send private case data or screenshots to a free model.
Give the critic redacted contracts, code, and synthetic evidence only.
Keep any private evidence review with the trusted builder and Jacques.
A free-model experiment is not a delivery dependency.
Do not update Agent Routing or vault articles during this build.

## 6. Unlazy tree and leaf contracts

Use the scope `thursday-toys` during execution.
Create execution ledgers only after Jacques authorizes the build.
Keep those ledgers untracked under `.unlazy/thursday-toys/`.

The tree has three branches:

- Branch 1 establishes the contract and data handoff.
- Branch 2 builds and integrates the three stages.
- Branch 3 verifies and releases the toy.

All owned paths below are relative to `/home/jacq/Work/product-toybox/`.
Every leaf also owns its ledger at `.unlazy/thursday-toys/gates/leaf-<ID>.md`.
The orchestrator owns the scope plan, root ledger, branch ledgers, and dispatch records.
Those metadata paths do not grant permission to edit product files.

Each leaf has one release gate below.
The gate fails if any named assertion fails or lacks evidence.
These are planned gates. None has passed yet.

### Leaf 1.1 — Establish the build contract

- **Work:** Draft the narrow PRD and AGENTS changes in section 2. Map each new behavior to an acceptance ID. Show the diff to Jacques.
- **Owner:** Claude Code, `Opus 5.5 @ medium`. Jacques approves the diff.
- **Owns:** `PRD.md`; `AGENTS.md`.
- **Needs first:** None.
- **Gate 1.1:G1:** Jacques approves the exact diff. The diff covers every approved behavior and removes conflicting instructions without expanding the scope.

This leaf has a named documentation exception to the app-only write rule.
Do not edit `DESIGN.md`, `README.md`, or vault notes.

### Leaf 1.2 — Merge the style baseline

- **Work:** Review and merge `style/query-space` into `main`. Record the merged commit. Keep unrelated untracked QA files untouched.
- **Owner:** Jacques. The Opus orchestrator records the result.
- **Owns:** No file edits. This leaf owns only the approved branch merge and its gate evidence.
- **Needs first:** None.
- **Gate 1.2:G1:** `git merge-base --is-ancestor <approved-style-commit> main` exits zero, and Jacques confirms the merged baseline.

Do not substitute a builder merge for Jacques's merge.

### Leaf 1.3 — Define the stage interfaces

- **Work:** Define the shared records and callbacks in section 4. Add pure readiness and run-transition functions. Add dependency-free assertion checks.
- **Owner:** Codex, `gpt-6.1-sol @ medium`.
- **Owns:** `app/src/stages/contracts.ts`; `app/src/stages/state.ts`; `app/src/stages/state.check.ts`.
- **Needs first:** 1.1, 1.2.
- **Gate 1.3:G1:** The state checks reject invalid Query creation, premature Room/Export entry, duplicate starts, and stale run completion. They prove rerun invalidation.

### Leaf 1.4 — Write the build case from the current data

- **Work:** Write the stage script for the current data: the demo selection, the Analysis findings and the Room script. Refer only to document IDs and links in `documents.json`. Mark missing evidence explicitly.
- **Owner:** Codex, `gpt-6.1-sol @ medium`. Jacques approves the case question and the script.
- **Owns:** `app/src/data/stage-script.json`.
- **Needs first:** 1.3.
- **Gate 1.4:G1:** Every ID in the stage script resolves in `documents.json`. Jacques approves the case question and the script.

Do not edit `documents.json` in this leaf.

### Leaf 1.5 — Validate and adapt the case

- **Work:** Load the case through the approved interfaces. Validate source references, relationship endpoints, and selection-dependent findings. Report missing input to Jacques.
- **Owner:** Codex, `gpt-6-luna @ medium`.
- **Owns:** `app/src/stages/case.ts`; `app/src/stages/case.check.ts`.
- **Needs first:** 1.3, 1.4.
- **Gate 1.5:G1:** The adapter checks accept the supplied case and reject deliberately broken references. A reduced selection cannot retain unsupported sourced claims.

Do not edit the data or the stage script to make the check pass.

### Leaf 2.7 — Plug in dad's data

- **Work:** Jacques puts dad's files in `app/src/data`. Dad's files replace the Brain data entirely: `documents.json`, `wheels.json` and `smart-search.json`. Rewrite the stage script for his case. Run the 1.5 checks, the Brain checks and the full route on his data.
- **Owner:** Codex, `gpt-6.1-sol @ medium`. Jacques supplies the files and approves the script.
- **Owns:** `app/src/data/stage-script.json`. Jacques owns dad's data files.
- **Needs first:** 2.6, and dad's files.
- **Gate 2.7:G1:** The 1.5 checks and the Brain checks pass on dad's data. The Brain and the route show no Meridian text. The route reaches the download.

Jacques decided on Tu-10-Nov that dad's files replace the Brain data entirely.
Leaf 1.1 must loosen the seed rules in PRD B13–B15 and DESIGN.md 2.9 references for this, so that the Brain checks do not depend on the current seed.

This leaf is not on the critical path.
If dad's files are not ready by Th-12-Nov 15:00, release on the current data.
Keep gate 2.7:G1 unmet and report it as open.

### Leaf 2.1 — Refine Room and Export on the style page

- **Work:** Refine both screens in one serial design loop. Show setup, run, completion, review, gated preparation, Standard preview, and download notice states. Remove cut controls.
- **Owner:** Claude Code, `Opus 5.5 @ medium`. Jacques reviews the screens.
- **Owns:** `app/src/style/StageStyles.tsx`.
- **Needs first:** 1.3, 1.5.
- **Gate 2.1:G1:** Jacques approves the Room and Export state walkthrough on the style page. No visible control implies an excluded behavior.

One designer owns the shared file. Do not dispatch separate concurrent Room and Export editors.
The Query builder uses the existing Query direction. It does not redesign the approved style.

### Leaf 2.2 — Build the stage shell

- **Work:** Add a production sidebar and page host. Keep the Brain as the default. Hold shared stage state above navigation. Expose only the active Query and its gated Room/Export entries.
- **Owner:** Codex, `gpt-6.1-sol @ medium`.
- **Owns:** `app/src/App.tsx`; `app/src/App.css`; `app/src/stages/StageHost.tsx`; `app/src/stages/StageSidebar.tsx`; `app/src/stages/stages.css`.
- **Needs first:** 1.3, 1.5.
- **Gate 2.2:G1:** A shell walkthrough preserves Brain state across navigation, blocks premature stage entry, and disables New Query after creation. Reload restores the default Brain state.

Do not copy the style sidebar's placeholder boards, chats, or Query hub.

### Leaf 2.3 — Build Query creation and Analysis

- **Work:** Adapt the existing chooser and Query graph into production components. Carry selected IDs. Validate creation. Inspect nodes, supplied links, and source passages. Generate the deterministic Analysis once.
- **Owner:** Codex, `gpt-6.1-sol @ medium`.
- **Owns:** `app/src/query/CreateQuery.tsx`; `app/src/query/QueryPage.tsx`; `app/src/query/QueryGraph.tsx`; `app/src/query/analysis.ts`; `app/src/query/query.check.ts`.
- **Needs first:** 1.3, 1.5.
- **Gate 2.3:G1:** Query checks and a walkthrough prove valid creation, locked evidence, actual Analysis output, supplied-only relationships, and source viewing. Blank inputs and unsupported claims cannot pass as valid evidence.

Reuse the existing source viewer through its public props.
Do not edit the viewer or old style chooser in this leaf.
Remove suggestion controls from the production copy.

### Leaf 2.4 — Build the scripted Room

- **Work:** Implement setup, four timed steps, artifact review, reasoning detail, Prepare, and rerun. Use shared state so navigation preserves progress.
- **Owner:** Codex, `gpt-6.1-sol @ medium`.
- **Owns:** `app/src/room/RoomPage.tsx`; `app/src/room/run.ts`; `app/src/room/run.check.ts`.
- **Needs first:** 1.3, 1.5, 2.1.
- **Gate 2.4:G1:** Clock-driven checks prove steps at 2, 4, 6, and 8 seconds. A walkthrough proves review gating, stopped completion time, preserved navigation, and rerun invalidation.

Use an injected clock for deterministic checks.
Do not rely only on screenshots of a completed run.

### Leaf 2.5 — Build the HTML export

- **Work:** Build the Standard snapshot, preview, escaped HTML serializer, download action, filename notice, and retry action. Preserve all required uncertainty and provenance fields.
- **Owner:** Codex, `gpt-6.1-sol @ medium`.
- **Owns:** `app/src/export/ExportPage.tsx`; `app/src/export/snapshot.ts`; `app/src/export/html.ts`; `app/src/export/export.check.ts`.
- **Needs first:** 1.3, 1.5, 2.1.
- **Gate 2.5:G1:** Export checks prove preview/file content equality and escaping with hostile synthetic text. The downloaded file opens offline without requests and retains every required content field.

Do not add PDF, Word, portal, email, or print automation.

### Leaf 2.6 — Integrate the full path

- **Work:** Wire the completed pages into the shell. Resolve integration defects without changing the contract. Verify the intended demo selection and a reduced selection.
- **Owner:** Codex, `gpt-6.1-sol @ medium`.
- **Owns:** `app/src/App.tsx`; `app/src/App.css`; `app/src/stages/StageHost.tsx`; `app/src/stages/StageSidebar.tsx`; `app/src/stages/stages.css`; `app/src/query/CreateQuery.tsx`; `app/src/query/QueryPage.tsx`; `app/src/query/QueryGraph.tsx`; `app/src/room/RoomPage.tsx`; `app/src/export/ExportPage.tsx`.
- **Needs first:** 2.2, 2.3, 2.4, 2.5.
- **Gate 2.6:G1:** The approved click path reaches an HTML download from production preview. Typecheck and build pass after the last integration edit. Rerun makes the old Export inaccessible.

Earlier owners release these files before integration claims them.
Return pure-function or fixture defects to their original owner.
Reverify all affected dependencies after a fix.

### Leaf 3.1 — Verify the toy and its regressions

- **Work:** Run the acceptance matrix with `terminal-browser`. Test both viewport widths. Inspect the downloaded file. Record every result and its evidence.
- **Owner:** Codex, `gpt-6-luna @ medium`.
- **Owns:** `app/qa/thursday-toys/acceptance.md`; `app/qa/thursday-toys/screenshots/**`; `app/qa/thursday-toys/console.json`; `app/qa/thursday-toys/network.json`; `app/qa/thursday-toys/downloads/**`.
- **Needs first:** 2.6.
- **Gate 3.1:G1:** Every approved acceptance row and retained Brain check has current passing evidence. The downloaded file matches the preview. No required row is failed or unverified.

Run typecheck and build after the last code edit.
Start production preview from `app/`.
Open `/product-toybox/app/` and test refresh.
Use the terminal-browser skill before driving the browser.
Do not install a new browser-testing dependency.

### Leaf 3.2 — Critique the release candidate

- **Work:** Review the approved contract, redacted diff, and acceptance report independently. Challenge missing cases, misleading UI, and weak gates. Record severity and disposition.
- **Owner:** opencode, `google/gemini-4-argon`.
- **Owns:** `app/qa/thursday-toys/critique.md`.
- **Needs first:** 3.1.
- **Gate 3.2:G1:** Each finding has a verified fix or Jacques's explicit acceptance. No release-blocking finding remains open.

The critic does not modify implementation files.
Original owners fix defects under renewed leases.
Rerun affected checks and leaf 3.1 before closing a finding.

### Leaf 3.3 — Merge and verify the live toy

- **Work:** Present the pull request and evidence to Jacques. Jacques merges after approval. Verify the deployed base path and complete the live demo path.
- **Owner:** Jacques merges. Claude Code, `Opus 5.5 @ medium`, coordinates and records the release.
- **Owns:** `app/qa/thursday-toys/release.md`. Jacques owns the merge action. This leaf makes no workflow or app edits.
- **Needs first:** 3.1, 3.2.
- **Gate 3.3:G1:** The deployed site serves the approved commit. The live click path downloads the expected HTML file. The release report names the commit and evidence.

Do not claim delivery from a local preview alone.
If deployment fails, keep this gate unmet.

## 7. Unlazy execution and integration gates

Before dispatch, copy these contracts into the scope plan.
Create one leaf ledger per leaf and one integration ledger per branch.
Map each approved behavior to a leaf and an acceptance check.
Record `Owns`, `Needs`, `Tier`, `Planned wave`, and `State` in the dispatch table.
Classify design, implementation, integration, and critique as judgment work.
Treat fixture validation as bounded work, not permission to invent evidence.

Write each runnable gate with `CHECK`, `EXPECT`, and its working directory.
Use the existing TypeScript toolchain for `.check.ts` files.
Compile checks into a disposable app-local check directory.
Run the generated JavaScript with Node.
Do not install a test runner.
Serialize compilation and build commands to avoid shared output collisions.

Inspect and lint each ledger before running its commands.
Obtain explicit approval for inspected gate commands.
Use success-only tokens after all assertions pass.
Test negative checks against deliberately invalid synthetic controls.
Do not treat an absence search as sufficient proof.

For each leaf, complete four passes:

1. Implement the complete leaf.
2. Review it against the approved contract.
3. Hunt correctness, integration, and evidence defects.
4. Apply low-cost polish and rerun the checks.

The orchestrator independently reverifies each returned leaf.
The orchestrator reviews manual evidence before marking a leaf `VERIFIED`.
Release the exact leaf lease before promoting its dependents.
Never dispatch concurrent writers to overlapping owned paths.

Use these branch integration gates:

- **Branch 1:** Reverify leaves 1.1–1.5. Confirm that the approved contract, interfaces, case, and adapter agree.
- **Branch 2:** Reverify leaves 2.1–2.6. Walk the complete route and the navigation, review, and invalidation boundaries.
- **Branch 3:** Reverify leaves 3.1–3.3. Match the released commit to the tested candidate and its downloaded output.
- **Root:** Reconcile every approved behavior and exclusion. Require all branches to pass with current evidence.

Keep an impossible gate visible.
Record abandonment with its reason and owner handoff.
An abandoned gate is not successful completion.
Report pass, fail, or unverified for every acceptance row.

## 8. Schedule to Thursday night

The schedule uses local time, GMT+4.
The target release window is 19:00–21:00 on Th-12-Nov.
This window is a planning target within the approved Thursday-night deadline.
Do not assume that Jacques will provide design reviews after his usual working day.

| Day and target | Work | Required finish |
| --- | --- | --- |
| Tu-10-Nov, by 13:00 | Finish leaves 1.1 and 1.2 with Jacques. | Jacques approves the PRD diff and merges the style baseline. |
| Tu-10-Nov, 13:00–17:00 | Finish interfaces and the data handoff in 1.3–1.5. | The case validates. The stage interfaces are fixed. |
| Tu-10-Nov, after the contract passes | Build the shell and Query in 2.2–2.3. | New Query creates the intended evidence set and generates Analysis. |
| We-11-Nov, 09:00–12:00 | Refine Room and Export in 2.1 with Jacques. Continue shell and Query work. | Jacques approves both style walkthroughs. |
| We-11-Nov, 12:00–17:00 | Build Room and Export in 2.4–2.5. | Both leaves pass their local gates. |
| We-11-Nov, evening | Integrate in 2.6. | The full local route reaches a downloaded HTML file. |
| Th-12-Nov, 09:00–12:00 | Run 3.1 and the Brain regressions. | The production-preview evidence matrix is complete. |
| Th-12-Nov, 12:00–15:00 | Run 3.2. Original owners fix findings. | No release-blocking finding remains. |
| Th-12-Nov, 15:00–17:00 | Reverify after fixes. Review the candidate with Jacques. | Jacques approves the tested pull request. |
| Th-12-Nov, 19:00–21:00 | Complete 3.3 and the live check. | The live toy passes the route and download gate. |

Start Room and Export implementation as soon as their dependencies pass.
Do not wait for unrelated leaves.
Use separate worktrees for concurrent builds that write generated files.
Record actual start and finish times rather than claiming these estimates as measured effort.

If this plan starts after a target time, report the elapsed target immediately.
Keep the dependency order. Do not compress verification into a claim of completion.

## 9. Contingency cuts and stop rules

Apply these cuts before reducing required behavior:

1. Remove decorative transitions and extra motion outside the required run progress.
2. Reuse existing controls and layout patterns. Stop optional visual exploration.
3. Keep one approved Room and Export direction. Do not build alternate compositions.
4. Use the existing source viewer. Do not add new preview formats.
5. Drop free-model experiments, board cleanup, and wiki work from the release path.

The approved stage cuts already remove the largest optional work.
Do not silently remove creation, source inspection, Analysis, review, or download.
Do not remove confidence, freshness, disagreement, assumptions, or unknowns from the file.
Do not shorten the run by skipping one of its four lenses.
Do not substitute a screenshot or onscreen-only export for the HTML download.
Do not replace missing dad data with invented sourced claims.

If dad's data is late, continue the build on the current data.
Leaf 2.7 starts when his files arrive.
If design approval is late on Wednesday, continue independent Query and shell work.
Do not let a builder invent the Room or Export direction.

If the full path fails on Wednesday night, freeze polish and assign failures to their original owners.
If a required behavior still fails on Thursday afternoon, show Jacques the failed gate and the remaining work.
Any further product cut needs Jacques's explicit approval and a contract revision.
If the live gate fails Thursday night, report a partial result and the blocker.
Never call the toy shipped because the deadline arrived.

## 10. Handoff and evidence

The release report includes these items:

- The branch, pull request, merge commit, and deployed commit.
- Each acceptance ID with pass, fail, or unverified status.
- The commands and toolchain used after the last edit.
- Screenshot, console, network, and download evidence paths.
- The fixture selection used for the demo.
- Critic findings and their dispositions.
- Any abandoned gate, skipped work, or remaining blocker.

Do not publish private screenshots or source passages without Jacques's approval.
Do not change the task board as part of this plan.
Do not edit the vault as part of this plan or build.

## 11. Source record

This plan uses these local sources:

- `/home/jacq/Projects/QuantumState/AIOS/History/November 2026/10th/Tu-10-Nov Toy Plan.md`.
- `/home/jacq/Projects/QuantumState/Quantum State/Design.md`, stages 5–7.
- `/home/jacq/Projects/QuantumState/Quantum State/features/Query.md`.
- `/home/jacq/Projects/QuantumState/Quantum State/features/Board Simulation Room.md`.
- `/home/jacq/Projects/QuantumState/Quantum State/features/Export Query.md`.
- `/home/jacq/Projects/QuantumState/AIOS/Systems/Agent Routing.md`.
- `/home/jacq/Work/product-toybox/PRD.md`, `DESIGN.md`, and `AGENTS.md`.
- `app/src/style/StageStyles.tsx`, `QueryGraph.tsx`, `AppSidebar.tsx`, and `NewQueryDialog.tsx`.
- `app/src/App.tsx` and `app/package.json`.
- The unlazy leaf, orchestration, dispatch, and ownership instructions.
- Jacques's approval of the combined stages 5–7 contract in this session.

The current request overrides the draft's optional board, wiki, and free-model experiment leaves.
The approved contract overrides broader app-map behavior for this bounded toy.
