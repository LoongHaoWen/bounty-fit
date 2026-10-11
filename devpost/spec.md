---
doc: spec
status: approved
---
# Bounty Fit — Technical Spec

## How This Works, In Plain Language
It is one web page. A small JavaScript "reader" (`src/fit.js`) scans the pasted rules text with patterns, pulls out facts (deadline, countries, payout methods, AI rules, deliverables, prize), and then compares them to your saved profile to produce a verdict. Everything happens in your browser; nothing is sent anywhere. The same reader file is loaded by the tests in Node, so we can prove it works without clicking.

## The Core Journey Through the System
Paste text → `app.js` calls `BountyFit.analyze(text, profile)` → `extract()` returns facts with evidence snippets → `judge()` returns `{verdict, findings}` → `app.js` renders the card. Profile edits → saved to localStorage → re-run analyze. PRD ref: `prd.md > The Core Journey`.

## Stack
- Plain HTML/CSS/JavaScript, no framework, no build step, no dependencies.
- Time-zone conversion with the built-in `Intl.DateTimeFormat` API (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat).
- Tests: Node's built-in `node:test` (Node ≥ 18).

## Where It Runs and How Someone Tries It
Open `index.html` directly in any modern browser, or `npm start` (serves on http://localhost:5173 with a zero-dependency Node static server). `npm test` runs the extractor tests. Demo recording: open the page, click the samples, toggle profile.

## Look and Feel
Dark slate background, one accent colour per verdict, system sans-serif, monospace for quotes, generous spacing.

## Components
### Extractor (`src/fit.js > extract`)
Pattern sets per fact. Splits text into sentences to return evidence. PRD ref: `prd.md > Extraction`.
### Judge (`src/fit.js > judge`)
Applies the verdict rules. PRD ref: `prd.md > Verdict`.
### UI (`app.js`, `index.html`, `style.css`)
Profile form, paste box, samples, verdict rendering. PRD ref: `prd.md > Screens and Layout`.

## Data Model
`profile = {country, timeZone, rails: string[], needsAI: boolean}` in localStorage key `bountyfit.profile`. Facts and findings are recomputed, never stored.

## File Structure
```
.
├── index.html        # the app
├── style.css
├── app.js            # UI wiring, profile persistence, samples
├── src/fit.js        # extractor + judge (browser global + CommonJS)
├── samples/samples.js# bundled sample rules texts (synthetic)
├── test/fit.test.js  # node:test unit tests
├── server.js         # tiny static server for npm start
├── devpost/          # scope.md, prd.md, spec.md, checklist.md
└── LICENSE           # MIT
```

## External Services and Dependencies
None.

## Important Failure Modes
- **Unusual deadline format** → CHECK verdict with "deadline not found".
- **Country listed only in a linked page** → CHECK note "eligibility lists may be on another page".

## What Was Simplified and Why
- **Regex extraction** instead of an LLM — free, offline, explainable; an LLM fallback would need a local model (e.g. Ollama) or an API key.

## Decisions and Open Issues
- Agent-proposed under Herman's delegation; awaiting his read-through.
- Uncertainty: converting "ET" correctly across DST — resolved by mapping EDT/EST explicitly and treating bare "ET" by date (DST rule for US Eastern).
