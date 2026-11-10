# Case data brief

Status: draft for Jacques's approval (leaf 1.6, T94).
All amounts, dates and names below are DRAFT values. Dad confirms or replaces them before they become data.

## What this brief is for

The approved case asks one question: "Should the board release executive incentive payments while delivery evidence is unverified, downside liquidity is tightening, and launch risk is unowned?"

On the current seed, the honest answer is "defer, because we cannot know". The seed has no amounts, no deadlines and no consequences. Thus the case can only list what is missing.

This brief turns that list into new documents. With them, the case can reach a firm recommendation that a source supports. An executive then sees two things: Quantum State connects evidence across finance, pay and execution, and it does not invent the evidence that is still missing.

## Why the data changes, and why it changes this way

1. **The case shapes the data.** Each unknown in the case names a missing fact. Each new document supplies one or more of those facts. Thus every new document has a reason to exist.
2. **The new data extends the seed.** New documents are added, and no seed document changes. The Brain checks and the Smart Search scripts depend on the seed, so they keep working.
3. **Dad supplies what only he can make realistic.** Plan rules, a delivery scorecard and a retention concern need his experience. An agent drafts the routine documents (a reconciliation, a cash update, a launch update and a meeting note), and dad checks their numbers.
4. **Some gaps stay open on purpose.** The case is valuable because it keeps "no proof" separate from "proof of failure". If the data closed every gap, the demo would lose that point.

## What the new data makes true

With the new documents, the case can recommend this: hold the payment release, and bring the evidence review forward to before the payroll cutoff.

The recommendation rests on three sourced facts:

- **Cash.** The full payout uses the whole downside cash buffer above the board minimum. A further receipt delay would put cash below the minimum.
- **Timing.** The payroll cutoff falls before the next scheduled meeting. If the board waits for that meeting, the payment misses the cutoff and needs a new instruction.
- **People.** A launch delivery lead has asked for a decision before the cutoff. This makes waiting less safe, but it is a request, not a resignation.

The alternative is to hold the release until the scheduled meeting. Neither option lets the company pay without the policy checks.

## The seven new documents

### 1. Incentive plan rules

- **Supplied by:** dad. **Author:** Oliver Grant, Remuneration Committee Secretary.
- **What it adds:** the size of the award, the conditions for payment, the payroll cutoff and the payment date.
- **Why the case needs it:** without it, the case cannot say how much is at stake or when waiting starts to cost something.
- **DRAFT facts:** a full award of USD 600,000. No partial payment. A payroll cutoff on 7 October at 12:00. A payment date of 9 October, only after approval. A missed cutoff needs a new committee instruction.
- **Resolves:** `payment-size`, `payment-date`, and part of `contract-rights` and `safe-to-wait`.

### 2. Delivery scorecard and evidence review

- **Supplied by:** dad. **Author:** Tom Brennan, Head of Financial Planning.
- **What it adds:** the three milestones that the award pays for, and the evidence for each.
- **Why the case needs it:** the policy requires proof that targets were met. This document shows which proof exists and which proof does not.
- **DRAFT facts:** milestone A (platform pilot) and milestone B (supplier contacts) have evidence and a second-person review by Sofia Lindqvist. Milestone C (launch readiness) has no acceptance record in the vault. The scorecard includes launch readiness, if dad confirms it.
- **Resolves:** most of `target-proof` and `launch-pay-link`.

### 3. Payout reconciliation

- **Supplied by:** agent draft. **Author:** Sofia Lindqvist, Financial Controller.
- **What it adds:** how the USD 600,000 splits across the three milestones, and how it relates to the incentive expense in the forecast.
- **Why the case needs it:** the cash comparison must count the payout once. This document prevents a double count.
- **Resolves:** part of `payment-size` and `cash-after-release`.

### 4. Post-collections cash update

