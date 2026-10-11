---
doc: scope
status: approved
---
# Bounty Fit

Paste a bounty or hackathon rules page, get a 10-second go / no-go on whether *you* can enter **and actually get paid**.

## The Unique Kernel
Every "bounty aggregator" lists prizes. None of them check the prize against *your* reality: your country, the payout rails you can actually receive (USDC on Solana yes, Stripe payout no), whether AI-assisted work is allowed, and the deadline in your own time zone. Bounty Fit reads the rules against a personal **payout & eligibility profile** and says "you can enter, but you can't cash this out" before you spend an evening on it.

## Who It's For
Herman: an indie builder in China who enters Superteam Earn bounties and Devpost hackathons on weeknights. Today he opens each rules page, Ctrl-F's for "countries", "USDC", "PayPal", "AI", converts EDT deadlines in his head, and sometimes only discovers after submitting that the payout method doesn't work for him.

## The Core Loop
Open the page → (profile already saved) → paste rules text → instantly see a verdict card with the reasons, each linked to the sentence in the rules that triggered it → decide to enter or skip → paste the next one.

## Inspiration & Identity
A pre-flight checklist: calm, scannable, traffic-light verdict. Dark UI, monospace highlights of the evidence quotes. Feels like a linter for opportunities.

## Why This Matters to the Learner
Time is the scarce resource; a wrong bounty costs a whole evening and sometimes a prize he can't withdraw.

## What "Working" Looks Like
Herman pastes the Build With AI: Basics rules → verdict "GO" with deadline shown as Oct 27 05:00 (UTC+8), deliverables (video, public repo, license), payout "cash, bank/electronic — check". Then pastes a rules text that excludes his country or pays only to a payout rail he lacks → verdict flips to "NO-GO" with the exact quoted sentence highlighted. That flip is the "oh, that's cool" beat.

## The POC Boundary
- One static page, works offline, no account, no server.
- Editable profile (country, time zone, receivable payout rails, okay with AI-assisted entries) saved in the browser.
- Rule-based extraction of: deadline, excluded countries, payout rails, AI policy, deliverables, prize amount.
- Verdict card with evidence quotes.

## Later
- Fetch a URL directly; batch-rank a list of bounties; LLM fallback for messy pages; Chinese UI.

## Explicitly Cut
- Scraping platforms automatically — fragile and against some ToS; paste is enough to prove the kernel.
- Accounts / sync — one user, one browser.
- Paid LLM APIs — the hackathon POC must run free and offline.
