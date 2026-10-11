---
doc: checklist
status: draft
---
# Build Checklist

Build mode: fast (delegated by the learner)

## Slices

- [x] **1. Paste rules and see a verdict with evidence**
  Becomes usable: Static page; paste text, press Check fit, see GO/CHECK/NO-GO with quoted findings.
  Why now: Proves the kernel end to end on the first slice.
  PRD ref: `prd.md > The Core Journey` (steps 3-5)
  Spec ref: `spec.md > Components`, `spec.md > File Structure`
  Build: index.html, style.css, app.js, src/fit.js extractor + judge.
  Verify (mechanical): `npm test`; open index.html#sample=0 and see GO.
  Learner check: Paste a real rules page you care about and see if the verdict matches your own reading.
  Commit: `Bounty Fit POC: extractor, judge, verdict UI`

- [x] **2. Personal profile drives the verdict live**
  Becomes usable: Country, time zone, payout rails and AI toggle are saved and recompute the verdict on change.
  Why now: The profile is the kernel — the same rules give different answers to different people.
  PRD ref: `prd.md > Verdict`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Data Model`
  Build: profile form + localStorage + live re-render.
  Verify (mechanical): untick Crypto on the Solana sample → NO-GO; tests cover rails/country switches.
  Learner check: Set your real payout methods and re-check a bounty you entered before.
  Commit: (same commit)

- [x] **3. Samples, tests against real rules text, demo assets**
  Becomes usable: three bundled samples, deep links for recording, screenshots and a draft demo video.
  PRD ref: `prd.md > What We're Building`
  Spec ref: `spec.md > Where It Runs and How Someone Tries It`
  Verify (mechanical): 7 passing tests; real Devpost rules page → GO for China, correct EDT→UTC+8 deadline.
  Learner check: Watch docs/demo-draft.mp4 (not committed) and record your own voice-over version.
  Commit: (same commit)

## Hands-on Checkpoints
- [ ] Early usable behavior explored — learner to try with a real bounty
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review
- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map
- [ ] Learning activity complete
- [ ] Optional edit and transfer reflection addressed
- [ ] `devpost/app-map.html` generated

Activity and evidence: Real-rules test surfaced two false positives ("laws of the United States", "U.S. Treasury") that were fixed and covered by a test (`test/fit.test.js`).

## Revisions
- Split "US bank account (ACH)" from generic bank transfer — a Stripe/ACH-only payout looked receivable for a non-US user, which defeats the kernel.
- Dropped "residents of" as an exclusion trigger — it matched tax-form sentences ("United States residents may be required to provide W-9") and wrongly excluded the US.
