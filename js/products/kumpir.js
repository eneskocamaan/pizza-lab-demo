(() => {
  const { el, blob, rand, sw, Scatter, regions, drizzle } = PL;

  const SIZES = [
    { id: 'mini', name: 'Mini', desc: 'Atıştırmalık', price: 150, scale: 0.74, tag: 'Mini' },
    { id: 'orta', name: 'Orta', desc: 'Tek kişilik doyurucu', price: 190, scale: 0.86, tag: 'Orta boy' },
    { id: 'buyuk', name: 'Büyük', desc: 'Ortaya bile olur', price: 230, scale: 1, tag: 'Büyük boy' },
  ].map((o) => ({ ...o, vis: sw.icon(`<ellipse rx="${(15 * o.scale).toFixed(1)}" ry="${(10 * o.scale).toFixed(1)}" fill="#a06a38"/><ellipse rx="${(11 * o.scale).toFixed(1)}" ry="${(6 * o.scale).toFixed(1)}" fill="#f6dc8a"/>`) }));

  const MASH = [
    { id: 'klasik', name: 'Klasik Harç', desc: 'Tereyağı + kaşar', price: 0, c: '#f6dc8a', strands: '#fbe7a0', n: 14 },
    { id: 'kasar', name: 'Bol Kaşarlı', desc: 'Uzayan peynir', price: 25, c: '#f7cf5c', strands: '#fff0a8', n: 34 },
    { id: 'light', name: 'Light', desc: 'Yoğurtlu, hafif', price: 0, c: '#f5ecd2', strands: '#ffffff', n: 8 },
  ].map((m) => ({ ...m, vis: sw.color(m.c) }));

  const FILL = [
    { id: 'misir', name: 'Mısır', price: 10, n: 12, icon: '<rect x="-9" y="-3" width="6" height="7" rx="2.5" fill="#f6c92f"/><rect x="-2" y="-5" width="6" height="7" rx="2.5" fill="#f9d64e"/><rect x="5" y="-2" width="6" height="7" rx="2.5" fill="#efbd22"/>' },
    { id: 'bezelye', name: 'Bezelye', price: 10, n: 12, icon: '<circle cx="-5" cy="2" r="4.5" fill="#6db33f"/><circle cx="4" cy="-2" r="4.5" fill="#7cc04a"/><circle cx="3" cy="6" r="4" fill="#5ea535"/><circle cx="-6" cy="0" r="1.3" fill="#c5e8a0"/>' },
    { id: 'zeytin', name: 'Zeytin', price: 10, n: 12, icon: '<circle r="6.5" fill="none" stroke="#1f1a1c" stroke-width="4.5"/><circle cx="-2" cy="-3.5" r="1.3" fill="#fff" opacity=".35"/>' },
    { id: 'sosis', name: 'Sosis', price: 20, n: 10, icon: '<circle r="9" fill="#c94a3c"/><circle r="7" fill="#e88a78"/><circle cx="-2" cy="-1" r="1" fill="#c94a3c"/><circle cx="2" cy="2" r="1" fill="#c94a3c"/>' },
    { id: 'tursu', name: 'Turşu', price: 10, n: 10, icon: '<rect x="-11" y="-5" width="22" height="10" rx="5" fill="#7f9b33"/><rect x="-8" y="-2" width="16" height="4" rx="2" fill="#c3d47a"/>' },
    { id: 'rus', name: 'Rus Salatası', price: 15, n: 6, minD: 34, icon: '<path d="M-14 -4 C-12 -12 8 -14 13 -5 C17 4 6 12 -4 11 C-13 10 -16 3 -14 -4Z" fill="#f4efe2"/><circle cx="-5" cy="-2" r="2" fill="#f08a2c"/><circle cx="4" cy="3" r="2" fill="#7cc04a"/><circle cx="3" cy="-5" r="1.8" fill="#f6c92f"/><circle cx="-4" cy="5" r="1.6" fill="#f08a2c"/>' },
    { id: 'lahana', name: 'Kırmızı Lahana', price: 10, n: 8, icon: '<path d="M-12 -4 q6 -6 12 0 q6 6 12 0 M-12 3 q6 -6 12 0 q6 6 10 0 M-10 9 q6 -5 12 0" stroke="#8e3a8f" stroke-width="2.6" fill="none" stroke-linecap="round"/>' },
    { id: 'havuc', name: 'Havuç Tarator', price: 10, n: 8, icon: '<path d="M-12 -5 l20 3 M-10 1 l22 2 M-12 6 l18 -1" stroke="#f08a2c" stroke-width="3" stroke-linecap="round"/><path d="M-8 -2 l14 2" stroke="#f6f0e0" stroke-width="2.4" stroke-linecap="round"/>' },
    { id: 'mantar', name: 'Mantar', price: 15, n: 9, icon: '<path d="M-12 1 C-12 -11 12 -11 12 1 Z" fill="#e2cba6" stroke="#a88a62" stroke-width="1.4"/><path d="M-4 1 L-3 9 Q0 11 3 9 L4 1 Z" fill="#f2e3c8" stroke="#a88a62" stroke-width="1.4"/>' },
    { id: 'jal', name: 'Jalapeño', price: 15, n: 8, icon: '<circle r="8.5" fill="#3d8a2e"/><circle r="6" fill="#cfe7a6"/><circle cx="-2" cy="-1" r="1.2" fill="#f6f1d8"/><circle cx="2" cy="1.5" r="1.2" fill="#f6f1d8"/>' },
  ];

  const SAUCES = [
    { id: 'ketcap', name: 'Ketçap', c: '#c92a1c', price: 0 },
    { id: 'mayo', name: 'Mayonez', c: '#f6efd8', price: 0 },
    { id: 'aci', name: 'Acı Sos', c: '#e0561c', price: 5 },
    { id: 'ranch', name: 'Ranch', c: '#eef1df', price: 10 },
    { id: 'bbq', name: 'BBQ', c: '#5e2412', price: 10 },
  ].map((s) => ({ ...s, icon: `<path d="M-14 4 Q-9 -10 -3 2 T10 -2 T16 -4" stroke="${s.c}" stroke-width="5" fill="none" stroke-linecap="round"/>` }));

  const defs = `
    <linearGradient id="km-foil" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f4f6f8"/><stop offset=".3" stop-color="#b8bec5"/><stop offset=".55" stop-color="#f7f9fa"/><stop offset=".8" stop-color="#a3aab2"/><stop offset="1" stop-color="#e8ebee"/>
    </linearGradient>
    <radialGradient id="km-skin" cx="45%" cy="40%" r="60%"><stop offset="0" stop-color="#b8834c"/><stop offset="1" stop-color="#6e4220"/></radialGradient>`;

  let L = {}, scatter, cur;
  const RX = 128, RY = 58;

  function foil() {
    let d = '';
    const n = 64;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const k = i % 2 ? 1 : 0.94 + rand(-0.02, 0.02);
      d += (i ? 'L' : 'M') + (200 + Math.cos(a) * 192 * k).toFixed(1) + ' ' + (200 + Math.sin(a) * 132 * k).toFixed(1);
    }
    let creases = '';
    for (let i = 0; i < 14; i++) {
      const a = rand(0, Math.PI * 2);
      creases += `<path d="M${(200 + Math.cos(a) * 172).toFixed(0)} ${(200 + Math.sin(a) * 114).toFixed(0)} L${(200 + Math.cos(a + 0.12) * 188).toFixed(0)} ${(200 + Math.sin(a + 0.12) * 128).toFixed(0)}" stroke="#fff" stroke-opacity=".6" stroke-width="1.5"/>`;
    }
    return `<path d="${d}Z" fill="url(#km-foil)" stroke="#8d949b" stroke-width="1"/>${creases}`;
  }

  function drawMash(o = {}) {
    const m = MASH.find((x) => x.id === cur.sel.mash) || MASH[0];
    let s = `<path d="${blob(148, 6, 2.4, 200, 200, 90, 78)}" fill="${m.c}"/>`;
    for (let i = 0; i < 26; i++) {
      const x = 200 + rand(-120, 120), y = 200 + rand(-50, 50);
      if (((x - 200) / 140) ** 2 + ((y - 200) / 70) ** 2 > 1) continue;
      s += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${rand(4, 10).toFixed(1)}" fill="#fff" opacity=".22"/>`;
    }
    for (let i = 0; i < m.n; i++) {
      const x = 200 + rand(-110, 110), y = 200 + rand(-46, 46);
      if (((x - 200) / 130) ** 2 + ((y - 200) / 64) ** 2 > 1) continue;
      s += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} q6 -5 12 0 t12 0" stroke="${m.strands}" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".85"/>`;
    }
    L.mash.innerHTML = s;
    if (!o.instant) { L.mash.classList.remove('mash-pop'); L.mash.getBoundingClientRect(); L.mash.classList.add('mash-pop'); }
  }

  const addFill = (t, at, o = {}) => scatter.add(t.id, () => t.icon, t.n, at, { minD: t.minD || 18, scale: 0.9, spread: 46, ...o });
  function drawSauce(t, idx, o = {}) {
    const g = drizzle(L.sauce, t.c, idx * 1.7 + 0.5, { rx: 136, ry: 64, turns: 7, rotate: rand(-10, 10), width: 5.5, instant: o.instant });
    g.dataset.id = t.id;
  }

  const scene = {
    init(svg, state, o = {}) {
      cur = state;
      svg.innerHTML = `
        <g class="km-foil">${foil()}</g>
        <path d="${blob(168, 4, 1.2, 200, 200, 90, 100)}" fill="url(#km-skin)"/>
        <path d="${blob(156, 3, 5.1, 200, 200, 90, 86)}" fill="#5e3618"/>
        <g class="km-mash"></g>
        <g class="km-top toppings-layer" filter="url(#pieceShadow)"></g>
        <g class="km-sauce"></g>
        <ellipse cx="170" cy="168" rx="70" ry="20" fill="#fff" opacity=".08"/>`;
      const q = (c) => svg.querySelector(c);
      L = { mash: q('.km-mash'), top: q('.km-top'), sauce: q('.km-sauce') };
      scatter = new Scatter(L.top, regions.ellipse(RX, RY));
      drawMash({ instant: true });
      state.multi.fill.forEach((id) => addFill(FILL.find((x) => x.id === id), null, { instant: o.instant }));
      state.multi.sauces.forEach((id, i) => drawSauce(SAUCES.find((x) => x.id === id), i, { instant: true }));
    },
    setSingle(stepId, v, state) {
      cur = state;
      if (stepId === 'mash') { drawMash(); PL.fx.puff('#fff2c4'); }
      PL.fx.wobble();
    },
    addMulti(stepId, t, at, state) {
      if (stepId === 'fill') addFill(t, at);
      else drawSauce(t, state.multi.sauces.length - 1);
    },
    more(stepId, t, at) {
      if (stepId !== 'fill' || scatter.count(t.id) >= t.n * 2) return false;
      addFill({ ...t, n: 4 }, at);
      return true;
    },
    removeMulti(stepId, t) {
      if (stepId === 'fill') return scatter.remove(t.id);
      const g = L.sauce.querySelector(`g[data-id="${t.id}"]`);
      if (g) { g.classList.add('fade-out'); setTimeout(() => g.remove(), 400); }
    },
    hit: (p) => (((p.x - 200) / 175) ** 2 + ((p.y - 200) / 110) ** 2 <= 1 ? p : null),
  };

  PL.register({
    id: 'kumpir',
    brand: 'Kumpir Lab', mark: 'KL', label: 'Kumpir', tagline: 'Harçtan sosa, dolu dolu',
    theme: { accent: '#e88a12', accent2: '#f7c548', glow: 'rgba(240,170,50,.20)' },
    board: 'wood', spin: true, scale: 0.86, base: 0,
    splash: { t1: 'Kumpirini', t2: 'sen doldur.', sub: 'Harcı seç, malzemeyi yığ, sosu gezdir. Patatesi biz közlüyoruz.' },
    defaults: { size: 'orta', mash: 'klasik' },
    showcase: { sel: { size: 'buyuk', mash: 'kasar' }, multi: { fill: ['misir', 'zeytin', 'sosis', 'rus', 'tursu'], sauces: ['ketcap', 'mayo'] } },
    orbit: ['misir', 'sosis', 'zeytin', 'tursu', 'bezelye', 'rus'],
    nouns: ['Şölen', 'Ortaköy', 'Patates', 'Dolu Dolu', 'Klasik', 'Bomba'],
    names(s) {
      const f = s.multi.fill, pool = [];
      if (f.length >= 7) pool.push('Ne Varsa Koy', 'Dolu Dolu');
      if (f.includes('rus') && f.includes('sosis')) pool.push('Ortaköy Klasiği');
      if (s.multi.sauces.includes('aci') || f.includes('jal')) pool.push('Acı Patates');
      if (s.sel.mash === 'kasar') pool.push('Kaşar Şelalesi');
      if (s.sel.mash === 'light') pool.push('Hafif Ama Mutlu');
      return pool;
    },
    steps: [
      { id: 'size', kind: 'single', label: 'Boy', title: 'Patatesini seç', sub: 'Fırında közlenmiş, kocaman.', hint: 'Boy seçtikçe patates büyür', absolute: true, options: SIZES },
      { id: 'mash', kind: 'single', label: 'Harç', title: 'Harcı karıştır', sub: 'Tereyağı ve kaşarla ezilir.', hint: 'Harç patatesin içine dolar', options: MASH },
      { id: 'fill', kind: 'multi', label: 'Malzeme', title: 'Doldur, doldur', sub: 'Dokun ya da yukarı sürükleyip bırak. En fazla 8.', hint: 'Malzemeyi istediğin yere bırak', max: 8, unit: 'malzeme', options: FILL },
      { id: 'sauces', kind: 'multi', label: 'Sos', title: 'Sosu gezdir', sub: 'En fazla 3 sos, çizgi çizgi.', hint: 'Sos üstten çizilerek akar', max: 3, unit: 'sos', options: SAUCES },
      { id: 'name', kind: 'name', label: 'İsim', title: 'Ona bir isim ver', sub: 'Bu kumpirin bir adı olmalı.' },
    ],
    bake: { scene: 'oven', msgs: ['Fırın kızışıyor…', 'Patates közleniyor…', 'Tereyağı eriyor…', 'Kaşar uzuyor…', 'Servise hazır!'], meter: { from: 20, to: 220, unit: '°C' } },
    defs,
    scene,
  });
})();
