# DESIGN.md

The design system for Quantum State toys, and the design of the first toy, the Governance Brain (`app/`).

A toy is tangible "smoke and mirrors", not the prototype. It fakes the data and the AI so a person can feel the experience. Every toy in this repo uses the vibe style below. The Governance Brain section further down covers that toy only.

> **Vibe phase (Mo-19-Oct, branch `style/design`).** The style is in the vibe phase. The code is the source of truth for the style until Jacques moves it into Figma. The links below go to the earlier style.

**Figma is the source of truth.** If this file and Figma disagree, Figma wins: report the conflict, and never fix this file yourself.

- Tokens: [Toy Designs · Tokens · Toy style · universal](https://www.figma.com/design/lWqJ4xxExzCi9KsAotwLDe/Toy-Designs?node-id=101-445)
- Governance Brain: [Toy Designs · Governance brain · toy sheet · universal](https://www.figma.com/design/lWqJ4xxExzCi9KsAotwLDe/Toy-Designs?node-id=124-191)

---

## 1. The vibe style

The toybox style now comes from a shadcn preset and Watermelon UI components. The old universal toy tokens no longer apply. The style is open: change it on the style page and keep what works.

> "My existnig tokens do not matter - we're vibng new ones"
>
> — Jacques, Mo-19-Oct

- **Style page:** `app/style.html`. In dev, it runs at `http://localhost:5173/product-toybox/app/style.html`. It shows the colors, the type and every picked component on one page.
- **Where the values live:** the CSS variables in `app/src/index.css`. The shadcn config is in `app/components.json`.

### 1.1 The preset

shadcn preset `b6Tpl9I9Z2`:

| Setting | Value |
| --- | --- |
| Style | `base-maia` (on Base UI) |
| Base color | Mist |
| Primary | Green, `oklch(0.508 0.118 165.612)` |
| Heading font | Space Grotesk Variable, installed locally with Fontsource |
| Body font | Nunito Sans Variable, installed locally with Fontsource |
| Radius | 0.625 rem |
| Icons | Lucide |

To try a new preset, run `npx shadcn@latest init -t vite -b base --preset <code> -y -f --reinstall` from `app/`.

### 1.2 Components

| App part | Component | Source |
| --- | --- | --- |
| View switch | `continuous-tabs` | Watermelon |
| Header search | `command-search` | Watermelon |
| Domain chips | `filter-disclosure` | Watermelon |
| Risk gauge | `credit-usage-card` | Watermelon |
| History / AI projection tabs | `discrete-tabs` | Watermelon |
| Drawer timeframe | `frequency-selector` | Watermelon |
| Governance History carousel | `carousel-navigator` | Watermelon |
| Panel lists | `card-split-accordian` | Watermelon |
| Smart Search input | `contextual-ai-bar` | Watermelon |
| Source viewer | `dialog-4` | Watermelon |
| Buttons, hover labels, chat log | `button`, `tooltip`, `scroll-area` | shadcn |

Watermelon components are in `app/src/components/watermelon/`. shadcn components are in `app/src/components/ui/`. Install new ones with `npx shadcn@latest add <url or name>` from `app/`.

### 1.3 Motion

Watermelon components animate with `motion` (springs). The Graph, the Wheel and the sphere keep their own motion.

The motion reference for the toybox is the point cloud: floating nodes in continuous, smooth motion, as on [Auros](https://styles.refero.design/style/21cfe0c1-778d-4613-9f47-a5718eb929b3) and [Ameba](https://styles.refero.design/style/371df039-a090-402b-b2e4-21ab38e07625). The Smart Search sphere already moves this way. Use these sites for motion only, not for color or type.

### 1.4 Watermelon colors

Watermelon components come with fixed Tailwind colors. On Mo-19-Oct, all of them (about 230) were changed to theme classes, so the whole style page follows the preset. The `dark:` color overrides were removed, because the theme variables switch in `.dark`.

> [!warning] A new Watermelon component comes with fixed colors again. After you install one, replace its colors with theme classes: surfaces to `bg-card` or `bg-muted`, text to `text-foreground` or `text-muted-foreground`, borders to `border-border`, strong colors to `bg-primary`.

### 1.5 The earlier style

The universal toy style from Mo-12-Oct is in the git history of this file, before commit "Update DESIGN.md for the vibe style". Jacques's direction for it was:

> "it will be intentionally flat, shifting backwards to the wiki tokens with a hint of playfullness"
>
> "the toys should feel half-way between sketched and coded, somewhere between sketched minimalism and cartoon line-art fidelity and flexibility; reserving a more utilitarian style for dense data."
>
> — Jacques, Mo-12-Oct

> [!note] Section 2 still names the earlier tokens (Ink, Peach, Glass and others). It changes as each part of the app moves to the new components.

---

## 2. Governance Brain (`app/`)

**What it's for:** Jacques and his dad getting a feel for how Quantum State looks and works to navigate. It fails if Morgan, the director it's built for, would rather keep a simple file system.

Everything is fake and nothing breaks: data is static, and the AI is scripted.

### 2.1 Views

There are three views, swapped like a card and list toggle. Graph is the default.

| View | Job |
| --- | --- |
| Graph | Explore nodes and data fast. |
| Wheel | Understand what's at risk fast. |
| Smart Search | Ask across the whole vault. |

The header holds the title, the view switch, Animate (Graph only), the search field and the domain chips.

### 2.2 Nodes

Every node is a document, drawn as a Graphite diamond with radius 2.

| State | Look | Meaning |
| --- | --- | --- |
| Node | Graphite fill | In the vault, linked. |
| Picked | Graphite fill inside a 1.5 px Graphite outline | Its details are open. |
| Orphan | Graphite fill, no links, sits apart | In the vault, no relationships yet. |
| Empty | No fill, dashed Graphite outline, dashed links | Referred to but not in the vault (an empty wiki link). Always has at least one link. |
| Sorting | Surface fill, dashed Peach outline, dashed Peach links | The AI placing a new document. Becomes a node when it settles. |

Fill means the document is in the vault, and links mean it has relationships. An orphan has a fill and no links; an empty node has links and no fill.

### 2.3 Links

- **Graph view only.** A line means shared content, the same author, or one document citing another.
- **1 px Glass 45, solid.** Links to an empty node are dashed.
- **Found link:** the rainbow link, a connection Smart Search found that the graph didn't have.
- **Animate:** connecting the dots is the user's choice, like Obsidian's Animate on the graph.

### 2.4 How a document moves in

This is the visible AI moment, shown in the Graph view only.

1. **Arrives:** a new document lands, unsorted. Nothing moves yet.
2. **Sorting:** the AI reads it and draws dashed Peach links to the documents it relates to.
3. **Settles:** the links go solid, the Peach goes, and it's a node like the rest.

The AI shows the new document relating to its part of the graph through its links, not its domain. How the AI works is immaterial to Morgan.

### 2.5 Wheel

- **The rings:** distance from the hub is risk against the risk appetite. There are three rungs, green inside, amber, then red. An outer dashed Glass 45 ring carries the labels only.
- **Spokes:** each spoke is a topic, four per domain, with its label set along the spoke in its domain's hue.
- **The whole wheel is the base view:** every domain, as in Figma.
- **A wheel per domain:** on the Wheel, the chips pick one domain at a time, and that domain's own wheel opens with the same rungs. A domain wheel has 4 to 8 topics, depending on its data. With no chip on, the whole wheel comes back.
- **The Wheel's chips are separate from the Graph's** (see 2.6).
- **Risk summary panel** (ledger), when you pick a node on a wheel:
  - its rung;
  - its score against the appetite, in mono, with a risk gauge;
  - a factors table of factor, weight and evidence. Each weight is in its rung color and each piece of evidence links to its source.

### 2.6 Filters and search

- **Domain filters are off by default, and off shows everything.** Turning chips on narrows the Graph to the selected domains. Turning on every chip is the same as turning on none.
- **Narrowing** removes the other domains' documents completely: no hidden labels, no ghosts.
- **Clear all** turns every chip off, which brings back the whole graph.
- **The Wheel filters separately:** it shows the whole wheel or one domain (see 2.5), so its pick doesn't follow the Graph's chips.
- **Smart Search has no domain filters.** It always reads the whole vault.
- **Search** lives in the header. It matches titles, text and insights. Matches stay on the view and the rest goes until the search is cleared.
- **Domains:** Strategic direction, Strategy execution, Financial stewardship, Risk and resilience, Controls and assurance, Major decisions, Remuneration.
- **A document in two domains** sits in one and wears both labels.

### 2.7 Details panel

Picking a node opens a 352 px panel on the right, with lift. From top to bottom:

1. A small mono label, "PICKED DOCUMENT", and a close button.
2. The title.
3. **The preview**, which changes with the file type. Peach marks where the AI found the insight:
   - PDF: a line;
   - video: a stretch of the timeline;
   - spreadsheet: a cell;
   - image: a dashed region.

   **Open** goes to the source document in its own viewer.
4. **Metadata** (ledger): type, issued, from, linked to, domain.
5. **Summary**, the AI's section, labelled just "Summary".
6. **Insights · n.** Each insight card holds:
   - a Peach diamond with "AI insight";
   - the insight text;
   - one or two tags from the fixed list;
   - a page reference (↗);
   - `confidence 0.92` in mono.

   Confidence is the AI's own accuracy check, based on the document and its related nodes.

**Insight tags (fixed list):** Supply chain, Continuity, Ownership, Market entry, Cyber, Liquidity, Capital, Compliance, Controls, Reputation, People, Pay, Strategy, Delivery, Stakeholders, Regulation. The AI never invents new ones.

**Approvals are parked.** There are no approve controls anywhere.

### 2.8 Smart Search

An AI-powered search across meaning and relationships, not only the links already on the graph. In the toy it's scripted theater, *"Suggested questions only!"*, and there are no AI API calls.

1. **Ask:**
   - A large search bar with a Peach sparkle (`auto_awesome`), "Ask across the whole vault", and an Ink send arrow with the rainbow glow.
   - Three suggested questions under it, the only runs in the toy.
   - A faint sphere waiting below, at 40% opacity.
2. **Reading:**
   - **The sphere** turns by itself to bring each document being read to the front, one at a time. That document turns Peach, with a dashed Peach leader out to a label: "<name> · reading".
   - **The agent chat** replaces the search bar. It shows the question, a "6 sources read" counter and a log, then "Writing the answer" with a Peach caret. Each log line is "Reading <document>" with a domain-hue dot, or "Tool · <name>", or "Comparing …".
3. **Answer:**
   - **The sphere** stops. Each source stays annotated in Ink with a leader and a "<name> · source" label.
   - **The chat** collapses its log to "Read 6 sources · used 2 tools". Then come the answer text, source chips that open the details panel, and any new connection drawn as the rainbow link.
   - **Two ways out:**
     - **Show on the graph.**
     - **Create a query**, which will lead into the query toy. Until that toy exists, it's a disabled button.

**The sphere** is only a picture of what Smart Search has read. It's a Curater-style cloud of nodes over the whole sphere:
- **Nodes and depth:** about 260 Graphite diamonds. There are no sectors, colors or labels and no outline: nodes toward the back are smaller and fainter, Graphite at 12–90% opacity.
- **Rotation:** the user never rotates it; it turns by itself. z stays locked.
- **Source file:** draw it from the `Sphere SVG` frame in Figma (137:1040), not by placing nodes one at a time.

### 2.9 Placeholder data

Use the documents on the Figma sheet as the seed vault:
- **Linked documents:** Board pack Q3 (the hub), Strategy note, Charter, Policy v4, Controls memo, Minutes · Sep, Forecast 2027, Training log, Risk register, Audit plan, Supplier review, Treasury update, Insurance schedule, Board risk report, Exec pay review.
- **The orphan:** Draft charter.
- **The empty node:** Employment contracts.
- **The document mid-sort:** Liquidity review.

Wheel topics, four per domain:

| Domain | Topics |
| --- | --- |
| Strategic direction | Purpose & mandate, Long-range plan, Market position, Stakeholder priorities |
| Strategy execution | Initiative delivery, KPIs & milestones, Resourcing, Transformation |
| Financial stewardship | Budget & forecast, Capital allocation, Liquidity, Audit findings |
| Risk and resilience | Risk appetite, Supplier risk, Business continuity, Cyber |
| Controls and assurance | Internal controls, Compliance, Policy register, Assurance map |
| Major decisions | Investments, M&A, Exec appointments, Delegations of authority |
| Remuneration | Executive pay, Incentive plans, Pay ratios, Benefits & pensions |
