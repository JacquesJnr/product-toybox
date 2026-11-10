# Case data brief

## Purpose

Add evidence that lets the approved case reach a firm, sourced recommendation.
Keep one milestone acceptance record missing, subject to Jacques's decision; missing proof must not imply a missed target.

## Basis and delivery

Use the case shape in commit `2367ee3`.
Keep its question, three drivers, flip assumption and explicit unknowns.
Extend `documents.json` with new records only.
Do not change any seed record.
This brief specifies data; it does not supply or approve that data.

Deliver confirmed material by Thursday 12 Nov 2026, 15:00 GMT+4.
The proposed case snapshot is **DRAFT 2026-10-05**.
Its meeting and payment dates are scenario dates, not delivery dates.
All proposed dates, amounts, counts, assignments and conclusions below are DRAFT.
Dad must confirm or replace them before an agent presents them as evidence.
An agent may draft wording, but must not invent a confirmation, signature or completed action.

## Unknown-to-document map

| Unknown claim | New documents | Intended evidence and remaining limit |
| --- | --- | --- |
| `safe-to-wait` | `incentive-plan-rules`; `retention-impact-note`; `decision-return-note` | Compare payment terms, the retention trigger and the next meeting. Test whether waiting changes the business outcome. Keep wider employment-contract exposure unknown. |
| `target-proof` | `delivery-evidence-review`; `payout-reconciliation` | State approved targets and verified results. Keep the third milestone's acceptance record missing if Jacques agrees. Do not classify it as failed. |
| `payment-size` | `incentive-plan-rules`; `payout-reconciliation`; `collections-cash-update` | Reconcile the proposed full award with its cash impact. Distinguish a proposed award from an authorised liability. |
| `payment-date` | `incentive-plan-rules`; `decision-return-note` | State the conditional payment date, payroll cutoff and meeting date. Do not turn a cutoff into an unconditional payment obligation. |
| `retention-cost` | `retention-impact-note`; `collections-cash-update` | Supply evidence of an affected role and a dated retention trigger. Separate estimated exposure from an actual cash outflow. |
| `contract-rights` | `incentive-plan-rules` | Resolve only rights established by the signed plan. Employment contracts stay unavailable. This claim remains partly unknown. |
| `cash-after-release` | `collections-cash-update`; `payout-reconciliation` | Show confirmed collections, the board minimum and release-versus-deferral balances. State the period and assumptions. |
| `launch-pay-link` | `delivery-evidence-review`; `launch-accountability-update`; `retention-impact-note` | State whether the approved scorecard includes launch work. Separate this documentary link from an unproved causal effect of pay on launch success. |
| `defer-release` | All seven new documents | Support a reasoned choice between holding release and expedited review. A recommendation stays a judgement. Do not call it an adopted board decision. |
| `review-timing` | `decision-return-note`; `retention-impact-note`; `collections-cash-update`; `delivery-evidence-review` | Give each timing option an evidence base. Record real positions only if the supplied material confirms them. Otherwise keep Room positions scripted. |
| `decision-pack` | All seven new documents | Identify available evidence, its owner and its return date. Mark the retained acceptance record and employment contracts unavailable. Do not claim the pack is complete. |

## Proposed decision test

The initial recommendation is DRAFT: hold payment release and expedite the evidence review.
The named alternative is to hold release until the scheduled next meeting.
Neither option permits payment without the policy checks.
The third milestone's missing record prevents a positive finding on full eligibility.
It does not prove that delivery failed.

The retention note tests the flip assumption.
A confirmed retention trigger before the next meeting can favour expedited review.
If dad cannot support that trigger, keep retention cost unknown.
Do not manufacture urgency to force the recommendation.

The cash model gives the choice business stakes.
Full release uses most of the downside cash buffer.
Keeping cash preserves options for platform delivery and supplier continuity.
The model does not prove that payment causes a launch failure.

## New document specifications

All metadata below is proposed.
All insight text and confidence values are DRAFT until the underlying facts are confirmed.
Page and cell references describe the proposed source layout.
Put each insight's supporting passage at that location.
Copy confirmed facts into `text` and `summary`; insights must not supply unsupported facts.

### 1. Incentive plan rules

- Proposed id: `incentive-plan-rules`.
- Title: Incentive plan rules.
- Type: `pdf`.
- Issued: **DRAFT 2026-10-02**.
- From: Remuneration Committee Secretary.
- Author: Oliver Grant, Remuneration Committee Secretary.
- Domains: Remuneration; Controls and assurance.
- primaryDomain: Remuneration.
- Supplier: **dad**.

Facts to state:

