# Governance Brain toy · PRD

The build brief for the Governance Brain toy (`brain/`). It says what the toy does, what it's built with, and the limits for the AI building it. How it looks lives in [`../DESIGN.md`](../DESIGN.md); this file never repeats it.

Items marked **[proposed]** or **[draft for Jacques]** are waiting on Jacques. Don't launch the build until they're cleared.

## 1. Purpose and demo success

A toy is smoke and mirrors: fake data, scripted AI, nothing breaks. It is not the MVP.

The toy is for Jacques and his dad to get a feel for how Quantum State looks and works to navigate. It succeeds when someone can search, filter and pick their way to something that matters, and sees how the AI helps sort the vault. It fails if Morgan, the director it's built for, would rather keep a simple file system.

## 2. Read first

Before planning, read in this order:

1. This PRD.
2. [`../DESIGN.md`](../DESIGN.md), all of section 1 (the universal toy style) and section 2 (this toy).
3. Figma, file `lWqJ4xxExzCi9KsAotwLDe` (Toy Designs):
   - the toy sheet, [node 124-191](https://www.figma.com/design/lWqJ4xxExzCi9KsAotwLDe/Toy-Designs?node-id=124-191);
   - the tokens, [node 101-445](https://www.figma.com/design/lWqJ4xxExzCi9KsAotwLDe/Toy-Designs?node-id=101-445);
   - Sphere SVG, [node 137-1040](https://www.figma.com/design/lWqJ4xxExzCi9KsAotwLDe/Toy-Designs?node-id=137-1040), which exports as SVG through the Codex Figma plugin.

**Sources of truth:**
- Figma wins on looks. DESIGN.md mirrors Figma.
- This PRD wins on behavior, scope and limits.
- If two sources disagree, report the conflict (see section 9). Never fix it yourself.

## 3. Scope and non-goals

**In scope:**
- Three views: Graph (the default), Wheel and Smart Search.
- The document-arrives moment.
- Domain chips and header search.
- The details panel.
- The risk summary.
- Three scripted Smart Search runs.
- Desktop only.

**Not in this build:**
- A backend, database, login, analytics or env secrets.
- Live AI calls. Everything the AI does is scripted.
- File upload or ingestion. The vault is the fixed seed.
- Approve controls. Approvals are parked.
- The query toy. "Create a query" is a disabled button.
- Any shared shell for other toys, Vercel or Supabase.
- Mobile or narrow screens.
- New insight tags, documents or domains beyond the seed.

## 4. Demo journey and behavior

The IDs are what section 8 checks against.

- **B1 Open.** The toy opens on Graph with every domain on, search empty and details closed [proposed]. See DESIGN.md 2.1–2.3.
- **B2 Arrival.** One second after Graph first appears, Liquidity review arrives once, sorts and then settles [proposed]:
  - while it sorts, it shows its scripted relationships;
  - the sequence pauses outside Graph and resumes on return;
  - it replays only on reload.

  See DESIGN.md 2.4.
- **B3 Animate.** Replays the visible graph's existing links connecting in sequence. Documents and relationships don't change, and arrival doesn't replay [proposed]. See DESIGN.md 2.3.
- **B4 Filter.** Domain chips remove or restore documents, and Clear all turns every chip off. A two-domain document stays visible when either of its domains is on [proposed]. See DESIGN.md 2.6.
- **B5 Search.** Header search matches titles, text and insights.
  - It combines with the domain chips, using case-insensitive substring matching [proposed].
  - Clearing search restores the domain-filtered view.
  - Header search is hidden in Smart Search [proposed].
- **B6 Inspect.** Picking a Graph node opens its details, and picking another node replaces them.
  - Close clears the selection [proposed].
  - Open launches a local source viewer; closing the viewer returns to the same details [proposed].
  - Employment contracts shows "Not in the vault", with no invented content and no Open [proposed].

  See DESIGN.md 2.2 and 2.7.
- **B7 Wheel.** Switching to Wheel keeps filters and search [proposed].
  - With exactly one chip on, that domain's eight-topic wheel opens.
  - Picking a node shows its rung, score against the appetite, and factors.
  - Evidence opens its source at the cited spot [proposed].

  See DESIGN.md 2.5.
- **B8 Ask.** A suggested question runs its script: Ask, then Reading, then Answer.
  - Six documents are read one at a time, and the sphere turns itself to each one.
  - At Answer the sphere stops, with each source annotated.
  - Source chips open the details panel.

  See DESIGN.md 2.8.
- **B9 Return.** "Show on the graph" switches to Graph, clears filters and search so both ends show, and reveals the script's rainbow found link. Found links stay until reload [proposed]. "Create a query" is disabled.

| State | Outcome |
| --- | --- |
| B10 All domains off | Empty Graph; the Wheel shows only its rungs. Smart Search still reads the whole vault. |
| B11 No search matches | No documents, and "No matching documents" [proposed]. |
| B12 Reload | Back to B1: found links removed and arrival rearmed. Ordinary view changes keep state [proposed]. |

## 5. Fake data and scripted AI

**B13 Fixtures.** The data lives in three files:
- `brain/src/data/documents.json`
- `brain/src/data/wheels.json`
- `brain/src/data/smart-search.json`

**Each document has:**
- `id`, `title`, `type` (`pdf | video | sheet | image`), `issued`, `from`, `domains`, `primaryDomain`, `text`;
- `links[{targetId, reason}]`, where `reason` is `shared-content | same-author | cites`;
- `summary`;
- `insights[{text, tags, pageRef, confidence}]`. A `pageRef` can be a page, a timestamp, a cell or a region.

**Each wheel record has:**
- `documentId`, `topic`, `riskScore`, `appetite`, `rung`;
- `factors[{factor, weight, evidenceRef}]`.

**B14 Seed boundary.** Use exactly the documents in DESIGN.md 2.9. Employment contracts gets no source content. The roughly 260 sphere nodes are decoration, not documents. Use only the insight tags in DESIGN.md 2.7. Every claim, score and insight is fictional.

**B15 Wheel topics.** DESIGN.md gives four topics per domain, but a domain wheel needs eight. The builder drafts four more per domain in the same plain governance voice, and lists them in its final report for Jacques [proposed].

**B16 Execution.** No network calls for data or AI, and the same result on every run.
- Each read step starts one second apart [proposed].
- The counter counts completed reads.
- Repeat submissions during Reading are ignored.

### The three Smart Search scripts [draft for Jacques]

The questions, Script 1's reading order, its answer and its found link come from the Figma toy sheet. Everything else is drafted. Store the approved text word for word in `smart-search.json`.

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
- optional: `d3-force` and `@types/d3-force`, for graph layout and Animate.

**Not allowed:**
- a styled UI kit, CSS framework, state library or router;
- template extras such as ESLint packages, which need approval like any other dependency.

**Base UI** ([docs](https://base-ui.com/react/overview/quick-start)) is unstyled. It handles behavior: keyboard, focus, accessibility, and open and close. Every visual comes from DESIGN.md.

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
- Only inside `brain/`: package files, lockfile, config, source, assets, build output, and screenshots under `brain/qa/`.
- No root-level config.
- `DESIGN.md`, `README.md` and anything outside `brain/` are read-only.

**Assets:**
- Export Sphere SVG (137:1040) from Figma into `brain/src/assets/`. Draw the sphere from it rather than placing nodes one by one.
- Google Fonts is the only external request allowed; everything else stays local.

**Run, from `brain/`:**
- `npm install`
- `npm run dev`
- `npm run typecheck`
- `npm run build`
- `npm run preview`

Set Vite `base: '/product-toybox/brain/'`.

**Desktop only:** the minimum viewport is 1280 CSS pixels.

> **Open (QS-030, not decided here):** separate toy folders versus one shared shell for every toy. React + Vite keeps a shared shell possible later. Build nothing for it now.

## 7. Build order

Each milestone must be demonstrable before the next one starts.

1. **Shell, fixtures, tokens:**
   - the app launches with the view switch;
   - the local fake data loads;
   - the DESIGN.md styles are in place.
2. **Graph:**
   - nodes and their states;
   - the details panel and source viewer;
   - chips, Clear all and search;
   - the empty states.
3. **Wheel:**
   - the rungs;
   - the domain wheels;
   - the risk summary, with working evidence links.
4. **Smart Search:**
   - all three scripts run through Reading to Answer;
   - source chips work;
   - "Show on the graph" works;
   - "Create a query" stays disabled.
5. **Motion and polish:**
   - first the required motion: arrival, Animate, and the sphere turning;
   - then the optional bounce and transitions;
   - last, compare screenshots and rerun every check.

Under time pressure, drop decorative motion first. Never silently drop a view, a required behavior, a fixture or a check. Report what's unfinished.

## 8. Acceptance checks

Walk every check in Jacques's Chrome (Claude in Chrome or the Codex Chrome plugin), never in a terminal browser. Test at 1280 and 1440 px.

| ID | Check | Covers |
| --- | --- | --- |
| A1 | `npm run typecheck` and `npm run build` pass after the last edit; typechecking is not bypassed. | |
| A2 | The production preview loads at `/product-toybox/brain/`; a refresh loads the app and assets with nothing missing. | |
| A3 | There are no console errors. Requests are same-origin except Google Fonts; there are no AI, analytics or backend requests. | B16 |
| A4 | Graph opens by default, and all three views switch with nothing clipped. | B1 |
| A5 | Linked, orphan, empty, picked and sorting nodes match DESIGN.md 2.2. Arrival and Animate reach their end states. | B2, B3 |
| A6 | Hidden domains leave no ghosts; Clear all empties Graph and leaves the Wheel's rungs; search keeps its matches, and clearing it restores the view. | B4, B5, B10, B11 |
| A7 | Picking, closing, Open, preview highlights, metadata, summary and fixed tags all work, and no approve control appears anywhere. | B6 |
| A8 | Risk placement, the domain wheels, the gauge, the factors and the evidence links match the fixtures. | B7, B15 |
| A9 | Exactly three suggested runs go through Reading to Answer; source chips open details; "Show on the graph" reveals the found link; "Create a query" can't activate. | B8, B9 |
| A10 | Reload resets as B12 says. | B12 |
| A11 | Screenshots of every view, the open panels and each Smart Search state are saved under `brain/qa/` and compared with toy sheet 124-191. Fix differences or record them as blockers. | |

## 9. Decide, ask, stop, report

**Builder:** Codex gpt-6.1-sol in an overnight Herdr pane.

**Decide alone:** component structure, CSS organization and implementation details, within the stack. Read the PRD, DESIGN.md and Figma before filling any gap.

**Stop and record a blocker** for any of these, then carry on with work that doesn't depend on it:
- product behavior that neither this PRD nor DESIGN.md covers;
- a dependency that isn't on the list;
- a write outside `brain/`;
- a conflict between Figma and DESIGN.md. Report it and never "fix" DESIGN.md.

Silence is never approval.

**Budget:** [Jacques fills in the deadline, the time zone and the run limit before launch].

**Done** means every check passes after the last edit. At the budget limit, stop and report a partial result honestly.

**Final report:** print it in the Herdr pane, with:
- each check ID marked pass, fail or unverified;
- the commands run;
- the screenshot paths;
- the drafted wheel topics;
- the blockers;
- what was skipped.

No commit or push unless Jacques asks.
