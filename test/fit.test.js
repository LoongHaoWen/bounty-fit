const test = require('node:test');
const assert = require('node:assert');
const BF = require('../src/fit.js');
const SAMPLES = require('../samples/samples.js');

const NOW = Date.UTC(2026, 9, 11, 15, 0); // Oct 11 2026 23:00 UTC+8
const herman = { country: 'China', timeZone: 'Asia/Shanghai', rails: ['crypto', 'bank'], needsAI: true };
const s = id => SAMPLES.find(x => x.id === id).text;

test('Eastern Time deadline converts with DST', () => {
  const r = BF.analyze(s('hackathon'), herman, { now: NOW });
  assert.strictEqual(new Date(r.facts.deadline.utc).toISOString(), '2026-10-26T21:00:00.000Z');
  assert.match(r.findings.find(f => f.key === 'deadline').title, /27 Oct 2026, 05:00/);
});

test('hackathon is GO-ish for Herman: China not excluded, bank payout ok, AI allowed', () => {
  const r = BF.analyze(s('hackathon'), herman, { now: NOW });
  const country = r.findings.find(f => f.key === 'country');
  assert.strictEqual(country.level, 'ok');
  assert.strictEqual(r.findings.find(f => f.key === 'payout').level, 'ok');
  assert.strictEqual(r.findings.find(f => f.key === 'ai').level, 'ok');
  assert.strictEqual(r.verdict, 'GO');
  assert.strictEqual(r.prize.amount, 1250);
  const names = r.deliverables.map(d => d.name);
  for (const n of ['Demo video', 'Public code repo', 'Open-source license']) assert.ok(names.includes(n), n);
  assert.strictEqual(r.deliverables.find(d => d.name === 'Demo video').detail, '1 to 3 minutes');
});

test('Solana bounty pays crypto -> GO for wallet holder, NO-GO without crypto rail', () => {
  const r = BF.analyze(s('solana'), herman, { now: NOW });
  assert.strictEqual(r.verdict, 'GO');
  assert.deepStrictEqual(r.prize, { amount: 500, currency: 'USDC', raw: '500 USDC' });
  const r2 = BF.analyze(s('solana'), { ...herman, rails: ['paypal'] }, { now: NOW });
  assert.strictEqual(r2.verdict, 'NO-GO');
  assert.strictEqual(r2.findings.find(f => f.key === 'payout').level, 'block');
});

test('US-only Stripe challenge is NO-GO with quoted evidence', () => {
  const r = BF.analyze(s('blocked'), herman, { now: NOW });
  assert.strictEqual(r.verdict, 'NO-GO');
  const c = r.findings.find(f => f.key === 'country');
  assert.strictEqual(c.level, 'block');
  assert.match(c.evidence, /only open to legal residents/);
  assert.strictEqual(r.findings.find(f => f.key === 'ai').level, 'block');
  assert.strictEqual(r.findings.find(f => f.key === 'payout').level, 'block'); // Stripe + US bank only
  // but a US resident with Stripe + no AI would pass country & payout
  const us = BF.analyze(s('blocked'), { country: 'United States', timeZone: 'America/Los_Angeles', rails: ['stripe'], needsAI: false }, { now: NOW });
  assert.strictEqual(us.findings.find(f => f.key === 'country').level, 'ok');
  assert.strictEqual(us.findings.find(f => f.key === 'payout').level, 'ok');
});

test('explicit exclusion of China blocks', () => {
  const r = BF.analyze('Deadline: Dec 1, 2026 5pm UTC. Not open to residents of China, Iran or Cuba. Prize 100 USDC paid on-chain.', herman, { now: NOW });
  assert.strictEqual(r.findings.find(f => f.key === 'country').level, 'block');
});

test('past deadline blocks; empty text yields CHECK', () => {
  const r = BF.analyze('Deadline: Sep 1, 2026 11:59 PM UTC. Prize $100 via PayPal. Open to everyone.', { ...herman, rails: ['paypal'] }, { now: NOW });
  assert.strictEqual(r.verdict, 'NO-GO');
  assert.strictEqual(BF.analyze('hello', herman, { now: NOW }).verdict, 'CHECK');
});

test('"laws of the United States" is not an exclusion of the US', () => {
  const r = BF.extract('The Hackathon IS NOT open to: Individuals who are residents of a country where the laws of the United States prohibit participating (including Cuba and Iran).');
  assert.deepStrictEqual(r.exclusions.map(e => e.country).sort(), ['Cuba', 'Iran']);
});