- [ ] State the approved plan version and its effective date: **DRAFT 2026-10-02**.
- [ ] State which proposed award the plan governs.
- [ ] State the full proposed award: **DRAFT USD 600,000**.
- [ ] State that this is a conditional proposal, not an approved payment.
- [ ] Require all scorecard milestones and a documented second-person review before full approval.
- [ ] State whether partial payment is allowed: **DRAFT not allowed under this plan**.
- [ ] Give the payroll instruction cutoff: **DRAFT 2026-10-07, 12:00 GMT+4**.
- [ ] Give the scheduled payment date: **DRAFT 2026-10-09**, only if eligibility and approval are complete.
- [ ] State what happens if the cutoff is missed: **DRAFT return to the committee for a new payment instruction; no automatic payment**.
- [ ] Identify the approval authority: **DRAFT remuneration committee recommendation, followed by board approval**.
- [ ] State any penalty or entitlement that this plan itself creates.
- [ ] Dad must supply the actual wording for those rights; do not infer them from the dates.
- [ ] State that the plan does not reproduce employment contracts or establish the absence of separate contractual rights.

Proposed insights:

| DRAFT text | Tags | pageRef | DRAFT confidence |
| --- | --- | --- | --- |
| The USD 600,000 proposal requires full milestone evidence and second-person review before approval. | Pay, Controls | p. 2 | 0.96 |
| The 7 October payroll cutoff precedes the scheduled next meeting; missing it requires a new instruction. | Pay, Ownership | p. 3 | 0.94 |

Links from this new record:

- `policy-v4`: `cites`.
- `exec-pay-review`: `shared-content`.
- `delivery-evidence-review`: `cites`.
- `payout-reconciliation`: `shared-content`.

### 2. Delivery evidence review

- Proposed id: `delivery-evidence-review`.
- Title: Delivery scorecard and evidence review.
- Type: `sheet`.
- Issued: **DRAFT 2026-10-05**.
- From: Finance Planning.
- Author: Tom Brennan, Head of Financial Planning.
- Domains: Strategy execution; Remuneration; Controls and assurance.
- primaryDomain: Strategy execution.
- Supplier: **dad**.

Facts to state:

- [ ] Identify the scorecard approved for this award.
- [ ] Give **DRAFT three milestones**, with weights of **DRAFT 40%, 35% and 25%**.
- [ ] Milestone A: **DRAFT platform pilot acceptance by 2026-09-25**.
- [ ] Record A's acceptance evidence dated **DRAFT 2026-10-02**.
- [ ] Milestone B: **DRAFT supplier escalation contact coverage by 2026-09-28**.
- [ ] Record B's contact-list evidence dated **DRAFT 2026-10-02**.
- [ ] Do not describe contact coverage as a tested supplier recovery plan.
- [ ] Milestone C: **DRAFT new-market launch readiness acceptance by 2026-10-02**.
- [ ] Identify C's independent acceptance record as **DRAFT not supplied to the vault**.
- [ ] State that C's actual outcome cannot be determined from the supplied record.
- [ ] Do not set C's result to zero or mark it failed.
- [ ] State explicitly that launch readiness is an incentive target in this new scorecard, if dad confirms it.
- [ ] Keep that new fact separate from what the September documents said.
- [ ] Record second-person review by **DRAFT Sofia Lindqvist on 2026-10-05**.
- [ ] Limit that review to A and B; do not imply that it certifies C or full eligibility.

Proposed insights:

| DRAFT text | Tags | pageRef | DRAFT confidence |
| --- | --- | --- | --- |
| The supplied scorecard includes launch readiness, but its independent acceptance record is unavailable. | Delivery, Pay | C12 | 0.95 |
| Review confirms evidence for two milestones; it cannot establish whether the third milestone was met. | Controls, Delivery | D14 | 0.96 |

Links from this new record:

- `exec-pay-review`: `shared-content`.
- `strategy-note`: `shared-content`.
- `policy-v4`: `cites`.
- `incentive-plan-rules`: `cites`.
- `launch-accountability-update`: `shared-content`.

### 3. Payout reconciliation

- Proposed id: `payout-reconciliation`.
- Title: Incentive payout reconciliation.
- Type: `sheet`.
- Issued: **DRAFT 2026-10-05**.
- From: Financial Controller.
- Author: Sofia Lindqvist, Financial Controller.
- Domains: Financial stewardship; Remuneration; Controls and assurance.
- primaryDomain: Financial stewardship.
- Supplier: **agent draft**.

Facts to state:

