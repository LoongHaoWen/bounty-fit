/* Bounty Fit — extractor + judge. Works as a browser global (window.BountyFit) and in Node (require). */
(function (root) {
  'use strict';

  const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11 };

  const COUNTRY_ALIASES = {
    China: ['china', 'prc', "people's republic of china", 'mainland china', '中国'],
    'United States': ['united states', 'usa', 'u.s. residents', 'us residents'],
    India: ['india'], Brazil: ['brazil'], Russia: ['russia'], Iran: ['iran'], Cuba: ['cuba'],
    'North Korea': ['north korea'], Syria: ['syria'], Quebec: ['quebec'], Italy: ['italy'],
    'Hong Kong': ['hong kong'], Singapore: ['singapore'], Japan: ['japan'], Germany: ['germany'],
    'United Kingdom': ['united kingdom', 'uk'], Canada: ['canada'], Nigeria: ['nigeria'], Vietnam: ['vietnam'],
  };

  const RAILS = {
    crypto: { label: 'Crypto (USDC / USDT / SOL / ETH wallet)', re: /\b(usdc|usdt|usdg|stablecoins?|sol|solana|eth|ethereum|crypto|on-?chain|wallet address|tokens?)\b/i },
    paypal: { label: 'PayPal', re: /\bpaypal\b/i },
    stripe: { label: 'Stripe payout', re: /\bstripe\b/i },
    bank: { label: 'Bank transfer / wire (any country)', re: /\b((?<!us |u\.s\. )bank account|bank transfer|wire transfer|wiring|swift|iban|sent electronically)\b/i },
    usbank: { label: 'US bank account (ACH)', re: /\b(us bank account|u\.s\. bank account|ach)\b/i },
    check: { label: 'Mailed check', re: /\b(mailed|by mail|cheque|paper check)\b/i },
    giftcard: { label: 'Gift card', re: /\bgift ?cards?\b/i },
  };

  const ZONES = { UTC: 0, GMT: 0, Z: 0, EDT: -4, EST: -5, CDT: -5, CST: -6, MDT: -6, MST: -7, PDT: -7, PST: -8, BST: 1, CET: 1, CEST: 2, IST: 5.5, SGT: 8, HKT: 8, JST: 9, KST: 9, AEST: 10 };

  // ---------- helpers ----------
  function lines(text) {
    return text.replace(/\r/g, '').split(/\n+|(?<=[.!?])\s+(?=[A-Z])/).map(s => s.trim()).filter(Boolean);
  }
  function clip(s, n = 220) { s = s.replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; }
  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  // US Eastern / Pacific DST: second Sunday of March to first Sunday of November.
  function usDst(y, m, d) {
    const nthSunday = (month, n) => { const first = new Date(Date.UTC(y, month, 1)).getUTCDay(); return 1 + ((7 - first) % 7) + 7 * (n - 1); };
    const start = Date.UTC(y, 2, nthSunday(2, 2)); const end = Date.UTC(y, 10, nthSunday(10, 1));
    const t = Date.UTC(y, m, d); return t >= start && t < end;
  }

  function zoneOffset(zone, y, m, d) {
    if (!zone) return null;
    const z = zone.toUpperCase().replace(/\s+/g, ' ').trim();
    const num = z.match(/^(?:UTC|GMT)\s?([+-])\s?(\d{1,2})(?::?(\d{2}))?$/);
    if (num) return (num[1] === '-' ? -1 : 1) * (Number(num[2]) + (Number(num[3] || 0) / 60));
    if (z in ZONES) return ZONES[z];
    if (z === 'ET' || z.startsWith('EASTERN')) return usDst(y, m, d) ? -4 : -5;
    if (z === 'PT' || z.startsWith('PACIFIC')) return usDst(y, m, d) ? -7 : -8;
    return null;
  }

  const DATE_RE = new RegExp(
    '(?:(\\d{4})-(\\d{2})-(\\d{2})(?:[T ](\\d{1,2}):(\\d{2}))?\\s*(Z)?)' + // ISO
    '|(?:\\b(' + Object.keys(MONTHS).join('|') + ')[a-z]*\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s*(\\d{4}))?' + // Month D, YYYY
    '(?:[\\s,@(at]*?(\\d{1,2})(?::(\\d{2}))?\\s*([ap]\\.?m\\.?)?)?' + // time
    '(?:\\s*\\(?\\s*((?:UTC|GMT)\\s?[+-]\\s?\\d{1,2}(?::?\\d{2})?|EDT|EST|CDT|CST|MDT|MST|PDT|PST|UTC|GMT|BST|CEST|CET|IST|SGT|HKT|JST|KST|AEST|ET|PT|Eastern(?: Time)?|Pacific(?: Time)?)\\b)?)',
    'gi');

  function parseDates(s, fallbackYear) {
    const out = []; let m; DATE_RE.lastIndex = 0;
    while ((m = DATE_RE.exec(s))) {
      let y, mo, d, hh = 23, mm = 59, zone = null, hasTime = false;
      if (m[1]) { y = +m[1]; mo = +m[2] - 1; d = +m[3]; if (m[4]) { hh = +m[4]; mm = +m[5]; hasTime = true; } zone = m[6] ? 'UTC' : null; }
      else {
        mo = MONTHS[m[7].toLowerCase().slice(0, m[7].toLowerCase().startsWith('sept') ? 4 : 3)]; d = +m[8]; y = m[9] ? +m[9] : fallbackYear;
        if (m[10] && (m[12] || m[11] || m[13])) { hh = +m[10]; mm = m[11] ? +m[11] : 0; hasTime = true;
          const ap = (m[12] || '').toLowerCase().replace(/\./g, ''); if (ap === 'pm' && hh < 12) hh += 12; if (ap === 'am' && hh === 12) hh = 0; }
        zone = m[13] || null;
      }
      if (mo == null || !d || d > 31 || hh > 24) continue;
      const off = zoneOffset(zone, y, mo, d);
      const utc = Date.UTC(y, mo, d, hh, mm) - (off == null ? 0 : off) * 3600e3;
      out.push({ utc, zone, zoneKnown: off != null, hasTime, raw: m[0].trim() });
    }
    return out;
  }

  // ---------- extract ----------
  function extract(text, opts = {}) {
    const now = opts.now || Date.now();
    const year = new Date(now).getUTCFullYear();
    const L = lines(text || '');
    const facts = { deadline: null, exclusions: [], inclusions: [], allCountries: null, standardExceptions: null, rails: {}, ai: null, deliverables: [], prize: null };

    // Deadline: prefer lines with strong keywords; take the last date on the line (end of a period).
    const kw = [/\bdeadline\b/i, /submission period|submissions? (close|due|end)|due (by|on)|ends? on|closes? on|submit by/i];
    outer: for (const re of kw) {
      for (const ln of L) {
        if (!re.test(ln)) continue;
        const ds = parseDates(ln, year).filter(x => x.hasTime || x.zoneKnown || /\d{4}/.test(x.raw));
        if (ds.length) { const best = ds[ds.length - 1]; facts.deadline = { ...best, evidence: clip(ln) }; break outer; }
      }
    }

    // Countries
    const exclTrig = /(not open to|is not open|are not eligible|ineligible|excluding|excluded|exclusion|except(?:ions?)?\b|prohibit|sanctioned|restricted (countries|jurisdictions)|void where)/i;
    for (let i = 0; i < L.length; i++) {
      if (!exclTrig.test(L[i])) continue;
      const windowLines = L.slice(i, i + 3);
      for (const ln of windowLines) {
        let seg = ln.replace(/(laws|treasury|government|department|courts?) of the united states|u\.s\. (treasury|law)|united states law/gi, '');
        const exc = ln.match(/\b(excluding|except(?:ions?)?(?: for)?)\b([\s\S]*)/i);
        if (/\bopen to\b|restricted to|only (available|eligible)/i.test(ln) && !/not open to|is not open/i.test(ln)) {
          if (!exc) continue; // inclusion sentence: handled below
          seg = exc[2];
        }
        for (const [name, aliases] of Object.entries(COUNTRY_ALIASES)) {
          if (aliases.some(a => new RegExp('(^|[^a-z])' + escapeRe(a) + '([^a-z]|$)', 'i').test(seg))) {
            if (!facts.exclusions.some(e => e.country === name)) facts.exclusions.push({ country: name, evidence: clip(ln) });
          }
        }
      }
    }
    for (const ln of L) {
      const m = ln.match(/(?:only open to|open only to|only (?:available|eligible) (?:to|for)|restricted to) (?:legal )?residents? of ([^.;]+)/i);
      if (m) facts.inclusions.push({ list: m[1].split(/\(?\s*\b(?:excluding|except)\b/i)[0], evidence: clip(ln) });
      if (/all countries|worldwide|global(ly)? open|open to (everyone|anyone)/i.test(ln) && !facts.allCountries) facts.allCountries = clip(ln);
      if (/standard exceptions/i.test(ln) && !facts.standardExceptions) facts.standardExceptions = clip(ln);
    }

    // Payout rails: look in lines about prizes/payment/rewards, or that contain a currency token.
    for (const ln of L) {
      const prizeish = /(prize|reward|paid|payout|pay out|payable|payment|bounty|winner|usdc|usdt|usdg|\$)/i.test(ln);
      if (!prizeish) continue;
      for (const [id, r] of Object.entries(RAILS)) if (r.re.test(ln) && !facts.rails[id]) facts.rails[id] = clip(ln);
    }

    // AI policy
    for (const ln of L) {
      if (/(ai[- ]generated|chatgpt|llms?|ai tools?|ai[- ]written|use of ai|fully ai|pure(ly)? ai)[^.]{0,80}(not allowed|prohibited|disqualif|banned|rejected|not accepted|forbidden|will not be)/i.test(ln)
        || /\b(human[- ]only|humans only|only humans|real humans only|no ai)\b/i.test(ln)) { facts.ai = { allowed: false, evidence: clip(ln) }; break; }
      if (/(ai agents?|agents?|ai assistance|ai coding assistants?|coding agent)[^.]{0,60}(allowed|welcome|eligible|can (participate|submit)|permitted|fine)|\bbuilt? (with|using) (the )?(ai|skills)|ai coding assistants/i.test(ln) && !facts.ai) facts.ai = { allowed: true, evidence: clip(ln) };
    }

    // Deliverables
    const D = [
      ['Demo video', /\bvideo\b/i, ln => { const m = ln.match(/(\d+|one|two|three|five)\s*(?:\(\d\)\s*)?(?:to\s*(\d+|three|five)\s*)?minutes?/i); return m ? m[0] : null; }],
      ['Public code repo', /(github|gitlab|bitbucket|repository|repo url)/i],
      ['Open-source license', /open[- ]source licen[cs]e|license file/i],
      ['Post on X / Twitter', /\b(tweet|x thread|post on x|twitter|x post|thread on x)\b/i],
      ['Written description', /\b(text description|short description|write-?up|description)\b/i],
      ['Pitch deck / slides', /\b(slides?|pitch deck|deck)\b/i],
      ['Live demo URL', /\b(deployed|live demo|demo url|hosted)\b/i],
    ];
    for (const [name, re, extra] of D) {
      const ln = (name === 'Demo video' && L.find(l => re.test(l) && /minutes?/i.test(l))) || L.find(l => re.test(l) && /(submit|include|provide|must|required|deliver|should|what to)/i.test(l)) || L.find(l => re.test(l) && name === 'Demo video');
      if (ln) facts.deliverables.push({ name, detail: extra ? extra(ln) : null, evidence: clip(ln) });
    }

    // Prize: largest amount
    let best = null;
    const amtRe = /\$\s?([\d,]+(?:\.\d+)?)\s?(k\b)?|([\d,]+(?:\.\d+)?)\s?(k\s)?\s?(usdc|usdt|usdg|usd|sol)\b/gi; let m;
    while ((m = amtRe.exec(text || ''))) {
      const n = parseFloat((m[1] || m[3]).replace(/,/g, '')) * ((m[2] || m[4]) ? 1000 : 1);
      const cur = m[5] ? m[5].toUpperCase() : 'USD';
      if (!isNaN(n) && (!best || n > best.amount)) best = { amount: n, currency: cur, raw: m[0].trim() };
    }
    facts.prize = best;
    return facts;
  }

  // ---------- judge ----------
  function fmtLocal(utc, tz) {
    try {
      return new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZoneName: 'short' }).format(new Date(utc));
    } catch (e) { return new Date(utc).toISOString(); }
  }
  function countdown(ms) {
    if (ms <= 0) return 'passed';
    const d = Math.floor(ms / 864e5), h = Math.floor((ms % 864e5) / 36e5);
    return d > 0 ? `${d}d ${h}h left` : `${h}h ${Math.floor((ms % 36e5) / 6e4)}m left`;
  }

  function judge(facts, profile, opts = {}) {
    const now = opts.now || Date.now();
    const findings = []; // {level: 'block'|'warn'|'ok', title, detail, evidence}
    const country = profile.country || '';
    const aliases = COUNTRY_ALIASES[country] || [country.toLowerCase()];

    // Deadline
    if (facts.deadline) {
      const left = facts.deadline.utc - now;
      const local = fmtLocal(facts.deadline.utc, profile.timeZone || 'UTC');
      const zoneNote = facts.deadline.zoneKnown ? '' : ' (no time zone stated — assumed UTC)';
      findings.push({ key: 'deadline', level: left <= 0 ? 'block' : left < 48 * 36e5 ? 'warn' : 'ok', title: left <= 0 ? 'Deadline has passed' : `Deadline: ${local}`, detail: countdown(left) + zoneNote, evidence: facts.deadline.evidence });
    } else findings.push({ key: 'deadline', level: 'warn', title: 'No deadline found', detail: 'Read the schedule manually.' });

    // Country
    const hit = facts.exclusions.find(e => e.country === country);
    if (hit) findings.push({ key: 'country', level: 'block', title: `${country} is excluded`, detail: 'The rules list your country among ineligible places.', evidence: hit.evidence });
    else {
      const inc = facts.inclusions.find(i => !aliases.some(a => i.list.toLowerCase().includes(a)));
      if (inc) findings.push({ key: 'country', level: 'block', title: `Only open to: ${clip(inc.list, 60)}`, detail: `${country} is not on the allowed list.`, evidence: inc.evidence });
      else if (facts.exclusions.length) findings.push({ key: 'country', level: 'ok', title: `${country} not on the exclusion list`, detail: 'Excluded: ' + facts.exclusions.map(e => e.country).join(', '), evidence: facts.exclusions[0].evidence });
      else if (facts.standardExceptions || facts.allCountries) findings.push({ key: 'country', level: facts.standardExceptions ? 'warn' : 'ok', title: facts.standardExceptions ? '"Standard exceptions" apply' : 'Open to all countries', detail: facts.standardExceptions ? 'Exclusion list lives in the full rules — paste them for a definite answer.' : '', evidence: facts.standardExceptions || facts.allCountries });
      else findings.push({ key: 'country', level: 'warn', title: 'Eligibility not stated', detail: 'No country rules found in the pasted text.' });
    }

    // Payout
    const found = Object.keys(facts.rails);
    const mine = profile.rails || [];
    if (!found.length) findings.push({ key: 'payout', level: 'warn', title: 'Payout method not stated', detail: 'Ask the organiser how winners are paid before investing time.' });
    else {
      const ok = found.filter(r => mine.includes(r));
      const names = found.map(r => RAILS[r].label).join(', ');
      if (ok.length) findings.push({ key: 'payout', level: 'ok', title: `You can receive: ${ok.map(r => RAILS[r].label).join(', ')}`, detail: `Mentioned: ${names}`, evidence: facts.rails[ok[0]] });
      else findings.push({ key: 'payout', level: 'block', title: 'No payout rail you can receive', detail: `Pays via ${names}; your profile has none of these.`, evidence: facts.rails[found[0]] });
    }

    // AI
    if (facts.ai) {
      if (!facts.ai.allowed) findings.push({ key: 'ai', level: profile.needsAI ? 'block' : 'warn', title: 'AI-generated work restricted', detail: profile.needsAI ? 'You rely on AI help; this entry would be rejected.' : 'Keep the entry human-written.', evidence: facts.ai.evidence });
      else findings.push({ key: 'ai', level: 'ok', title: 'AI assistance allowed', detail: '', evidence: facts.ai.evidence });
    }

    const verdict = findings.some(f => f.level === 'block') ? 'NO-GO' : findings.some(f => f.level === 'warn') ? 'CHECK' : 'GO';
    return { verdict, findings, prize: facts.prize, deliverables: facts.deliverables };
  }

  function analyze(text, profile, opts) { const facts = extract(text, opts); return { facts, ...judge(facts, profile, opts) }; }

  const api = { extract, judge, analyze, RAILS, COUNTRY_ALIASES, parseDates, zoneOffset };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.BountyFit = api;
})(typeof window !== 'undefined' ? window : globalThis);
