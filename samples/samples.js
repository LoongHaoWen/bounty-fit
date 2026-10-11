/* Synthetic sample rules texts for the demo (written for this project, not copied from real listings). */
(function (root) {
  const SAMPLES = [
    { id: 'hackathon', name: 'Online AI hackathon (Devpost-style)', text:
`Weekend AI Builders Sprint — Official Rules
Who can participate: Ages 18+ only. All countries/territories, excluding standard exceptions.
Submission Period: October 1, 2026 (10:00 am Eastern Time) – October 26, 2026 (5:00 pm Eastern Time).
The Sprint IS NOT open to individuals who are residents of Brazil, Quebec, Russia, Crimea, Cuba, Iran, and North Korea.
Participants may use AI coding assistants and starter templates.
What to Submit: a demo video (1 to 3 minutes) uploaded to YouTube, a public GitHub repository with an open source license, and a short description.
Prizes: First Place $1,250 in cash, Second Place $750, Third Place $500. A monetary prize will be sent electronically to the winner's bank account after the winner affidavit is received.` },
    { id: 'solana', name: 'Solana content bounty (USDC)', text:
`Write a thread explaining our swap aggregator
Reward pool: 500 USDC, paid to the winner's Solana wallet address within 14 days.
Deadline: Oct 15, 2026 11:59 PM UTC
Requirements: Publish a thread on X (min 6 posts) and submit the link. Include one screenshot of a real swap.
AI agents are welcome to participate, but the final post must be published from a human account.
Open to everyone worldwide.` },
    { id: 'blocked', name: 'US-only design challenge (Stripe payout)', text:
`City Parks App Challenge
This challenge is only open to legal residents of the United States and Canada (excluding Quebec).
Submissions due by November 3, 2026 at 11:59 pm PT.
Winners are paid via Stripe payout to a US bank account (ACH). Prize: $3,000.
Entries consisting of AI-generated designs are not allowed and will be disqualified.
Submit: a pitch deck (max 10 slides) and a 2 minute video walkthrough.` },
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = SAMPLES; else root.BOUNTYFIT_SAMPLES = SAMPLES;
})(typeof window !== 'undefined' ? window : globalThis);