- [ ] Reconcile the full proposed award to **DRAFT USD 600,000**.
- [ ] Show weighted components of **DRAFT USD 240,000, USD 210,000 and USD 150,000**.
- [ ] Reconcile those components to the scorecard weights.
- [ ] Mark the components as calculation allocations, not independently payable awards.
- [ ] State that the missing C record prevents a full eligibility conclusion.
- [ ] State that no payment approval is recorded in this document.
- [ ] Use **DRAFT USD 600,000** as the complete company cash outflow for the scenario.
- [ ] State **DRAFT no additional employer cash charge in this dummy scenario**; dad must confirm or replace that simplifying assumption.
- [ ] Reconcile the cash outflow with incentive expense already included in Forecast 2027.
- [ ] Explain expense versus cash timing; do not add the same award twice.
- [ ] Identify Sofia as the proposed reconciliation owner, not a retroactive personal assignment in Controls memo.

Proposed insights:

| DRAFT text | Tags | pageRef | DRAFT confidence |
| --- | --- | --- | --- |
| The three weighted components total USD 600,000; none is authorised for separate payment. | Pay, Controls | F9 | 0.97 |
| The cash comparison uses one USD 600,000 outflow and does not double-count forecast incentive expense. | Capital, Pay | F15 | 0.95 |

Links from this new record:

- `controls-memo`: `same-author`.
- `forecast-2027`: `shared-content`.
- `incentive-plan-rules`: `cites`.
- `delivery-evidence-review`: `cites`.
- `collections-cash-update`: `shared-content`.

### 4. Collections cash update

- Proposed id: `collections-cash-update`.
- Title: Post-collections liquidity and payout sensitivity.
- Type: `sheet`.
- Issued: **DRAFT 2026-10-05**.
- From: Treasurer.
- Author: Yusuf Al-Mansouri, Treasurer.
- Domains: Financial stewardship; Risk and resilience.
- primaryDomain: Financial stewardship.
- Supplier: **agent draft**.

Facts to state:

- [ ] State that this is the update requested in Liquidity review after confirmed collections.
- [ ] Confirm receipts of **DRAFT USD 1,200,000 on 2026-10-02**.
- [ ] Include those receipts in every balance below; do not add them again.
- [ ] Assess the minimum projected cash balance over **DRAFT 2026-10-05 to 2026-10-31**.
- [ ] State the board minimum as **DRAFT USD 5,000,000** throughout that period.
- [ ] Base case without release: **DRAFT USD 6,400,000**.
- [ ] Base case with release: **DRAFT USD 5,800,000**.
- [ ] Downside without release: **DRAFT USD 5,600,000**.
- [ ] Downside with release: **DRAFT USD 5,000,000**.
- [ ] Give headroom as balance minus the board minimum.
- [ ] Show base headroom of **DRAFT USD 1,400,000 without release** and **DRAFT USD 800,000 with release**.
- [ ] Show downside headroom of **DRAFT USD 600,000 without release** and **DRAFT USD 0 with release**.
- [ ] Include platform investment and supplier continuity payments in both options.
- [ ] State the further receipt-delay sensitivity: **DRAFT USD 400,000 less cash within the period**.
- [ ] Under that sensitivity, show **DRAFT USD 5,200,000 without release** and **DRAFT USD 4,600,000 with release**.
- [ ] Label that further stress as a scenario, not an observed breach.
- [ ] Do not assume an undrawn facility is unconditional cash; preserve the seed's covenant qualification.
- [ ] Keep retention replacement exposure outside these balances unless its timing becomes an evidenced cash flow.

Proposed insights:

| DRAFT text | Tags | pageRef | DRAFT confidence |
| --- | --- | --- | --- |
| Full payout leaves no downside buffer above the USD 5,000,000 board minimum. | Liquidity, Capital | E18 | 0.96 |
| A further USD 400,000 receipt delay breaches the minimum only in the payout stress scenario. | Liquidity, Controls | E24 | 0.95 |

Links from this new record:

- `liquidity-review`: `cites`.
- `treasury-update`: `same-author`.
- `forecast-2027`: `shared-content`.
- `payout-reconciliation`: `cites`.
- `retention-impact-note`: `shared-content`.

### 5. Retention impact note

- Proposed id: `retention-impact-note`.
- Title: Incentive timing and retention exposure.
- Type: `pdf`.
- Issued: **DRAFT 2026-10-05**.
- From: People Operations.
- Author: Grace Mwangi, People Operations Lead.
- Domains: Remuneration; Strategy execution.
- primaryDomain: Remuneration.
- Supplier: **dad**.

Facts to state:

