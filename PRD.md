# Governance Brain toy · PRD

The build brief for the Governance Brain toy (`app/`). It says what the toy does, what it's built with, and the limits for the AI building it. How it looks lives in [`DESIGN.md`](DESIGN.md); this file never repeats it.

Every open item was settled by Jacques on Mo-12-Oct. Where his calls on filters and the Wheel differ from the Figma toy sheet, this PRD and DESIGN.md win. Build the behavior here and match Figma's look.

> **Stages 5–7 (Tu-10-Nov):** this PRD also covers the Query, Board Simulation Room and Export Query toy. Jacques approved its contract on Tu-10-Nov. The build plan is [`docs/plans/2026-11-10-quantum-state-stages-5-7-design.md`](docs/plans/2026-11-10-quantum-state-stages-5-7-design.md). Rules that change for this toy are marked **Stages 5–7**.

## 1. Purpose and demo success

A toy is smoke and mirrors: fake data, scripted AI, nothing breaks. It is not the MVP.

The toy is for Jacques and his dad to get a feel for how Quantum State looks and works to navigate. It succeeds when someone can search, filter and pick their way to something that matters, and sees how the AI helps sort the vault. It fails if Morgan, the director it's built for, would rather keep a simple file system.

**Stages 5–7.** Dad creates one Query from prepared evidence. He tests the decision in the Room. He downloads the reviewed board material. The Governance Brain keeps working, and all AI behavior stays scripted. The deadline is Thursday 12 Nov, night, GMT+4.

## 2. Read first

Before planning, read in this order:

1. This PRD.
2. [`DESIGN.md`](DESIGN.md), all of section 1 (the universal toy style) and section 2 (this toy).
3. Figma, file `lWqJ4xxExzCi9KsAotwLDe` (Toy Designs):
   - the toy sheet, [node 124-191](https://www.figma.com/design/lWqJ4xxExzCi9KsAotwLDe/Toy-Designs?node-id=124-191);
   - the tokens, [node 101-445](https://www.figma.com/design/lWqJ4xxExzCi9KsAotwLDe/Toy-Designs?node-id=101-445);
   - Sphere SVG, [node 137-1040](https://www.figma.com/design/lWqJ4xxExzCi9KsAotwLDe/Toy-Designs?node-id=137-1040), which exports as SVG through the Codex Figma plugin.

**Sources of truth:**
- Figma wins on looks. DESIGN.md mirrors Figma.
- This PRD wins on behavior, scope and limits.
- If two sources disagree, report the conflict (see section 9). Never fix it yourself.
- **Stages 5–7:** DESIGN.md and Figma do not cover the Query, Room or Export. The Query uses the existing Query direction on the style page. The Room and Export look is refined in code on the style page (`app/src/style/StageStyles.tsx`) and wins once Jacques approves it there. There is no Figma step.

## 3. Scope and non-goals

**In scope:**
- Three views: Graph (the default), Wheel and Smart Search.
- The document-arrives moment.
- Domain chips and header search.
- The details panel.
- The risk summary.
- Three scripted Smart Search runs.
- **Stages 5–7:** New Query in a production sidebar, the Query page and its Analysis, the Board Simulation Room and Export Query (B17–B33).
- Desktop only.

**Not in this build:**
- A backend, database, login, analytics or env secrets.
- Live AI calls. Everything the AI does is scripted.
- File upload or ingestion. The vault is the supplied fixture (B13).
- Approve controls. Approvals are parked.
- A Query from Smart Search. Its "Create a query" stays a disabled button (B9). New Query in the sidebar is the only way to create a Query.
- Phase 1, keyboard shortcuts, a Query hub, Query history, extra boards and chats.
- Vercel or Supabase.
- Mobile or narrow screens.
- New insight tags, documents or domains beyond the supplied fixture files.

## 4. Demo journey and behavior

The IDs are what section 8 checks against.

- **B1 Open.** The toy opens on Graph with every domain chip off, which shows the whole vault. Search is empty and details are closed. See DESIGN.md 2.1–2.3.
- **B2 Arrival.** One second after Graph first appears, Liquidity review arrives once, sorts and then settles:
  - while it sorts, it shows its scripted relationships;
  - the sequence pauses outside Graph and resumes on return;
  - it replays only on reload.

  See DESIGN.md 2.4.
- **B3 Animate.** Replays the visible graph's existing links connecting in sequence. Documents and relationships don't change, and arrival doesn't replay. See DESIGN.md 2.3.
- **B4 Filter.** Chips are off by default, and off shows everything.
  - Turning chips on narrows the Graph to the selected domains.
  - Turning every chip on is the same as none.
  - Clear all turns every chip off and brings back the whole graph.
  - A two-domain document shows when either of its domains is selected.

  See DESIGN.md 2.6.
- **B5 Search.** Header search matches titles, text and insights.
  - It combines with the domain chips, using case-insensitive substring matching.
  - Clearing search restores the domain-filtered view.
  - Header search is hidden on the Wheel and in Smart Search.
- **B6 Inspect.** Picking a Graph node opens its details, and picking another node replaces them.
  - The Graph is a live force layout: drag a node and its neighbours follow; scroll zooms toward the cursor, dragging empty space pans, and hovering a node fades everything not linked to it. No force settings.
  - Close clears the selection.
  - Open launches a local source viewer; closing the viewer returns to the same details.
  - Employment contracts shows "Not in the vault", with no invented content and no Open.

  See DESIGN.md 2.2 and 2.7.
- **B7 Wheel.** The Wheel opens on the whole wheel: every domain, four topics each, as in Figma.
  - On the Wheel, the chips pick one domain at a time. Picking a chip opens that domain's own wheel, and turning it off returns to the whole wheel.
  - The Wheel's pick is separate from the Graph's filters, and switching views never changes either one.
  - Picking a node shows its rung, score against the appetite, and factors.
  - Evidence opens its source.

  See DESIGN.md 2.5.
- **B8 Ask.** A suggested question runs its script: Ask, then Reading, then Answer.
  - Six documents are read one at a time, and the sphere turns itself to each one.
  - At Answer the sphere stops, with each source annotated.
  - Chat log lines appear in order at their own readable pace, not tied to the one-second reads.
  - Source chips open the details panel.

  See DESIGN.md 2.8.
- **B9 Return.** "Show on the graph" switches to Graph, clears filters and search so both ends show, and reveals the script's rainbow found link. Found links stay until reload. "Create a query" is disabled.

| State | Outcome |
| --- | --- |
| B10 All chips off, or all on | The whole graph shows. Smart Search always reads the whole vault. |
| B11 No search matches | No documents, and "No matching documents". |
| B12 Reload | Back to B1: found links removed and arrival rearmed. Ordinary view changes keep state. |

### Stages 5–7: Query, Room and Export

- **B17 Dad's click path.**
  1. Click New Query in the sidebar.
  2. Enter a question and focus. Select documents from Jacques's prepared fixture. Click Create Query.
  3. Inspect a node or link and its source. Click Generate Analysis.
  4. Read the sourced Analysis. Click Open Board Simulation Room.
  5. Review the fixed setup. Click Run simulation.
  6. Review What emerged. Open the disagreement detail and its evidence. Click Prepare for the board.
  7. Review the Standard draft. Click Download HTML. Open the downloaded file.
- **B18 Create.** Require a nonblank question, focus, and at least one supplied document before Create. The Query carries the selected document IDs, not a count.
- **B19 One Query.** Keep one active Query in memory. Disable New Query while that Query exists. Reload resets the toy: the Query, the Room run and the export draft are gone, and the app is back at B1.
- **B20 Supplied links only.** Use only relationships supplied in the fixture, and only those whose two ends are both in the Query. Never invent a relationship between selected documents.
- **B21 Inspect.** A Query node or link opens its details. Show source passages through the existing local viewer. Label absent source content as unavailable. A link cannot start a Query.
- **B22 Analysis.** Generate one deterministic Analysis. Keep agreement, conflict, assumptions, and unknowns distinct. Mark unsupported conclusions as unknown. Include only claims that the selected evidence supports. Never present the full case script as evidence for an unrelated selection.
- **B23 Locked evidence.** Lock the evidence and focus after creation. Cut node add/remove, focus edits, regeneration, AI suggestions, hub, history, extra boards, and chats.
- **B24 One entry.** Keep Smart Search Create a query disabled for this route. New Query in the sidebar is the only creation entry.
- **B25 Room gate.** Require a generated Analysis before Room opens. Direct sidebar navigation obeys the same gate.
- **B26 Room setup.** Use the approved scenario: "Can we proceed with the decision in this Query, and under what conditions?" Fix Finance, Risk, Operations, and Challenger. Show the model as a scripted local-model representation, not an actual running model.
- **B27 Room run.** Complete the four scripted steps at 2, 4, 6, and 8 seconds. Disable duplicate starts. Keep progress on navigation. Stop the timer at completion.
- **B28 What emerged.** Show agreement, material disagreement, and a missing-evidence condition. Base the script on Jacques's supplied case. Do not force a sourced claim that the fixture cannot support.
- **B29 Review.** Require opening the disagreement detail before Prepare. Keep assumptions, sources, and agent reasoning available one level down.
- **B30 Prepare and rerun.** Prepare retains one reviewed result. Rerun replaces it and invalidates the export draft. Cut configurable agents/models/prompts and version history.
- **B31 Export gate.** Require a prepared, reviewed Room result. Direct sidebar navigation obeys the same gate.
- **B32 Standard HTML.** Offer Standard detail and HTML download only. Cut destinations, scope variants, alternate detail levels, and evidence attachments.
  - Build the preview and file from the same current snapshot.
  - Include question, focus, evidence summary, Analysis, Room findings, assumptions, unknowns, reasoning summary, source references, confidence, freshness, and scripted/model labels.
  - Mark unavailable metadata explicitly. Escape supplied content. Make the HTML self-contained. Make no external requests.
- **B33 Download.** Show the filename after download initiation. Do not claim that the browser saved the file successfully. Keep Download available for retry.

## 5. Fake data and scripted AI

**B13 Fixtures.** The data lives in three files:
- `app/src/data/documents.json`
- `app/src/data/wheels.json`
- `app/src/data/smart-search.json`

**Stages 5–7** add a fourth file, `app/src/data/stage-script.json`. It holds what the document format does not: the demo selection, the Analysis findings and the Room script. It refers to documents and links by their IDs in `documents.json`.

**Extension data.** The stages 5–7 data extends the seed. New documents are added to `documents.json`, and no existing record changes. The case-driven data brief, `docs/plans/2026-11-10-case-data-brief.md`, lists the documents to add. Jacques and his dad supply material, and an agent drafts documents to fill the gaps. Jacques approves every added document. `stage-script.json` is then rewritten on the extended data.

**Each document has:**
- `id`, `title`, `type` (`pdf | video | sheet | image`), `issued`, `from`, `author` (`{name, role}`, or `null` when the document is not in the vault), `domains`, `primaryDomain`, `text`;
- `links[{targetId, reason}]`, where `reason` is `shared-content | same-author | cites`;
- `summary`;
- `insights[{text, tags, pageRef, confidence}]`. A `pageRef` can be a page, a timestamp, a cell or a region.

**Each wheel record has:**
- `documentId`, `topic`, `riskScore`, `appetite`, `rung`;
- `factors[{factor, weight, evidenceRef}]`.

**B14 Seed boundary.** Use exactly the documents in the supplied `documents.json`. That is the seed in DESIGN.md 2.9 plus the documents added from the data brief. Employment contracts gets no source content. The roughly 260 sphere nodes are decoration, not documents. Use only the insight tags in DESIGN.md 2.7. Every claim, score and insight is fictional.

Added documents do not change B2, B6, B9 or the three Smart Search scripts.

**B15 Wheel topics.** The whole wheel uses the four topics per domain in DESIGN.md 2.9. Each domain wheel has 4 to 8 topics, depending on its data. Start from those four, and draft up to four more per domain in the same plain governance voice. List the drafted topics in the final report.

**B16 Execution.** No network calls for data or AI, and the same result on every run.
- Each read step starts one second apart.
- The counter counts completed reads.
- Repeat submissions during Reading are ignored.

### The three Smart Search scripts

Approved by Jacques. Store the text word for word in `smart-search.json`.

**Script 1: "What connects our charter to this quarter's decisions?"**
- **Reads:** Charter, Draft charter, Board pack Q3, Forecast 2027, Board risk report, Supplier review.
- **Log:**
  - Reading Charter
  - Reading Draft charter
  - Tool · semantic match
  - Reading Board pack Q3
  - Comparing meaning across Risk and resilience and Strategic direction
  - Reading Forecast 2027
  - Reading Board risk report
  - Reading Supplier review
  - Tool · relationship check
- **Answer:** "Your charter reaches this quarter through risk appetite. The Q3 board pack takes its decisions against the appetite the charter sets, the board risk report (p. 4) flags two suppliers outside it, and the 2027 forecast carries the cost. One link was missing: the draft charter says the same thing about risk ownership as the Charter, but sits alone in the vault."
- **Found link:** Draft charter → Charter (shared-content).
- **Tags:** Ownership, Strategy.

**Script 2: "Where are we exposed on suppliers?"**
- **Reads:** Supplier review, Board risk report, Risk register, Insurance schedule, Controls memo, Audit plan.
- **Log:**
  - Reading Supplier review
  - Reading Board risk report
  - Tool · evidence lookup
  - Reading Risk register
  - Comparing supplier recovery plans with recorded risks
  - Reading Insurance schedule
  - Reading Controls memo
  - Reading Audit plan
  - Tool · coverage check
- **Answer:** "Supplier recovery plans have not been tested, so the board has no evidence that critical services could recover within the expected time. The risk register records the exposure, while the insurance schedule limits which interruption costs are covered. The audit plan includes recovery testing, but its connection to those coverage limits is missing from the graph."
- **Found link:** Insurance schedule → Audit plan (shared-content).
- **Tags:** Supply chain, Continuity.

**Script 3: "Which pay decisions lack evidence?"**
- **Reads:** Exec pay review, Minutes · Sep, Board pack Q3, Forecast 2027, Policy v4, Controls memo.
- **Log:**
  - Reading Exec pay review
  - Reading Minutes · Sep
  - Tool · evidence lookup
  - Reading Board pack Q3
  - Comparing proposed incentive payments with recorded performance
  - Reading Forecast 2027
  - Reading Policy v4
  - Reading Controls memo
  - Tool · policy check
- **Answer:** "The proposed executive incentive payment lacks a documented check that its delivery targets were met. September's minutes record the discussion, but the board pack does not supply the missing performance evidence. Policy v4 requires that check, and the Controls memo describes who should complete it; the graph has not connected that control to the pay review."
- **Found link:** Exec pay review → Controls memo (shared-content).
- **Tags:** Pay, Controls.

None of the three found links exists in the starting graph. Each appears only after its run.

## 6. Tech stack and build boundaries

**Stack: React + Vite, with TypeScript** from the default template.
- React holds the three views and their scripted states in local component state.
- Vite builds static files for GitHub Pages.
- This choice is for this toy only.

**Allowed dependencies, and nothing else without approval:**
- `react`, `react-dom`;
- `vite`, `@vitejs/plugin-react`;
- `typescript`, `@types/react`, `@types/react-dom`;
- `@base-ui/react`, for the standard controls (see **Base UI** below);
- `tailwindcss` and `@tailwindcss/vite`, for styles;
- shadcn ([docs](https://ui.shadcn.com/docs)) and the packages its CLI adds (for example `clsx`, `tailwind-merge`, `class-variance-authority`, `tw-animate-css`, an icon library and `@types/node`);
- Watermelon UI components ([docs](https://ui.watermelon.sh/installation)), installed with the shadcn CLI, with the packages each component needs. Jacques approves each component before it is installed;
- optional: `d3-force` and `@types/d3-force`, for graph layout and Animate.

**Not allowed:**
- a state library or router;
- a PDF library or a test runner;
- template extras such as ESLint packages, which need approval like any other dependency.

> **Decided (Mo-19-Oct, branch `style/design`):** the toybox uses shadcn and Watermelon UI for its standard controls. This replaces the rule "no styled UI kit or CSS framework". The test is whether a component library keeps the speed of an HTML sketch.

**Base UI** ([docs](https://base-ui.com/react/overview/quick-start)) is unstyled. It handles behavior: keyboard, focus, accessibility, and open and close. shadcn uses Base UI as its primitive layer and adds the look. Every visual comes from the shadcn CSS variables, and those variables come from the DESIGN.md tokens.

Use it for these controls:

| Control | Base UI component |
| --- | --- |
| View switch | Toggle Group |
| Domain chips | Toggle |
| Buttons, including the disabled "Create a query" | Button |
| Header search | Field + Input |
| Risk gauge | Meter |
| Agent chat log | Scroll Area |
| Source viewer | Dialog |
| Hover labels | Tooltip |

Popups need `isolation: isolate` on the app root.

The toy's own components stay custom, hand-built in React and SVG, and never in Base UI: the Graph and its nodes and links, the Wheel, the sphere, the details panel, insight cards and the risk summary ledger.

**Where to write:**
- Only inside `app/`: package files, lockfile, config, source, assets, build output, and screenshots under `app/qa/`.
- No root-level config.
- `DESIGN.md`, `README.md`, `PRD.md` and anything outside `app/` are read-only.
- **Stages 5–7 exception:** one named leaf edits `PRD.md` and `AGENTS.md`, and only after Jacques approves the exact diff. Every builder treats both as read-only.
- Agents add documents to `documents.json` only from the approved data brief. Agents never collect material, and never change existing records, `wheels.json` or `smart-search.json` (B13).
- Put stages 5–7 evidence under `app/qa/thursday-toys/`. Untracked files already in `app/qa/` may be Jacques's work: do not delete, overwrite or commit them as a group.

**Assets:**
- Export Sphere SVG (137:1040) from Figma into `app/src/assets/`. Draw the sphere from it rather than placing nodes one by one.
- Google Fonts is the only external request allowed; everything else stays local. The exported HTML file makes no external request at all (B32).

**Run, from `app/`:**
- `npm install`
- `npm run dev`
- `npm run typecheck`
- `npm run build`
- `npm run preview`

Set Vite `base: '/product-toybox/app/'`.

**Desktop only:** the minimum viewport is 1280 CSS pixels.

> **Decided (QS-030, Mo-12-Oct):** one app, not a folder per toy. `app/` is the whole toybox app, and this PRD lives at the repo root. New toys are built on branches, with their requirements added to or changed in this PRD. Build nothing for later toys now.

**Branches and deploys:**
- `main` is the live toybox. A merge to `main` deploys `app/` to GitHub Pages at `/product-toybox/app/`. Nobody pushes to `main` directly.
- Each toy gets one branch, cut from `main`: `toy/<name>`. This build is `toy/governance-brain`. The stages 5–7 build is `toy/post-brain`, cut from `main` after Jacques merges `style/query-space`.
- Branches are tested on this machine only: `npm run dev` while building, `npm run preview` for A2. No branch is hosted.
- Commit after each milestone in §7, once it is demonstrable, and push the branch. Open one pull request to `main` after the first milestone; later milestones add commits to it.
- Jacques reviews and merges. The builder never merges.
- A later toy cuts its branch from `main` after the previous toy merges, and adds its requirements to this PRD on that branch.

## 7. Build order

Each milestone must be demonstrable before the next one starts.

1. **Shell, fixtures, tokens:**
   - the app launches with the view switch;
   - the local fake data loads;
   - the DESIGN.md styles are in place.
2. **Graph:**
   - nodes and their states;
   - motion: the live layout, arrival and Animate;
   - the details panel and source viewer;
   - chips, Clear all and search;
   - the empty states.
3. **Wheel:**
   - the rungs;
   - the whole wheel, plus the domain wheels picked with the Wheel's own chips;
   - the risk summary, with working evidence links.
4. **Smart Search:**
   - the sphere turning, built first;
   - all three scripts run through Reading to Answer;
   - source chips work;
   - "Show on the graph" works;
   - "Create a query" stays disabled.
5. **Motion and polish:**
   - the optional bounce and transitions;
   - last, compare screenshots and rerun every check.

Under time pressure, drop decorative motion first. Never silently drop a view, a required behavior, a fixture or a check. Report what's unfinished.

**Stages 5–7 build order:**
1. **Contract:** this PRD change, the `style/query-space` merge, the shared interfaces in `app/src/stages/contracts.ts`, and the case in `stage-script.json`, checked against `documents.json`.
2. **Shell and Query:** the production sidebar and page host, then Query creation and its Analysis.
3. **Room and Export:** refine both on the style page with Jacques, then build them.
4. **Integration:** the full B17 path reaches a downloaded HTML file in production preview.
5. **Verification and release:** the §8 checks, an independent critique, then Jacques merges.

Under time pressure, cut motion, optional visual exploration and alternate layouts first. Never cut creation, source inspection, Analysis, review or download. Never cut confidence, freshness, disagreement, assumptions or unknowns from the file. Any other cut needs Jacques's approval.

## 8. Acceptance checks

Walk every check with `terminal-browser`, on a tab of your own in the browser that is already running. Never start a second browser. Test at 1280 and 1440 CSS pixels. Save stages 5–7 screenshots, console and network evidence and download inspection under `app/qa/thursday-toys/`.

Pure logic has assertion checks in `*.check.ts` files beside it. Run them with Node, with no test runner.

| ID | Check | Covers |
| --- | --- | --- |
| A1 | `npm run typecheck` and `npm run build` pass after the last edit; typechecking is not bypassed. | |
| A2 | The production preview loads at `/product-toybox/app/`; a refresh loads the app and assets with nothing missing. | |
| A3 | There are no console errors. Requests are same-origin except Google Fonts; there are no AI, analytics or backend requests. | B16 |
| A4 | Graph opens by default, and all three views switch with nothing clipped. | B1 |
| A5 | Linked, orphan, empty, picked and sorting nodes match DESIGN.md 2.2. Arrival and Animate reach their end states. | B2, B3 |
| A6 | With no chips on, the whole graph shows. Selecting chips narrows the graph, with no ghosts, and selecting all of them shows everything. Clear all restores the whole graph. Search keeps its matches, and clearing it restores the view. | B4, B5, B10, B11 |
| A7 | Picking, closing, Open, preview highlights, metadata, summary and fixed tags all work, and no approve control appears anywhere. | B6 |
| A8 | The Wheel opens on the whole wheel. Picking one chip opens that domain's wheel, with 4 to 8 topics, and clearing it returns to the whole wheel. The Wheel's pick doesn't change the Graph's filters, or the other way round. Risk placement, the gauge, the factors and the evidence links match the fixtures. | B7, B15 |
| A9 | Exactly three suggested runs go through Reading to Answer; source chips open details; "Show on the graph" reveals the found link; "Create a query" can't activate. | B8, B9 |
| A10 | Reload resets as B12 says. | B12 |
| A11 | Screenshots of every view, the open panels and each Smart Search state are saved under `app/qa/` and compared with toy sheet 124-191. Fix differences or record them as blockers. | |
| A12 | Create stays unavailable with a blank question, a blank focus or no document. A created Query holds the selected document IDs. | B18 |
| A13 | The Query graph shows only fixture links with both ends in the Query, and no invented link. | B20 |
| A14 | A Query node and a Query link open their details. A source passage opens in the local viewer. Absent content shows as unavailable. | B21 |
| A15 | Generate Analysis shows agreement, conflict, assumptions and unknowns as separate groups. A reduced selection turns unsupported findings into unknowns. Evidence and focus cannot change after creation. | B22, B23 |
| A16 | Room before Analysis and Export before a prepared review are blocked, from the sidebar too. New Query is disabled while a Query exists. Smart Search's "Create a query" stays disabled. | B19, B24, B25, B31 |
| A17 | A clock-driven check completes the four Room steps at 2, 4, 6 and 8 seconds. A second start is disabled. Navigation keeps progress without a restart or a second timer. The timer stops at completion. | B26, B27 |
| A18 | What emerged shows agreement, material disagreement and missing evidence. Prepare stays unavailable until the disagreement detail is opened. Assumptions, sources and reasoning are one level down. | B28, B29 |
| A19 | Rerun replaces the result and makes the old export draft inaccessible. | B30 |
| A20 | The downloaded file matches the preview and holds every B32 field. Unavailable metadata is marked. | B32 |
| A21 | Hostile synthetic text is escaped in the preview and the file. The file opens offline with no requests, no scripts and no active source URLs. | B32 |
| A22 | The filename shows after download starts, with no claim that it saved. Download works again. | B33 |
| A23 | Reload clears the Query, the Room run and the export draft, and returns to B1. | B19 |
| A24 | The B17 path reaches a downloaded HTML file in production preview at `/product-toybox/app/`, at 1280 and 1440 px. | B17 |
| A25 | A1–A11 still pass, except where this PRD names a change. | B1–B16 |

## 9. Decide, ask, stop, report

**Builder:** Codex gpt-6.1-sol in an overnight Herdr pane.

**Stages 5–7:** Herdr workers build from the plan's leaves, each with its own owned files. No builder starts before Jacques approves this PRD change. Builders never merge or publish; Jacques merges. The release target is Thursday 12 Nov, 19:00–21:00 GMT+4. The final report follows section 10 of the build plan.

**Decide alone:** component structure, CSS organization and implementation details, within the stack. Read the PRD, DESIGN.md and Figma before filling any gap.

**Stop and record a blocker** for any of these, then carry on with work that doesn't depend on it:
- product behavior that neither this PRD nor DESIGN.md covers;
- a dependency that isn't on the list;
- a write outside `app/`;
- a conflict between Figma and DESIGN.md. Report it and never "fix" DESIGN.md.

Silence is never approval.

**Budget:** finished by Wednesday 14 Oct, 16:00 GMT+4. Use as many 5h usage windows as the workers need to finish.

**Done** means every check passes after the last edit. At the budget limit, stop and report a partial result honestly.

**Final report:** print it in the Herdr pane, with:
- each check ID marked pass, fail or unverified;
- the branch and the pull request link;
- the commands run;
- the screenshot paths;
- the drafted wheel topics;
- the blockers;
- what was skipped.

Commit, push and open the pull request as set out in **Branches and deploys** (section 6).