- **Supplied by:** agent draft. **Author:** Yusuf Al-Mansouri, Treasurer.
- **What it adds:** the forecast update that the Liquidity review promised "after collections are confirmed", with and without the payout.
- **Why the case needs it:** this is the cash stake. It turns "liquidity is tightening" into a number that the board can weigh.
- **DRAFT facts:** a board minimum of USD 5.0 million. In the downside case, cash headroom is USD 600,000 without the payout and zero with it. A further USD 400,000 receipt delay would put cash below the minimum, but only in that stress case.
- **Resolves:** `cash-after-release`, and gives evidence to `review-timing`.

### 5. Timing and retention note

- **Supplied by:** dad. **Author:** Grace Mwangi, People Operations Lead.
- **What it adds:** the cost of waiting from the people side.
- **Why the case needs it:** the recommendation depends on whether waiting is safe. This note is the test of that assumption.
- **DRAFT facts:** a launch delivery lead asked for a decision by 7 October. The estimated replacement and handover exposure is USD 200,000. No reliable chance of departure is known.
- **Resolves:** part of `retention-cost` and `safe-to-wait`. If dad cannot support the request or the estimate, both stay unknown.

### 6. Launch accountability update

- **Supplied by:** agent draft. **Author:** Elena Petrova, Chief Risk Officer.
- **What it adds:** an owner for the launch risk, and the status of the supplier recovery tests.
- **Why the case needs it:** the September risk report says that nobody owns the launch risk. This October update shows what changed and what did not.
- **DRAFT facts:** Daniel Okafor accepts the launch risk on 3 October. Two supplier recovery tests are still open, with evidence due on 15 October. An owner does not prove that the launch is ready.
- **Resolves:** part of `launch-pay-link`, and gives evidence to `decision-pack`.

### 7. Decision return note

- **Supplied by:** agent draft. **Author:** Amira Haddad, Company Secretary.
- **What it adds:** the meeting dates, the owners of the evidence, and the two review options.
- **Why the case needs it:** the minutes say "return at the next meeting" but give no date. This note gives the date, so the timing conflict becomes visible.
- **DRAFT facts:** the next meeting is on 8 October, after the payroll cutoff. An expedited review is offered on 6 October, before the cutoff. Finance returns the evidence by 6 October at 09:00.
- **Resolves:** part of `payment-date`, `review-timing`, `defer-release` and `decision-pack`.

## What stays unknown, and why

- **Milestone C's acceptance record stays missing.** This puts the "no proof is not proof of failure" point inside the decision itself. The board can hold the release without a claim that delivery failed. Jacques decides if this gap stays.
- **The employment contracts stay out of the vault.** The Brain's "not in the vault" behavior (B6) depends on this document. Thus the plan rules cannot prove that no other contract rights exist, and `contract-rights` and `safe-to-wait` stay partly unknown.
- **The recommendation stays a judgement.** No document records a board decision. Thus `defer-release` stays a scripted recommendation, not a fact.

## Rules for the new data

- Add new documents only. Do not change a seed document.
- Use only the seven seed domains and the fixed tags in DESIGN.md 2.7.
- Use one currency (USD) and keep every amount consistent with the others.
- Keep the seed timeline. September documents still show the gaps. October documents can fill some of them, but must not say that the gaps were never there.
- Do not present a projected stress result as an actual breach.
- Do not invent a signature, an approval or a completed action.

## Next steps

1. Jacques approves this brief.
2. Dad confirms or replaces the DRAFT facts and supplies his three documents by Thursday 12 November, 15:00.
3. An agent writes the seven documents into `documents.json` (leaf 1.7). Jacques approves each document.
4. An agent rewrites the case on the extended data (leaf 2.7). The flip assumption `safe-to-wait` must then rest on a quoted source.

## Questions for Jacques

1. Do we keep milestone C's missing record as the second honest gap?
2. Can dad supply the plan rules, the scorecard and the retention note?
3. May an agent draft the other four documents for dad to check?
4. Are USD 600,000 against a USD 5.0 million minimum realistic together?
5. Do the dates hold: cutoff 7 October, review 6 October, meeting 8 October, payment 9 October?
6. If dad cannot support the retention request, do we leave it unknown and keep the recommendation conditional?
7. Does the real scorecard include launch readiness? If not, the pay-to-launch link stays unknown.
8. Is Daniel Okafor the right owner for the launch risk?