- [ ] Identify the affected role: **DRAFT launch delivery lead**.
- [ ] State the evidence for concern: **DRAFT one written request for a decision update by 2026-10-07**.
- [ ] Dad must confirm whether such a request is realistic and available.
- [ ] Do not convert a request into a resignation notice or a promise to stay.
- [ ] State which consequence could follow a delayed response.
- [ ] Give estimated replacement and handover exposure: **DRAFT USD 200,000**.
- [ ] State the estimation basis and separate it from an approved or incurred cost.
- [ ] State **DRAFT no reliable departure probability available**.
- [ ] Do not use that exposure as an expected loss or put it into cash balances without dated support.
- [ ] State whether an expedited evidence review can answer the request without committing to payment.
- [ ] Do not claim that payment guarantees retention or launch success.
- [ ] If dad cannot support the trigger or estimate, leave them unavailable and retain the unknown.

Proposed insights:

| DRAFT text | Tags | pageRef | DRAFT confidence |
| --- | --- | --- | --- |
| The requested decision update falls before the next meeting; it does not establish an obligation to pay. | People, Pay | p. 2 | 0.92 |
| USD 200,000 is replacement exposure, not a certain loss or a probability-weighted forecast. | People, Delivery | p. 3 | 0.93 |

Links from this new record:

- `training-log`: `same-author`.
- `incentive-plan-rules`: `cites`.
- `decision-return-note`: `shared-content`.
- `launch-accountability-update`: `shared-content`.

### 6. Launch accountability update

- Proposed id: `launch-accountability-update`.
- Title: Launch accountability and recovery actions.
- Type: `pdf`.
- Issued: **DRAFT 2026-10-05**.
- From: Chief Risk Officer.
- Author: Elena Petrova, Chief Risk Officer.
- Domains: Risk and resilience; Strategy execution; Strategic direction.
- primaryDomain: Risk and resilience.
- Supplier: **agent draft**.

Facts to state:

- [ ] Record a new accepted launch-risk assignment dated **DRAFT 2026-10-03**.
- [ ] Name the proposed accountable executive: **DRAFT Daniel Okafor, Chief Strategy Officer**.
- [ ] Require evidence of acceptance before stating that the assignment is complete.
- [ ] State that this follows the unowned position reported on 30 September.
- [ ] Keep **DRAFT two critical supplier recovery exercises** uncompleted at the snapshot date.
- [ ] Set their proposed evidence return to **DRAFT 2026-10-15**.
- [ ] Name Elena as the proposed review owner for recovery evidence.
- [ ] Separate risk ownership from proof of launch readiness.
- [ ] State that the milestone acceptance record remains unavailable under the proposed retained gap.
- [ ] Use the new scorecard to establish any launch-to-incentive link.
- [ ] Do not infer that link from the seed risk report.
- [ ] Do not claim that assigning an owner removes supplier exposure or proves launch safety.

Proposed insights:

| DRAFT text | Tags | pageRef | DRAFT confidence |
| --- | --- | --- | --- |
| The later assignment names a launch-risk owner; it does not certify launch readiness. | Ownership, Market entry | p. 2 | 0.94 |
| Supplier recovery exercises remain pending, with an evidence return on 15 October. | Supply chain, Continuity | p. 3 | 0.95 |

Links from this new record:

- `board-risk-report`: `same-author`.
- `risk-register`: `shared-content`.
- `strategy-note`: `shared-content`.
- `delivery-evidence-review`: `cites`.
- `supplier-review`: `shared-content`.

### 7. Decision return note

- Proposed id: `decision-return-note`.
- Title: Incentive decision return and review options.
- Type: `pdf`.
- Issued: **DRAFT 2026-10-05**.
- From: Office of the Company Secretary.
- Author: Amira Haddad, Company Secretary.
- Domains: Major decisions; Remuneration; Financial stewardship.
- primaryDomain: Major decisions.
- Supplier: **agent draft**.

Facts to state:

- [ ] Identify the next meeting after Minutes · Sep: **DRAFT 2026-10-08, 10:00 GMT+4**.
- [ ] State **DRAFT no intervening meeting** so the September return instruction has one meaning.
- [ ] Offer an expedited review slot: **DRAFT 2026-10-06, 10:00 GMT+4**.
- [ ] Distinguish an offered slot from a completed meeting or board decision.
- [ ] Ask Finance to return the available evidence by **DRAFT 2026-10-06, 09:00 GMT+4**.
- [ ] Name the proposed coordinator: **DRAFT Sofia Lindqvist**.
- [ ] Name the proposed cash-update owner: **DRAFT Yusuf Al-Mansouri**.
- [ ] Name the proposed launch-update owner: **DRAFT Elena Petrova**.
- [ ] State each assignment as accepted only if the supplied material records acceptance.
- [ ] Set out the choice: hold release and expedite evidence review, or hold release until the scheduled meeting.
- [ ] State that the scheduled meeting follows the payroll instruction cutoff.
- [ ] Explain that expedited review preserves an option; it does not promise eligibility or payment.
- [ ] List the missing acceptance record and unavailable employment contracts.
- [ ] Do not record a payment approval or invent an actual Finance-versus-Risk disagreement.
- [ ] Keep Room positions scripted unless dad supplies a record of those positions.

