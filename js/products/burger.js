(() => {
  const { el, rand, sw } = PL;

  const BUNS = [
    { id: 'brioche', name: 'Brioche', desc: 'Tereyağlı, yumuşacık', price: 0, top: '#d98a3a', hi: '#f2b866', bottom: '#c97a30', crumb: '#f7dcae', seed: '#fff3d6' },
    { id: 'patates', name: 'Patatesli', desc: 'Hafif tatlı, puf', price: 0, top: '#e6b45c', hi: '#f8da98', bottom: '#d9a24a', crumb: '#fbe9c2', seed: '#fff8e6' },
    { id: 'siyah', name: 'Siyah', desc: 'Aktif karbonlu', price: 20, top: '#2d2927', hi: '#57504c', bottom: '#24201e', crumb: '#3d3734', seed: '#efe6d6' },
    { id: 'tam', name: 'Tam Buğday', desc: 'Yulaf serpmeli', price: 15, top: '#a26a38', hi: '#c99a62', bottom: '#8e5a2e', crumb: '#e2c597', seed: '#eadcbc' },
  ].map((b) => ({ ...b, vis: sw.blob(b.top) }));

  const PATTIES = [
    { id: 'dana120', name: 'Dana · 120 g', desc: 'Klasik smash', price: 0, c: '#5a3220', d: '#3a1d10', h: 26, count: 1 },
    { id: 'dana180', name: 'Dana · 180 g', desc: 'Kalın ve sulu', price: 45, c: '#5a3220', d: '#3a1d10', h: 36, count: 1 },
    { id: 'double', name: 'Double', desc: '2 × 120 g', price: 80, c: '#5a3220', d: '#3a1d10', h: 24, count: 2 },
    { id: 'tavuk', name: 'Izgara Tavuk', desc: 'Marine göğüs', price: 0, c: '#d9a463', d: '#8a5a2a', h: 24, count: 1, marks: true },
    { id: 'vegan', name: 'Vegan', desc: 'Bezelye proteini', price: 20, c: '#5c4a2c', d: '#33281a', h: 26, count: 1 },
  ].map((p) => ({ ...p, vis: sw.icon(`<rect x="-15" y="-7" width="30" height="14" rx="7" fill="${p.c}"/><path d="M-10 -3 H10" stroke="${p.d}" stroke-width="2" stroke-linecap="round" opacity=".7"/>`) }));

  const CHEESES = [
    { id: 'cheddar', name: 'Cheddar', desc: 'Eriyen klasik', price: 0, c: '#f6a623' },
    { id: 'gouda', name: 'Gouda', desc: 'Yumuşak, kremamsı', price: 15, c: '#f2d06b' },
    { id: 'hellim', name: 'Hellim', desc: 'Izgarada kızarmış', price: 30, c: '#f3ede0', slab: true },
    { id: 'yok', name: 'Peynirsiz', desc: 'Sade kalsın', price: 0, c: null },
  ].map((c) => ({ ...c, vis: c.c ? sw.color(c.c) : sw.none() }));

  // Katman çizimleri: yerel koordinatlar, y=0 katmanın üstü
  const wavy = (x0, x1, y, h, amp, waves, seed) => {
    let d = '';
    const n = waves * 4;
    for (let i = 0; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n;
      d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + (y + Math.sin((i / n) * Math.PI * 2 * waves + seed) * amp).toFixed(1);
    }
    for (let i = n; i >= 0; i--) {
      const x = x0 + ((x1 - x0) * i) / n;
      d += 'L' + x.toFixed(1) + ' ' + (y + h + Math.sin((i / n) * Math.PI * 2 * waves + seed + 1.3) * amp).toFixed(1);
    }
    return d + 'Z';
  };
  const drips = (x0, x1, y, count, minL, maxL, color) => {
    let s = '';
    for (let i = 0; i < count; i++) {
      const x = x0 + ((x1 - x0) * (i + 0.5)) / count + rand(-10, 10);
      const len = rand(minL, maxL);
      s += `<path d="M${(x - 9).toFixed(1)} ${y} Q${(x - 6).toFixed(1)} ${(y + len).toFixed(1)} ${x.toFixed(1)} ${(y + len).toFixed(1)} Q${(x + 6).toFixed(1)} ${(y + len).toFixed(1)} ${(x + 9).toFixed(1)} ${y}Z" fill="${color}"/>`;
    }
    return s;
  };

  const EXTRAS = [
    { id: 'marul', name: 'Marul', price: 10, h: 12, icon: '<path d="M-15 2 Q-12 -8 -6 -4 Q-2 -12 3 -5 Q8 -11 11 -3 Q16 -4 15 4 Q0 9 -15 2Z" fill="#6dbb3c"/><path d="M-12 1 Q0 -3 12 1" stroke="#a6df70" stroke-width="1.5" fill="none"/>',
      draw: () => { const s = rand(0, 6); return `<path d="${wavy(60, 340, 1, 9, 3, 9, s)}" fill="#5aa832"/><path d="${wavy(64, 336, 0, 4, 3, 9, s)}" fill="#8fd35a"/>`; } },
    { id: 'domates', name: 'Domates', price: 10, h: 12, icon: '<circle r="13" fill="#d9342a"/><circle r="10" fill="#f0654c"/><path d="M0 -8V8M-7 -4L7 4M-7 4L7 -4" stroke="#d9342a" stroke-width="1.6"/>',
      draw: () => [74, 202].map((x) => `<rect x="${x}" y="0" width="124" height="12" rx="6" fill="#d9342a"/><rect x="${x + 6}" y="2.5" width="112" height="7" rx="3.5" fill="#f0654c"/>${[24, 52, 80, 104].map((dx) => `<ellipse cx="${x + dx}" cy="6" rx="4" ry="2" fill="#f8c08a"/>`).join('')}`).join('') },
    { id: 'karamel', name: 'Karamelize Soğan', price: 20, h: 9, icon: '<path d="M-14 -2 Q-7 -8 0 -2 T14 -2" stroke="#9a5a22" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M-12 4 Q-5 -2 2 4 T14 4" stroke="#c27a3a" stroke-width="3" fill="none" stroke-linecap="round"/>',
      draw: () => { let s = ''; for (let i = 0; i < 16; i++) { const x = rand(74, 300); s += `<path d="M${x.toFixed(0)} ${rand(1, 6).toFixed(1)} q8 -5 16 0 t16 0" stroke="${i % 2 ? '#9a5a22' : '#c98a42'}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`; } return s; } },
    { id: 'tursu', name: 'Turşu', price: 10, h: 8, icon: '<ellipse rx="14" ry="8" fill="#6f8f2a"/><ellipse rx="10" ry="5" fill="#a8c45a"/><circle cx="-4" r="1.2" fill="#e6efc0"/><circle cx="3" cy="1" r="1.2" fill="#e6efc0"/>',
      draw: () => [95, 148, 200, 252, 305].map((x) => `<ellipse cx="${x}" cy="4" rx="24" ry="5" fill="#6f8f2a"/><ellipse cx="${x}" cy="4" rx="18" ry="2.6" fill="#b2cc62"/>`).join('') },
    { id: 'bacon', name: 'Dana Bacon', price: 35, h: 10, icon: '<path d="M-15 -4 Q-8 -10 0 -4 T15 -4 V4 Q8 10 0 4 T-15 4Z" fill="#a33a26"/><path d="M-14 0 Q-7 -5 0 0 T14 0" stroke="#f0c0a0" stroke-width="2" fill="none"/>',
      draw: () => { const s = rand(0, 6); let fat = ''; for (let i = 0; i <= 40; i++) { const x = 72 + i * 6.4; fat += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + (5 + Math.sin(i / 3.4 + s) * 3).toFixed(1); } return `<path d="${wavy(70, 330, 0, 9, 3, 6, s)}" fill="#a33a26"/><path d="${fat}" stroke="#f0c0a0" stroke-width="2.2" fill="none"/>`; } },
    { id: 'jal', name: 'Jalapeño', price: 15, h: 8, icon: '<circle r="10" fill="#3d8a2e"/><circle r="7" fill="#cfe7a6"/><circle cx="-2" cy="-1" r="1.4" fill="#f6f1d8"/><circle cx="2" cy="2" r="1.4" fill="#f6f1d8"/>',
      draw: () => [92, 136, 180, 224, 268, 310].map((x) => `<ellipse cx="${x}" cy="4" rx="17" ry="4.5" fill="#3d8a2e"/><ellipse cx="${x}" cy="4" rx="11" ry="2.4" fill="#cfe7a6"/>`).join('') },
    { id: 'mantar', name: 'Mantar', price: 20, h: 10, icon: '<path d="M-13 1 C-13 -12 13 -12 13 1 Z" fill="#a8845e"/><path d="M-5 1 L-4 10 Q0 12 4 10 L5 1 Z" fill="#e6d2b0"/>',
      draw: () => [96, 152, 208, 264, 312].map((x) => `<path d="M${x - 24} 9 Q${x - 22} -2 ${x} -1 Q${x + 22} -2 ${x + 24} 9Z" fill="#9a7a5a"/><path d="M${x - 18} 8 Q${x} 1 ${x + 18} 8Z" fill="#dcc6a2"/>`).join('') },
    { id: 'yumurta', name: 'Yumurta', price: 25, h: 14, icon: '<path d="M-15 3 Q-14 -8 -2 -7 Q12 -10 15 0 Q12 9 0 8 Q-14 10 -15 3Z" fill="#fbf8f0"/><circle cx="1" cy="0" r="6" fill="#f6b21a"/><circle cx="-1" cy="-2" r="1.8" fill="#fff" opacity=".6"/>',
      draw: () => '<path d="M76 12 Q84 0 140 3 Q200 -4 262 3 Q318 0 324 12 Q300 18 200 17 Q100 18 76 12Z" fill="#fbf8f0"/><ellipse cx="206" cy="4" rx="30" ry="13" fill="#f6b21a"/><ellipse cx="198" cy="-1" rx="9" ry="4" fill="#fff" opacity=".55"/>' },
    { id: 'halka', name: 'Soğan Halkası', price: 30, h: 16, icon: '<ellipse rx="14" ry="10" fill="#d79a3c" stroke="#b07a2a" stroke-width="1.5"/><ellipse rx="7" ry="4.5" fill="#6a4418"/>',
      draw: () => [124, 200, 276].map((x) => `<ellipse cx="${x}" cy="8" rx="42" ry="9" fill="#d79a3c" stroke="#b07a2a" stroke-width="2"/><ellipse cx="${x}" cy="7" rx="25" ry="3.2" fill="#6a4418"/>`).join('') },
  ];

  const SAUCES = [
    { id: 'ketcap', name: 'Ketçap', c: '#c92a1c' },
    { id: 'mayo', name: 'Mayonez', c: '#f6efd8' },
    { id: 'bbq', name: 'BBQ', c: '#5e2412' },
    { id: 'hardal', name: 'Hardal', c: '#e8b31c' },
    { id: 'burger', name: 'Burger Sos', c: '#f0a27a' },
    { id: 'aci', name: 'Acı Sos', c: '#e0461c' },
  ].map((s) => ({ ...s, price: 5, h: 5,
    icon: `<path d="M-14 2 Q-7 -8 0 0 T14 -2" stroke="${s.c}" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="6" cy="8" r="3" fill="${s.c}"/>`,
    draw: () => `<path d="${wavy(78, 322, 0, 4, 1.5, 8, rand(0, 6))}" fill="${s.c}"/>${drips(84, 316, 3, 5, 5, 12, s.c)}` }));

  function bunBottom(b) {
    return `<path d="M80 2 L320 2 Q327 2 325 10 L319 26 Q315 36 298 36 L102 36 Q85 36 81 26 L75 10 Q73 2 80 2Z" fill="${b.bottom}"/><path d="M80 2 L320 2 Q327 2 325 9 L75 9 Q73 2 80 2Z" fill="${b.crumb}"/>`;
  }
  function bunTop(b) {
    let seeds = '';
    for (let i = 0; i < 22; i++) {
      const x = rand(105, 295), y = rand(14, 66);
      if (((x - 200) / 128) ** 2 + ((y - 84) / 84) ** 2 > 0.82) continue;
      seeds += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="3.4" ry="1.7" transform="rotate(${rand(-50, 50).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${b.seed}"/>`;
    }
    return `<path d="M70 82 Q64 46 112 22 Q160 -2 200 -2 Q240 -2 288 22 Q336 46 330 82 Q330 88 320 88 L80 88 Q70 88 70 82Z" fill="${b.top}"/>
      <path d="M112 34 Q150 8 204 6" stroke="${b.hi}" stroke-width="11" stroke-linecap="round" fill="none" opacity=".55"/>
      <path d="M72 80 Q200 92 328 80 L330 86 Q200 98 70 86Z" fill="${b.crumb}" opacity=".9"/>${seeds}`;
  }
  function pattyLayer(p) {
    let tex = '';
    for (let i = 0; i < 16; i++) tex += `<ellipse cx="${rand(84, 316).toFixed(0)}" cy="${rand(5, p.h - 5).toFixed(1)}" rx="${rand(3, 7).toFixed(1)}" ry="${rand(1.2, 2.6).toFixed(1)}" fill="${p.d}" opacity=".55"/>`;
    let marks = '';
    if (p.marks) for (let x = 100; x < 300; x += 38) marks += `<path d="M${x} 4 l14 ${p.h - 8}" stroke="${p.d}" stroke-width="4" stroke-linecap="round" opacity=".7"/>`;
    return `<rect x="66" y="0" width="268" height="${p.h}" rx="${p.h / 2}" fill="${p.c}"/>${tex}${marks}<path d="M92 5 H308" stroke="#fff" stroke-opacity=".12" stroke-width="3" stroke-linecap="round"/>`;
  }
  function cheeseLayer(c) {
    if (c.slab) {
      let m = '';
      for (let x = 104; x < 300; x += 40) m += `<path d="M${x} 3 l12 9" stroke="#b88a4a" stroke-width="3.5" stroke-linecap="round" opacity=".75"/>`;
      return { h: 14, svg: `<rect x="74" y="0" width="252" height="14" rx="5" fill="${c.c}" stroke="#e2d6bf"/>${m}` };
    }
    return { h: 7, svg: `<rect x="70" y="0" width="260" height="7" rx="2" fill="${c.c}"/>${drips(80, 320, 6, 5, 10, 22, c.c)}` };
  }

  let svg, stackG, shadowG, cur, bounds = { top: 100, bottom: 300 };
  const opt = (list, id) => list.find((x) => x.id === id);

  function desired() {
    const s = cur, out = [];
    const b = opt(BUNS, s.sel.bun) || BUNS[0];
    out.push({ key: 'bunB', h: 36, sig: b.id, html: () => bunBottom(b) });
    const p = opt(PATTIES, s.sel.patty);
    if (p) for (let i = 0; i < p.count; i++) out.push({ key: 'patty' + i, h: p.h, sig: p.id, html: () => pattyLayer(p) });
    const c = opt(CHEESES, s.sel.cheese);
    if (c && c.c) { const cl = cheeseLayer(c); out.push({ key: 'cheese', h: cl.h, sig: c.id, html: () => cl.svg }); }
    s.multi.extras.forEach((id) => { const e = opt(EXTRAS, id); out.push({ key: 'x-' + id, h: e.h, sig: id, html: e.draw }); });
    s.multi.sauces.forEach((id) => { const e = opt(SAUCES, id); out.push({ key: 's-' + id, h: e.h, sig: id, html: e.draw }); });
    out.push({ key: 'bunT', h: 84, sig: b.id, html: () => bunTop(b) });
    return out;
  }

  function sync(o = {}) {
    const want = desired();
    const keys = new Set(want.map((w) => w.key));
    stackG.querySelectorAll(':scope > g[data-k]').forEach((g) => {
      if (!keys.has(g.dataset.k)) {
        g.removeAttribute('data-k');
        const inner = g.firstChild;
        inner.classList.remove('drop');
        inner.classList.add('lift');
        setTimeout(() => g.remove(), 380);
      }
    });
    // yerleşim
    const overlap = 2;
    const total = want.reduce((a, w) => a + w.h - overlap, 0);
    let y = Math.min(368, 200 + total / 2);
    bounds.bottom = y;
    shadowG.style.transform = `translateY(${y.toFixed(1)}px)`;
    want.forEach((w, i) => {
      y -= w.h - overlap;
      let g = stackG.querySelector(`:scope > g[data-k="${w.key}"]`);
      if (!g) {
        g = el('g', { 'data-k': w.key, class: 'bg-layer' });
        const inner = el('g', { class: o.instant ? '' : 'drop' });
        inner.innerHTML = w.html();
        inner.addEventListener('animationend', () => inner.classList.remove('drop', 'pop'));
        g.append(inner);
        g.dataset.sig = w.sig;
        g.style.transform = `translateY(${y.toFixed(1)}px)`;
        // doğru sıraya yerleştir (var olanları taşımadan)
        let next = null;
        for (let j = i + 1; j < want.length && !next; j++) next = stackG.querySelector(`:scope > g[data-k="${want[j].key}"]`);
        stackG.insertBefore(g, next);
      } else {
        if (g.dataset.sig !== w.sig) {
          g.dataset.sig = w.sig;
          g.firstChild.innerHTML = w.html();
          g.firstChild.classList.remove('pop');
          g.firstChild.getBoundingClientRect();
          g.firstChild.classList.add('pop');
        }
        g.style.transform = `translateY(${y.toFixed(1)}px)`;
      }
    });
    bounds.top = y;
  }

  const scene = {
    init(s, state, o = {}) {
      svg = s; cur = state;
      svg.innerHTML = '<g class="bg-shadow"><ellipse cx="200" cy="6" rx="150" ry="13" fill="#000" opacity=".4"/></g><g class="bg-stack"></g>';
      stackG = svg.querySelector('.bg-stack');
      shadowG = svg.querySelector('.bg-shadow');
      sync({ instant: true });
    },
    setSingle(stepId, v, state) { cur = state; sync(); PL.fx.wobble(); },
    addMulti(stepId, t, at, state) { cur = state; sync(); },
    removeMulti(stepId, t, state) { cur = state; sync(); },
    hit: (p) => (p.x > 50 && p.x < 350 && p.y > bounds.top - 50 && p.y < bounds.bottom + 30 ? p : null),
  };

  PL.register({
    id: 'burger',
    brand: 'Burger Lab', mark: 'BL', label: 'Burger', tagline: 'Kat kat, senin kurgun',
    theme: { accent: '#f26b1d', accent2: '#ffb020', glow: 'rgba(255,150,40,.20)' },
    board: 'none', spin: false, scale: 0.98, base: 230,
    splash: { t1: 'Burgerini', t2: 'kat kat kur.', sub: 'Ekmekten sosa her katı sen seç. Izgarayı biz yakıyoruz.' },
    defaults: { bun: 'brioche', patty: 'dana120' },
    showcase: { sel: { bun: 'brioche', patty: 'double', cheese: 'cheddar' }, multi: { extras: ['marul', 'domates', 'bacon'], sauces: ['burger'] } },
    orbit: ['marul', 'domates', 'tursu', 'halka', 'jal', 'yumurta'],
    nouns: ['Kule', 'Canavar', 'Klasik', 'Bomba', 'Şef', 'Efsane'],
    names(s) {
      const x = s.multi.extras, pool = [];
      if (s.sel.patty === 'double') pool.push('Çift Katlı Canavar', 'Double Trouble');
      if (s.sel.bun === 'siyah') pool.push('Kara Şövalye');
      if (x.includes('jal') || s.multi.sauces.includes('aci')) pool.push('Ateş Hattı');
      if (x.includes('bacon')) pool.push('Bacon Sevdası');
      if (x.includes('yumurta')) pool.push('Sabah Kahramanı');
      if (s.sel.cheese === 'hellim') pool.push('Hellim Rüyası');
      if (x.length >= 5) pool.push('Gökdelen');
      return pool;
    },
    steps: [
      { id: 'bun', kind: 'single', label: 'Ekmek', title: 'Ekmeğini seç', sub: 'Her şeyi bir arada tutacak kahraman.', hint: 'Alt ve üst ekmek birlikte değişir', options: BUNS },
      { id: 'patty', kind: 'single', label: 'Köfte', title: 'Köfte zamanı', sub: 'Izgarada mühürlenmiş, sulu.', hint: 'Double seçersen kule yükselir', options: PATTIES },
      { id: 'cheese', kind: 'single', label: 'Peynir', title: 'Peynir ekle', sub: 'Köftenin üstünde erisin.', hint: 'Cheddar damlayarak erir', options: CHEESES },
      { id: 'extras', kind: 'multi', label: 'Malzeme', title: 'Katları diz', sub: 'Dokun ya da yukarı sürükleyip burgere bırak. En fazla 6.', hint: 'Her malzeme yeni bir kat olur', max: 6, unit: 'malzeme', options: EXTRAS },
      { id: 'sauces', kind: 'multi', label: 'Sos', title: 'Sosla', sub: 'En fazla 3 sos. Damla damla akar.', hint: 'Sos üst ekmeğin altına sürülür', max: 3, unit: 'sos', options: SAUCES },
      { id: 'name', kind: 'name', label: 'İsim', title: 'Ona bir isim ver', sub: 'Her efsanenin bir adı olur.' },
    ],
    bake: { scene: 'grill', msgs: ['Izgara kızışıyor…', 'Köfte cızırdıyor…', 'Peynir eriyor…', 'Ekmekler ısınıyor…', 'Servise hazır!'], meter: { from: 20, to: 230, unit: '°C' } },
    scene,
  });
})();
