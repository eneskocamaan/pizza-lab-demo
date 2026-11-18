(() => {
  const { el, rand, pick, sw, Scatter, regions } = PL;

  const CONES = [
    { id: 'klasik', name: 'Klasik Külah', desc: 'Çıtır gofret', price: 0, base: '#dca560', line: '#b07a3a', rim: '#c98f4c' },
    { id: 'kakao', name: 'Kakaolu Külah', desc: 'Bitter gofret', price: 10, base: '#7a4a2c', line: '#4e2c18', rim: '#5e361f' },
    { id: 'dip', name: 'Çikolata Kaplı', desc: 'Ağzı çikolatalı, şekerli', price: 20, base: '#dca560', line: '#b07a3a', rim: '#c98f4c', dip: true },
  ].map((c) => ({ ...c, vis: sw.icon(`<path d="M-11 -10 L11 -10 L1 14 Q0 16 -1 14Z" fill="${c.base}"/><path d="M-7 -6 L5 8 M0 -10 L7 -2 M-9 0 L-2 8" stroke="${c.line}" stroke-width="1.5"/>${c.dip ? '<path d="M-12 -12 H12 L11 -5 Q8 -2 6 -5 Q3 0 0 -5 Q-3 -1 -6 -5 Q-9 -2 -11 -5Z" fill="#4a2615"/>' : `<rect x="-12" y="-13" width="24" height="5" rx="2.5" fill="${c.rim}"/>`}`) }));

  const FLAVORS = [
    { id: 'vanilya', name: 'Vanilya', c: '#f7ecd0', s: '#3a2a1a' },
    { id: 'cikolata', name: 'Çikolata', c: '#6b3a22', s: '#3a1d10' },
    { id: 'cilek', name: 'Çilek', c: '#f4a6b8', s: '#d9304f' },
    { id: 'fistik', name: 'Antep Fıstığı', c: '#b9d48a', s: '#6a8f2a' },
    { id: 'limon', name: 'Limon', c: '#f6eaa0', s: '#e6c94a' },
    { id: 'karamel', name: 'Karamel', c: '#d9a05a', s: '#9a5a22' },
    { id: 'bogurtlen', name: 'Böğürtlen', c: '#8a4a8f', s: '#4a1f50' },
    { id: 'maras', name: 'Sade Maraş', c: '#fbf8f2', s: null },
  ].map((f) => ({ ...f, price: f.id === 'fistik' ? 55 : 45,
    icon: `<circle cy="-2" r="12" fill="${f.c}"/><path d="M-12 1 Q-9 9 -5 4 Q-1 10 3 4 Q7 10 12 1Z" fill="${f.c}"/><circle cx="-4" cy="-7" r="3" fill="#fff" opacity=".45"/>${f.s ? `<circle cx="3" cy="-3" r="1.1" fill="${f.s}"/><circle cx="-2" cy="2" r="1.1" fill="${f.s}"/><circle cx="5" cy="3" r=".9" fill="${f.s}"/>` : ''}` }));

  const SAUCES = [
    { id: 'cikolata', name: 'Çikolata Sos', desc: 'Sıcak, akışkan', price: 15, c: '#4a2615' },
    { id: 'karamel', name: 'Karamel', desc: 'Tuzlu karamel', price: 15, c: '#c9822f' },
    { id: 'cilek', name: 'Çilek Sos', desc: 'Meyveli', price: 15, c: '#d9304f' },
    { id: 'yok', name: 'Sossuz', desc: 'Sade kalsın', price: 0, c: null },
  ].map((s) => ({ ...s, vis: s.c ? sw.blob(s.c) : sw.none() }));

  const SPR = ['#ff5a8a', '#ffd23f', '#3ec1d3', '#8b5cf6', '#ffffff', '#5ad16a'];
  const DECOR = [
    { id: 'seker', name: 'Renkli Şeker', price: 10, n: 26, minD: 6, scale: 0.7,
      icon: SPR.map((c, i) => `<rect x="${-12 + i * 4}" y="${-8 + (i % 3) * 6}" width="7" height="2.6" rx="1.3" fill="${c}" transform="rotate(${i * 40} ${-9 + i * 4} ${-7 + (i % 3) * 6})"/>`).join(''),
      draw: () => `<rect x="-4" y="-1.3" width="8" height="2.6" rx="1.3" fill="${pick(SPR)}"/>` },
    { id: 'findik', name: 'Fındık', price: 15, n: 9, minD: 12, scale: 0.75, icon: '<path d="M-5 -6 Q2 -9 6 -3 Q8 4 2 7 Q-6 8 -7 1 Q-8 -4 -5 -6Z" fill="#b07a42"/><path d="M-3 -3 Q1 -5 3 -1" stroke="#e0b884" stroke-width="1.2" fill="none"/>' },
    { id: 'parca', name: 'Çikolata Parçası', price: 15, n: 8, minD: 12, scale: 0.75, icon: '<path d="M-7 -5 L6 -7 L8 5 L-6 7Z" fill="#3a1d10"/><path d="M-5 -3 L4 -5" stroke="#6b3a22" stroke-width="1.5"/>' },
    { id: 'santi', name: 'Krem Şanti', price: 15, special: true, icon: '<path d="M-14 8 Q-16 0 -8 -2 Q-12 -9 -2 -10 Q-4 -16 3 -16 Q9 -14 7 -9 Q15 -8 11 -1 Q17 2 14 8Z" fill="#fffaf0" stroke="#e8dccb" stroke-width="1"/>' },
    { id: 'visne', name: 'Vişne', price: 15, special: true, icon: '<circle cy="4" r="9" fill="#c8102e"/><circle cx="-3" cy="1" r="2.6" fill="#fff" opacity=".35"/><path d="M0 -4 Q3 -13 10 -16" stroke="#4a7a2a" stroke-width="2.2" fill="none" stroke-linecap="round"/>' },
    { id: 'gofret', name: 'Gofret Çubuk', price: 10, special: true, icon: '<rect x="-4" y="-15" width="8" height="30" rx="3.5" fill="#d9a25a" transform="rotate(25)"/><path d="M-4 -8 H4 M-4 0 H4 M-4 8 H4" stroke="#a8743a" stroke-width="1.6" transform="rotate(25)"/>' },
  ];

  const defs = CONES.map((c) => `
    <pattern id="dd-wf-${c.id}" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="16" height="16" fill="${c.base}"/><path d="M0 0H16M0 0V16" stroke="${c.line}" stroke-width="3"/>
    </pattern>`).join('')
    + `<linearGradient id="dd-cone-shade" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".3"/><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset=".55" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>`;

  const SCALE = 0.86;
  let L = {}, scatter, cur;

  function coneSvg() {
    const c = CONES.find((x) => x.id === cur.sel.cone) || CONES[0];
    const body = 'M128 236 L272 236 L206 384 Q200 394 194 384 Z';
    let s = `<path d="${body}" fill="url(#dd-wf-${c.id})"/><path d="${body}" fill="url(#dd-cone-shade)"/><rect x="120" y="222" width="160" height="20" rx="9" fill="${c.rim}"/>`;
    if (c.dip) {
      s += '<path d="M118 222 L282 222 L274 258 Q266 272 258 258 Q248 280 236 260 Q224 270 214 260 Q202 284 188 260 Q176 272 166 260 Q154 278 144 260 Q134 270 128 256 Z" fill="#4a2615"/>';
      for (let i = 0; i < 18; i++) {
        const x = rand(128, 272), y = rand(226, 252);
        s += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="6" height="2.4" rx="1.2" fill="${pick(SPR)}" transform="rotate(${rand(0, 180).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`;
      }
    }
    return s;
  }

  function scoopSvg(f) {
    let d = 'M-70 6 C-74 -40 -40 -66 0 -66 C40 -66 74 -40 70 6';
    const n = 9;
    for (let i = 0; i < n; i++) {
      const x1 = 70 - (140 * (i + 1)) / n, xm = 70 - (140 * (i + 0.5)) / n;
      d += ` Q${xm.toFixed(1)} ${i % 2 ? 22 : 17} ${x1.toFixed(1)} 6`;
    }
    d += 'Z';
    let specks = '';
    if (f.s) for (let i = 0; i < 16; i++) specks += `<circle cx="${rand(-54, 54).toFixed(0)}" cy="${rand(-50, 4).toFixed(0)}" r="${rand(1, 2.4).toFixed(1)}" fill="${f.s}" opacity=".75"/>`;
    if (f.id === 'karamel') specks += '<path d="M-40 -20 Q-10 -40 20 -18 T56 -26" stroke="#9a5a22" stroke-width="4" fill="none" opacity=".6" stroke-linecap="round"/>';
    if (f.id === 'maras') specks += '<path d="M-44 -10 Q-20 -30 10 -20 M-30 2 Q0 -12 30 -4" stroke="#e8e0d0" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    return `<path d="${d}" fill="#000" opacity=".18" transform="translate(0 5)"/><path d="${d}" fill="${f.c}"/>${specks}<ellipse cx="-26" cy="-42" rx="18" ry="10" fill="#fff" opacity=".35" transform="rotate(-24 -26 -42)"/>`;
  }

  const posY = (k) => 212 - k * 58;
  const tf = (y) => `translate(200px, ${y}px) scale(${SCALE})`;

  function syncScoops(o = {}) {
    const list = cur.multi.scoops;
    L.scoops.querySelectorAll(':scope > g[data-id]').forEach((g) => {
      if (!list.includes(g.dataset.id)) {
        g.removeAttribute('data-id');
        g.firstChild.classList.remove('drop');
        g.firstChild.classList.add('lift');
        setTimeout(() => g.remove(), 380);
      }
    });
    list.forEach((id, k) => {
      let g = L.scoops.querySelector(`:scope > g[data-id="${id}"]`);
      if (!g) {
        g = el('g', { 'data-id': id, class: 'bg-layer' });
        const inner = el('g', { class: o.instant ? '' : 'drop' });
        inner.innerHTML = scoopSvg(FLAVORS.find((f) => f.id === id));
        inner.addEventListener('animationend', () => inner.classList.remove('drop'));
        g.append(inner);
        g.style.transform = tf(posY(k));
        L.scoops.append(g);
      } else {
        g.style.transform = tf(posY(k));
      }
    });
    const topY = list.length ? posY(list.length - 1) : 236 + 40;
    L.crown.style.transform = tf(topY);
    L.crownSauce.style.opacity = list.length ? 1 : 0;
  }

  function drawSauce(o = {}) {
    const s = SAUCES.find((x) => x.id === cur.sel.sauce);
    L.crownSauce.innerHTML = '';
    if (!s || !s.c) return;
    let d = 'M-68 -12 C-70 -46 -38 -68 0 -68 C38 -68 70 -46 68 -12';
    const n = 7;
    for (let i = 0; i < n; i++) {
      const x1 = 68 - (136 * (i + 1)) / n, xm = 68 - (136 * (i + 0.5)) / n;
      const len = rand(6, 30);
      d += ` Q${(xm + 8).toFixed(1)} -12 ${(xm + 4).toFixed(1)} ${(-12 + len * 0.6).toFixed(1)} Q${xm.toFixed(1)} ${(-12 + len).toFixed(1)} ${(xm - 4).toFixed(1)} ${(-12 + len * 0.6).toFixed(1)} Q${(xm - 8).toFixed(1)} -12 ${x1.toFixed(1)} -12`;
    }
    const g = el('g', { class: o.instant ? '' : 'drip-in' });
    g.append(el('path', { d: d + 'Z', fill: s.c }));
    g.append(el('path', { d: 'M-40 -48 Q-14 -64 18 -60', stroke: '#fff', 'stroke-opacity': 0.3, 'stroke-width': 5, 'stroke-linecap': 'round', fill: 'none' }));
    L.crownSauce.append(g);
  }

  function drawSpecials(o = {}) {
    const d = cur.multi.decor;
    const had = new Set([...L.spec.children].map((c) => c.dataset.id));
    L.spec.innerHTML = '';
    const put = (id, x, y, rot, sc, svgStr) => {
      const g = el('g', { transform: `translate(${x} ${y}) rotate(${rot}) scale(${sc})`, 'data-id': id });
      const inner = el('g', { class: !o.instant && !had.has(id) ? 'piece' : '' });
      inner.innerHTML = svgStr;
      g.append(inner);
      L.spec.append(g);
    };
    const opt = (id) => DECOR.find((x) => x.id === id);
    if (d.includes('gofret')) put('gofret', 34, -66, 0, 2.3, opt('gofret').icon);
    if (d.includes('santi')) put('santi', 0, -72, 0, 2.6, opt('santi').icon);
    if (d.includes('visne')) put('visne', 4, d.includes('santi') ? -126 : -78, 0, 1.9, opt('visne').icon);
  }

  const addDecor = (t, at, o = {}) => {
    if (t.special) return drawSpecials(o);
    scatter.add(t.id, t.draw || (() => t.icon), t.n, null, { minD: t.minD, scale: t.scale, ...o });
  };

  const scene = {
    init(svg, state, o = {}) {
      cur = state;
      svg.innerHTML = `
        <ellipse cx="200" cy="392" rx="40" ry="6" fill="#000" opacity=".35"/>
        <g class="dd-cone"></g>
        <g class="dd-scoops"></g>
        <g class="dd-crown bg-layer"><g class="dd-sauce"></g><g class="dd-tops toppings-layer"></g><g class="dd-spec"></g></g>`;
      const q = (c) => svg.querySelector(c);
      L = { cone: q('.dd-cone'), scoops: q('.dd-scoops'), crown: q('.dd-crown'), crownSauce: q('.dd-sauce'), tops: q('.dd-tops'), spec: q('.dd-spec') };
      L.cone.innerHTML = coneSvg();
      scatter = new Scatter(L.tops, regions.ellipse(48, 18, 0, -36));
      syncScoops({ instant: true });
      drawSauce({ instant: true });
      state.multi.decor.forEach((id) => addDecor(DECOR.find((x) => x.id === id), null, { instant: true }));
    },
    setSingle(stepId, v, state) {
      cur = state;
      if (stepId === 'cone') { L.cone.innerHTML = coneSvg(); PL.fx.puff('#fbe9c8'); }
      if (stepId === 'sauce') drawSauce();
      PL.fx.wobble();
    },
    addMulti(stepId, t, at, state) {
      cur = state;
      if (stepId === 'scoops') syncScoops();
      else addDecor(t, at);
    },
    removeMulti(stepId, t, state) {
      cur = state;
      if (stepId === 'scoops') return syncScoops();
      if (t.special) return drawSpecials();
      scatter.remove(t.id);
    },
    hit: (p) => (p.x > 90 && p.x < 310 && p.y > 0 && p.y < 395 ? p : null),
  };

  PL.register({
    id: 'dondurma',
    brand: 'Dondurma Lab', mark: 'DL', label: 'Dondurma', tagline: 'Top top, kat kat',
    theme: { accent: '#ec4c86', accent2: '#ff9fc2', glow: 'rgba(255,110,170,.18)' },
    board: 'none', spin: false, scale: 0.98, base: 40,
    splash: { t1: 'Dondurmanı', t2: 'top top yığ.', sub: 'Külahı seç, topları diz, sosu dök. Soğuğu biz ayarlıyoruz.' },
    defaults: { cone: 'klasik' },
    showcase: { sel: { cone: 'dip', sauce: 'cikolata' }, multi: { scoops: ['fistik', 'cilek', 'vanilya'], decor: ['seker', 'visne'] } },
    orbit: ['cilek', 'cikolata', 'fistik', 'visne', 'findik', 'limon'],
    nouns: ['Kule', 'Yaz Günü', 'Kutup', 'Rüya', 'Serinlik', 'Şölen'],
    names(s) {
      const sc = s.multi.scoops, pool = [];
      if (sc.length === 3) pool.push('Üç Katlı Kule', 'Gökdelen');
      if (sc.includes('maras')) pool.push('Maraş Usulü');
      if (sc.includes('fistik')) pool.push('Antep Rüyası');
      if (s.multi.decor.includes('visne')) pool.push('Kirazlı Taç');
      if (sc.length === 1) pool.push('Sade Mutluluk');
      return pool;
    },
    steps: [
      { id: 'cone', kind: 'single', label: 'Külah', title: 'Külahını seç', sub: 'Her şey bunun üstüne kurulacak.', hint: 'Külah hazır, sıra toplarda', options: CONES },
      { id: 'scoops', kind: 'multi', label: 'Toplar', title: 'Topları diz', sub: 'Dokun ya da yukarı sürükle. En fazla 3 top.', hint: 'Her top bir öncekinin üstüne oturur', max: 3, unit: 'top', options: FLAVORS },
      { id: 'sauce', kind: 'single', label: 'Sos', title: 'Sosu dök', sub: 'En üst topun üstünden akar.', hint: 'Sos tepeden süzülür', options: SAUCES },
      { id: 'decor', kind: 'multi', label: 'Süsleme', title: 'Süsle', sub: 'Şeker, fındık, belki bir vişne. En fazla 4.', hint: 'Vişne her zaman en tepeye', max: 4, unit: 'süsleme', options: DECOR },
      { id: 'name', kind: 'name', label: 'İsim', title: 'Ona bir isim ver', sub: 'Erimeden önce bir adı olsun.' },
    ],
    bake: { scene: 'frost', msgs: ['Dondurucu soğuyor…', 'Toplar şekilleniyor…', 'Sos dökülüyor…', 'Son dokunuşlar…', 'Erimeden ye!'], meter: { from: 4, to: -18, unit: '°C' } },
    defs,
    scene,
  });
})();