Proposed insights:

| DRAFT text | Tags | pageRef | DRAFT confidence |
| --- | --- | --- | --- |
| An offered 6 October review precedes the payroll cutoff; the scheduled 8 October meeting follows it. | Ownership, Pay | p. 2 | 0.96 |
| Neither review option authorises release while milestone evidence remains unavailable. | Controls, Stakeholders | p. 3 | 0.95 |

Links from this new record:

- `minutes-sep`: `cites`.
- `board-pack-q3`: `same-author`.
- `incentive-plan-rules`: `cites`.
- `payout-reconciliation`: `cites`.
- `collections-cash-update`: `cites`.
- `retention-impact-note`: `cites`.
- `launch-accountability-update`: `cites`.

## Constraints and retained gaps

Keep `employment-contracts` exactly as supplied.
Its author stays null and its text stays empty.
It stays not in the vault because B6 depends on that state.
Put payout rules and dates in `incentive-plan-rules` instead.
Do not describe that plan as a substitute copy of the employment contracts.
The case must still show that separate contractual rights are unknown.
An unavailable contract does not prove that an obligation or an exception is absent.

Proposed additional retained gap: the third milestone's independent acceptance record.
Jacques decides whether to keep this gap.
Keep its status unknown, not failed.
This gap makes the absence-of-evidence distinction visible in the release decision itself.
It permits a firm recommendation to hold release without pretending to prove non-performance.
Do not resolve every unknown for the demo.
The broad flip assumption can remain partly unknown because employment contracts are absent.
Use the plan and retention note to test its timing implications within their stated scope.

Use only the seven seed domains:
Strategic direction; Strategy execution; Financial stewardship; Controls and assurance; Risk and resilience; Major decisions; Remuneration.

Use only the DESIGN.md 2.7 tags:
Supply chain; Continuity; Ownership; Market entry; Cyber; Liquidity; Capital; Compliance; Controls; Reputation; People; Pay; Strategy; Delivery; Stakeholders; Regulation.

Use USD for every amount.
Keep all dates in September to November 2026.
Use GMT+4 for times.
Reconcile all payout figures to the same award and cash scenario.
Keep forecast expense separate from the incremental cash option.

Preserve the seed timeline.
September records lack target evidence and report unowned launch risk.
October follow-ups may add evidence and assignments.
They must not claim those facts were already established in September.
The later cash update follows the 1 October request and the proposed 2 October collections.
Keep base and downside cases distinct.
Do not present a projected stress breach as an actual breach.

Add links only on new records.
Do not add reciprocal links to seed records.
Use only `shared-content`, `same-author` or `cites`.
Use `same-author` only where the author matches.
Keep every proposed link target present when the extension is assembled.

Before data handoff, dad confirms the material in his three documents.
Dad also confirms or replaces the dummy financial and timeline assumptions in agent drafts.
Jacques approves the final gap and the document set.
An agent then writes the new records and rewrites the case under a separate task.
No data file or case changes are authorised by this brief alone.

## Open questions for Jacques

1. Keep the third milestone's acceptance record missing, in addition to the required employment-contract gap?
2. Does dad accept the three material requests: plan rules, scorecard evidence and retention exposure?
3. May an agent draft the reconciliation, cash update, launch update and return note for dad's confirmation?
4. Are USD 600,000 payout, USD 5,000,000 cash minimum and the proposed downside buffers realistic together?
5. Should dad confirm the 7 October cutoff, 8 October meeting and 9 October conditional payment date, or replace the sequence?
6. Can dad support a dated retention trigger before the next meeting? If not, shall retention remain unknown and the timing recommendation stay conditional?
7. Does the scorecard explicitly include launch readiness? If not, keep the pay-to-launch link unknown rather than create it.
8. Will Daniel accept the proposed launch-risk assignment? If not, who owns it and from which date?
9. Confirm that the demo keeps a hold-release recommendation while the acceptance record is missing; it must not imply a positive payment approval.
