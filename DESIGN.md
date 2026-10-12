# DESIGN.md

The design system for Quantum State toys, and the design of the first toy, the Governance Brain (`app/`).

A toy is tangible "smoke and mirrors", not the prototype. It fakes the data and the AI so a person can feel the experience. Every toy in this repo uses the universal toy style below. The Governance Brain section further down covers that toy only.

**Figma is the source of truth.** If this file and Figma disagree, Figma wins: fix this file.

- Tokens: [Toy Designs · Tokens · Toy style · universal](https://www.figma.com/design/lWqJ4xxExzCi9KsAotwLDe/Toy-Designs?node-id=101-445)
- Governance Brain: [Toy Designs · Governance brain · toy sheet · universal](https://www.figma.com/design/lWqJ4xxExzCi9KsAotwLDe/Toy-Designs?node-id=124-191)

---

## 1. The universal toy style

> "it will be intentionally flat, shifting backwards to the wiki tokens with a hint of playfullness"
>
> "the toys should feel half-way between sketched and coded, somewhere between sketched minimalism and cartoon line-art fidelity and flexibility; reserving a more utilitarian style for dense data."
>
> — Jacques, Mo-12-Oct

Flat, warm paper, one ink, line art. A hint of play, and a plain ledger style wherever the data gets dense. It blends three references, each with one job:

| Source | Job |
| --- | --- |
| Boords | Warm paper: Alabaster page, Ash rules, Warm Umber text, Peach for small highlights. |
| Opennote | The playful hand: outline line-art and icons in one ink, flat surfaces, tiny pops of color, bounce in code. |
| Dries Bos | The ledger: square rows, full-width rules, mono for tabular data, arrow icons, 2.5D from outline offsets instead of shadows. |

### 1.1 Color

The wiki's six neutral tokens, with the same names and roles, warmed from cool gray to paper. Ink is signal only.

| Token | Hex | Role |
| --- | --- | --- |
| Bench | `#FAFAF5` | Page background |
| Surface | `#FFFFFF` | Cards, the details panel, chips at rest |
| Glass 28 | `#E8E7E3` | Panels, data rows, the graph field |
| Glass 45 | `#CECDCA` | Rules, hairlines, wheel spokes, graph links |
| Graphite | `#6B6A68` | Labels, secondary text (5.2:1 on Bench), nodes |
| Body | `#2D2824` | Running text |
| Ink | `#121212` | Signal only: line art, headings, selected, focus |

**One accent, the AI's hand.** Peach `#EB6C00` marks the AI's work only: a document being sorted, its dashed links, the "AI insight" mark, the source being read in Smart Search, and a highlighter wash at 14% behind words. It is never used for body text (2.9:1 on Bench).

**The rainbow link, the only gradient.** It's drawn when Smart Search finds a relationship the graph didn't have. A 1 px linear gradient: `#3A86FF → #8338EC → #FF006E → #FB5607 → #FFBE0B`. It has a glow: a `#8338EC` drop shadow with 1.2 px blur and no offset. The same glow marks the Smart Search send arrow, which is Ink.

**Risk.** Used for risk only: wheel rungs, the risk gauge and factor weights. Flat fills, no tints.

| Rung | Hex |
| --- | --- |
| Within appetite | `#4E9A5B` |
| Near the limit | `#D9A62E` |
| Over appetite | `#C0504D` |

**Domain hues.** Only on wheel labels, legend dots and the chat log's source dots. Never on the Graph view or the Smart Search sphere. A domain chip that's off shows its hue at 40%.

| Domain | Hex |
| --- | --- |
| Strategic direction | `#3A7FB0` |
| Strategy execution | `#4A9468` |
| Financial stewardship | `#C99A2E` |
| Risk and resilience | `#B85C5C` |
| Controls and assurance | `#7650A8` |
| Major decisions | `#2E8F8A` |
| Remuneration | `#C2577F` |

```css
:root {
  --bench: #FAFAF5;
  --surface: #FFFFFF;
  --glass-28: #E8E7E3;
  --glass-45: #CECDCA;
  --graphite: #6B6A68;
  --body: #2D2824;
  --ink: #121212;

  --peach: #EB6C00;
  --peach-wash: rgb(235 108 0 / 0.14);
  --rainbow: linear-gradient(90deg, #3A86FF, #8338EC, #FF006E, #FB5607, #FFBE0B);
  --rainbow-glow: drop-shadow(0 0 1.2px #8338EC);

  --risk-within: #4E9A5B;
  --risk-near: #D9A62E;
  --risk-over: #C0504D;

  --domain-strategic-direction: #3A7FB0;
  --domain-strategy-execution: #4A9468;
  --domain-financial-stewardship: #C99A2E;
  --domain-risk-resilience: #B85C5C;
  --domain-controls-assurance: #7650A8;
  --domain-major-decisions: #2E8F8A;
  --domain-remuneration: #C2577F;
}
```

### 1.2 Type

The wiki's font families, at toy sizes. Four sizes, two weights for the sans, plus mono for data.

| Role | Font | Size / line height | Notes |
| --- | --- | --- | --- |
| Heading | Instrument Sans Medium 500 | 28 / 1.1 | letter-spacing -0.025em |
| Title | Instrument Sans SemiBold 600 | 18 / 1.25 | |
| Body | Nunito Regular 400 | 14 / 1.5 | |
| Label | Instrument Sans Medium 500 | 12 / 1.3 | chips, node labels, buttons |
| Data | JetBrains Mono Regular 400 | 12 / 1.0 | numbers, dates, table heads, metadata keys |

Icons: Material Symbols Rounded, weight 300 (Light), outlined. Arrows such as ↗ go in JetBrains Mono, because Nunito doesn't have them.

All four fonts are on Google Fonts.

### 1.3 Space, shape, line

- **Space:** 2 · 4 · 8 · 12 · 16 · 32. Element gap 8, card padding 12 to 16, sections 32.
- **Radius:** 4 for cards, panels, chips and controls; 2 for small tags and nodes; 0 for the ledger.
- **Lines:**
  - Icons and outlines: 1.5 px Ink, round caps and joins.
  - Hairlines and graph links: 1 px Glass 45.
- **Lift (the 2.5D):** a hard offset with no blur, `box-shadow: 3px 3px 0 var(--ink)`. Use it only on a panel that is open or picked, such as the details panel, the risk summary or the agent chat.

### 1.4 Two registers

**Play** is the default: the graph, the wheel, Smart Search, chips, insight cards.
- Radius 4.
- Line art in Ink.
- Nunito body text.
- Outline icons.
- Things can pop and settle.

**Ledger** is for dense data: the risk summary's factors, metadata, any table.
- Radius 0.
- Full-width rules: 1 px Ink on top, Glass 45 between rows.
- Rows padded 8 / 12.
- JetBrains Mono for heads and numbers.
- Only arrow and open icons.
- No bounce and no lift.

### 1.5 Motion (code only)

Motion is not designed in Figma (decided Mo-12-Oct). The Motion page in Figma holds static storyboards only.

- In play, things pop and settle with a small overshoot: `cubic-bezier(0.34, 1.56, 0.64, 1)`, 180 to 320 ms.
- The ledger doesn't bounce.
- Motion is the lowest priority: get it working first.

### 1.6 Never

- Gradients or blur shadows. The one exception is the rainbow link and its glow.
- Tilts.
- Dark sections.
- Filled accent buttons. Actions are outlined in Ink on Surface; the only filled control is the selected segment of a view switch, which is Ink with Bench text.
- Gradient Aura or a color wash behind the graph.

### 1.7 Shared components

- **Chip (domain filter):**
  - On: Surface fill, 1.5 px Ink outline, Ink label, icon.
  - Off: no fill, 1 px Glass 45 outline, Graphite label.
  - Radius 4, padding 5 / 10.
  - "Clear all" sits after the chips as a ghost button with a close icon.
- **View switch:** a segmented control with a 1 px Ink outline and radius 4. The selected segment is Ink with Bench text; the others are Surface with Ink text.
- **Search field:** Surface, 1 px Glass 45 outline, radius 4, a search icon, and a `/` key hint in mono.
- **Tag:** Glass 28 fill, radius 2, Label size, Body color.
- **Button:** outlined, 1.5 px Ink, Surface fill, radius 4, Label size, optional icon.
- **Card:** Surface, 1 px Glass 45 outline, radius 4, padding 12 to 16.
- **Panel:** Surface, 1.5 px Ink outline, radius 4, with lift.

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
- **A wheel per domain:** with only one chip on, that domain's own wheel opens, with eight topics and the same rungs.
- **Risk summary panel** (ledger), when you pick a node on a wheel:
  - its rung;
  - its score against the appetite, in mono, with a risk gauge;
  - a factors table of factor, weight and evidence. Each weight is in its rung color and each piece of evidence links to its source.

### 2.6 Filters and search

- **Domain filters** work the same on Graph and Wheel.
- **Hiding a domain** removes its documents completely: no hidden labels, no ghosts.
  - With every domain off, you get an empty graph and an empty wheel showing only its rungs.
  - **Clear all** turns them all off.
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
