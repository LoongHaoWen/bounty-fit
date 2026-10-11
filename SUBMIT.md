# Devpost submission draft — Build With AI: Basics

Hackathon: https://learn-ai-basics.devpost.com/
Deadline: **Oct 26, 2026 5:00 pm EDT = Tue Oct 27, 2026 05:00 (UTC+8)**
Status: NOT submitted. Fill these fields, then click Submit only after Herman confirms.

## Checklist before submitting
- [ ] Joined hackathon on Devpost (account: hermanwinson@gmail.com)
- [ ] Push this folder to a **public** GitHub repo (e.g. `bounty-fit`) with the MIT LICENSE visible in About
      (devpost/scope.md, prd.md, spec.md must be in the repo; devpost/learner-profile.md is gitignored on purpose)
- [ ] Record / upload demo video (1–3 min) to YouTube as **Public** (or Unlisted only if rules allow — rules say "publicly visible")
      Draft silent version: docs/demo-draft.mp4 (66 s). Better: re-record with voice-over following README "Demo steps".
- [ ] Paste fields below into "Enter a Submission"

## Fields

**Project name:** Bounty Fit

**Elevator pitch (≤200 chars):**
Paste a bounty or hackathon's rules, get a go/no-go for *you*: country eligibility, payout rails you can actually receive, AI policy, and the deadline in your time zone.

**About the project (Markdown):**

## Inspiration
I enter Solana bounties and online hackathons from China on weeknights. Twice I spent an evening on an entry before noticing the prize only paid out to a rail I can't receive, or that AI-assisted work was banned. Bounty lists show the prize; nobody checks the rules against *my* situation.

## What it does
Bounty Fit takes pasted rules text and my saved payout & eligibility profile (country, time zone, payout methods I can receive, whether I build with AI help) and returns a traffic-light verdict — GO, CHECK or NO-GO. Every finding quotes the exact sentence it came from: excluded countries or "only open to" lists, payout rails (USDC/crypto, PayPal, Stripe, bank wire, US-only ACH, check), AI policy, required deliverables, the top prize, and the deadline converted to my time zone with a countdown. Change the profile and the verdict recomputes live, so the same rules give different answers to different people.

## Who it's for
Indie builders outside the US — especially in places where payout rails are the real constraint — who hunt bounties and hackathons and want to stop wasting evenings on prizes they can't receive.

## How I built it
I started from an empty folder with the Devpost Learn Skill Pack (`npx skills add challengepost/learn-ai-basics`) and worked through 1-start → 2-scope → 3-prd → 4-spec → 5-build with my coding agent. The scope/PRD/spec are in `devpost/`. It's a single static page in plain HTML/CSS/JS with no dependencies and no API keys; the extractor runs the same in the browser and in Node's built-in test runner.

## Challenges
Rules pages are written by lawyers. Testing against a real Devpost rules page exposed false positives: "the laws of the United States" and a W-9 tax sentence made the US look excluded, and "Stripe payout to a US bank account" looked receivable for anyone with a bank account. Each became a test case and a fix.

## What I learned
Planning first paid off: the scope interview forced me to name the kernel (the personal profile), which is exactly what the first real-world bug threatened. Explainable rules with quoted evidence beat a black-box answer for something you have to trust.

## What's next
URL fetch, batch-ranking a list of bounties, a local-LLM fallback for unusual phrasing, Chinese UI.

**Built with:** html, css, javascript, node.js, devpost-learn-skill-pack

**Try it out links:** <GitHub repo URL> (optionally GitHub Pages URL)

**Video demo link:** <YouTube URL>

**Pre-existing code disclosure (if asked):** None. Built from an empty folder during the submission period. Planning docs generated with the Devpost Learn Skill Pack; code written with an AI coding agent.
