---
doc: prd
status: draft
---
# Bounty Fit — Product Requirements

A single-page tool that tells an indie builder whether they can enter a bounty/hackathon and actually receive the prize. Source: `scope.md > The Unique Kernel`.

## The Core Journey
1. Open `index.html` (no install). First visit shows the profile panel pre-filled with sensible defaults (country China, time zone Asia/Shanghai, rails: USDC-Solana, crypto wallet, bank wire; AI-assisted: yes).
2. Adjust the profile once; it is saved in the browser.
3. Paste a rules page (or click a bundled sample).
4. Press **Check fit** (or Ctrl+Enter). The verdict card appears: GO / CHECK / NO-GO, with prize, local deadline + countdown, and a list of findings.
5. Each finding shows a short evidence quote from the pasted text.
6. Change the profile (e.g. remove a payout rail) → the verdict recomputes live.
Source: `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`.

## Screens and Layout
One screen, two columns: left = profile + paste box; right = verdict card and findings. Stacks vertically on narrow windows.

## Look and Feel
Dark, calm, pre-flight checklist. Traffic-light colours only for verdicts (green GO, amber CHECK, red NO-GO). Evidence quotes in monospace. Source: `scope.md > Inspiration & Identity`.

## Features and Behavior
### Extraction
- **Deadline**: finds "Deadline", "Submission Period … – <date>", "due", with time + zone (EDT/EST/ET/PT/UTC/GMT/UTC±N). Converted to the profile time zone with a countdown; past deadlines flag NO-GO.
- **Country exclusions**: detects "not open to / excluding / residents of … " lists and checks the profile country (with aliases, e.g. China / PRC / Mainland China). Also notes "all countries" phrasing.
- **Payout rails**: detects USDC/USDT/SOL/ETH/stablecoin, PayPal, Stripe, bank/wire, check/mail, gift card. Compares with profile rails.
- **AI policy**: detects "AI-generated … not allowed / prohibited / human only" (NO-GO if profile relies on AI help) vs "AI agents allowed / built with AI".
- **Deliverables**: video (with length), public repo, open-source license, X/Twitter post, written description, form.
- **Prize**: largest $ / USDC amount found.

### Verdict
- NO-GO if any blocking finding (country excluded, deadline passed, AI-only-human when profile needs AI, no receivable payout rail when rails are explicitly listed).
- CHECK if something unresolved (no deadline found, payout rail unknown).
- GO otherwise.

- As Herman, I want an excluded-country sentence quoted so I trust the NO-GO.
  - [ ] The NO-GO card shows the sentence containing the matching country.

## States and Boundaries
- **Empty** — right column shows a hint and sample buttons.
- **Nothing recognised** — CHECK verdict, "couldn't find a deadline/payout; read manually".
- **Persistence** — profile in localStorage; pasted text is not stored.

## Product Decisions
- Paste text instead of fetching URLs — avoids CORS/scraping, works offline. (Agent-proposed under Herman's delegation.)
- Rule-based, explainable extraction instead of an LLM — free, deterministic, every finding has evidence.

## What We're Building
Profile panel, paste box, three bundled samples, extractor, verdict card with evidence, live recompute, unit tests for the extractor.

## Deferred From the POC
URL fetch, batch ranking, LLM fallback for unusual phrasings, Chinese UI.

## Non-Goals
Not legal or tax advice; not a bounty aggregator; no scraping.

## Open Questions
- Should "bank transfer" count as receivable for Herman by default? (Can wait; it's a profile toggle.)
