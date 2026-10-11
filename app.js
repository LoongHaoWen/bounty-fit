(function () {
  const $ = id => document.getElementById(id);
  const KEY = 'bountyfit.profile';
  const DEFAULT = { country: 'China', timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai', rails: ['crypto', 'bank'], needsAI: true };
  let profile;
  try { profile = Object.assign({}, DEFAULT, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { profile = { ...DEFAULT }; }

  // Build profile form
  const countries = Object.keys(BountyFit.COUNTRY_ALIASES).sort();
  $('country').innerHTML = countries.map(c => `<option${c === profile.country ? ' selected' : ''}>${c}</option>`).join('');
  $('timeZone').value = profile.timeZone;
  $('needsAI').checked = !!profile.needsAI;
  $('rails').insertAdjacentHTML('beforeend', Object.entries(BountyFit.RAILS).map(([id, r]) =>
    `<label><input type="checkbox" value="${id}"${profile.rails.includes(id) ? ' checked' : ''}> ${r.label}</label>`).join(''));

  function readProfile() {
    profile = {
      country: $('country').value,
      timeZone: $('timeZone').value.trim() || 'UTC',
      rails: [...document.querySelectorAll('#rails input:checked')].map(i => i.value),
      needsAI: $('needsAI').checked,
    };
    try { new Intl.DateTimeFormat('en', { timeZone: profile.timeZone }); $('timeZone').style.borderColor = ''; }
    catch (e) { $('timeZone').style.borderColor = 'var(--no)'; profile.timeZone = 'UTC'; }
    localStorage.setItem(KEY, JSON.stringify(profile));
    $('saved').textContent = 'Saved ✓ (this browser only)';
  }

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const SUM = { GO: 'You can enter and receive the prize.', CHECK: 'Probably fine — confirm the flagged items.', 'NO-GO': 'Skip this one, or fix a blocker first.' };

  function render() {
    const text = $('rules').value;
    if (!text.trim()) return;
    const r = BountyFit.analyze(text, profile);
    const prize = r.prize ? `${r.prize.currency === 'USD' ? '$' : ''}${r.prize.amount.toLocaleString()}${r.prize.currency !== 'USD' ? ' ' + r.prize.currency : ''}<div class="sum" style="font-size:12px;font-weight:400">top amount found</div>` : '';
    const order = { block: 0, warn: 1, ok: 2 };
    const items = r.findings.slice().sort((a, b) => order[a.level] - order[b.level]).map(f =>
      `<li class="${f.level}"><div class="t">${f.level === 'block' ? '✖' : f.level === 'warn' ? '⚠' : '✔'} ${esc(f.title)}</div>${f.detail ? `<div class="d">${esc(f.detail)}</div>` : ''}${f.evidence ? `<q>“${esc(f.evidence)}”</q>` : ''}</li>`).join('');
    const deliv = r.deliverables.length ? r.deliverables.map(d => `<span class="chip" title="${esc(d.evidence)}">${esc(d.name)}${d.detail ? ' · ' + esc(d.detail) : ''}</span>`).join('') : '<span class="d">None detected</span>';
    $('result').innerHTML = `<div class="verdict ${r.verdict}"><div class="badge">${r.verdict}</div><div class="sum">${SUM[r.verdict]}</div><div class="prize">${prize}</div></div>
      <ul class="findings">${items}</ul><h3>What you'd have to deliver</h3><div class="deliv">${deliv}</div>`;
  }

  $('samples').innerHTML = (window.BOUNTYFIT_SAMPLES || []).map((s, i) => `<button data-i="${i}">${esc(s.name)}</button>`).join(' ');
  $('samples').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; $('rules').value = BOUNTYFIT_SAMPLES[b.dataset.i].text; render(); });
  $('check').addEventListener('click', render);
  $('rules').addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) render(); });
  $('profileBox').addEventListener('change', () => { readProfile(); render(); });
  $('timeZone').addEventListener('input', () => { readProfile(); render(); });
})();
// Deep link for demos: index.html#sample=0
(function () {
  const q = new URLSearchParams(location.hash.slice(1));
  if (q.has('rails')) { const want = q.get('rails').split(',').filter(Boolean); document.querySelectorAll('#rails input').forEach(i => { i.checked = want.includes(i.value); }); }
  if (q.has('country')) document.getElementById('country').value = q.get('country');
  if (q.has('rails') || q.has('country')) document.getElementById('profileBox').dispatchEvent(new Event('change'));
})();
(function () { const m = location.hash.match(/sample=(\d+)/); if (m && window.BOUNTYFIT_SAMPLES && BOUNTYFIT_SAMPLES[m[1]]) { document.getElementById('rules').value = BOUNTYFIT_SAMPLES[m[1]].text; document.getElementById('check').click(); } })();
