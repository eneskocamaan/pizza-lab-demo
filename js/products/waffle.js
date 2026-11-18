(() => {
  const { el, blob, rand, pick, tween, stopTween, sw, Scatter, regions } = PL;

  const DOUGHS = [
    { id: 'klasik', name: 'Belçika', desc: 'Çıtır dış, yumuşak iç', price: 0, ridge: '#eab765', pocket: '#c98a3a', shade: '#a86a26', edge: '#93561e' },
    { id: 'kakao', name: 'Kakaolu', desc: 'Bitter kakao', price: 15, ridge: '#80502f', pocket: '#5a321c', shade: '#3e2213', edge: '#2e170b' },
    { id: 'redv', name: 'Red Velvet', desc: 'Kadife kırmızı', price: 20, ridge: '#c2483f', pocket: '#8e2a26', shade: '#6a1c1a', edge: '#55120f' },
    { id: 'yulaf', name: 'Yulaflı', desc: 'Şekersiz, lifli', price: 15, ridge: '#dcc08a', pocket: '#b8955c', shade: '#957543', edge: '#7a5d33' },
  ].map((d) => ({ ...d, vis: sw.icon(`<rect x="-15" y="-15" width="30" height="30" rx="15" fill="${d.ridge}"/><path d="M-15 -5H15M-15 5H15M-5 -15V15M5 -15V15" stroke="${d.pocket}" stroke-width="4"/><circle r="15" fill="none" stroke="${d.edge}" stroke-width="2.5"/>`) }));

  const SAUCES = [
    { id: 'sutlu', name: 'Sütlü Çikolata', desc: 'Klasik, akışkan', price: 0, c: '#6b3a1e' },
    { id: 'bitter', name: 'Bitter', desc: '%70 kakao', price: 10, c: '#3a1d10' },
    { id: 'beyaz', name: 'Beyaz Çikolata', desc: 'Vanilyalı', price: 10, c: '#f3e6cf' },
    { id: 'findik', name: 'Fındık Kreması', desc: 'Karadeniz fındığı', price: 20, c: '#7a4a26' },
    { id: 'karamel', name: 'Tuzlu Karamel', desc: 'Tatlı-tuzlu', price: 15, c: '#c9822f' },
    { id: 'yok', name: 'Sossuz', desc: 'Sade kalsın', price: 0, c: null },
  ].map((s) => ({ ...s, vis: s.c ? sw.blob(s.c) : sw.none() }));

  const SPR = ['#ff5a8a', '#ffd23f', '#3ec1d3', '#8b5cf6', '#ffffff', '#5ad16a'];
  const FRUITS = [
    { id: 'cilek', name: 'Çilek', price: 25, n: 9, icon: '<path d="M0 -12 C9 -12 12 -2 8 6 C5 11 2 13 0 14 C-2 13 -5 11 -8 6 C-12 -2 -9 -12 0 -12Z" fill="#e3283f"/><path d="M0 -8 C5 -8 7 -2 5 4 C3 8 0 10 0 10 C0 10 -3 8 -5 4 C-7 -2 -5 -8 0 -8Z" fill="#f7a0ab"/><circle cx="-3" cy="0" r=".9" fill="#fff6c0"/><circle cx="3" cy="2" r=".9" fill="#fff6c0"/><circle cx="0" cy="-4" r=".9" fill="#fff6c0"/>' },
    { id: 'muz', name: 'Muz', price: 15, n: 10, icon: '<circle r="11" fill="#efdc94"/><circle r="9" fill="#fbf1c9"/><circle r="2.2" fill="#d8c27a"/><circle cx="0" cy="-5" r=".9" fill="#c8b06a"/><circle cx="4.3" cy="2.5" r=".9" fill="#c8b06a"/><circle cx="-4.3" cy="2.5" r=".9" fill="#c8b06a"/>' },
    { id: 'kivi', name: 'Kivi', price: 20, n: 8, icon: '<circle r="12" fill="#6e5228"/><circle r="10.8" fill="#8fc43c"/><circle r="4.5" fill="#f2f0c8"/>' + [...Array(10)].map((_, i) => `<ellipse cx="${(Math.cos(i * 0.628) * 7).toFixed(1)}" cy="${(Math.sin(i * 0.628) * 7).toFixed(1)}" rx="1.2" ry=".7" fill="#1c1a12"/>`).join('') },
    { id: 'yaban', name: 'Yaban Mersini', price: 25, n: 16, minD: 14, icon: '<circle r="6" fill="#3a3f8f"/><circle cx="-1.8" cy="-1.8" r="1.8" fill="#8a90d9" opacity=".6"/><path d="M-1.5 -5 L0 -6.5 L1.5 -5" stroke="#23265a" stroke-width="1" fill="none"/>' },
    { id: 'bogurtlen', name: 'Böğürtlen', price: 25, n: 9, icon: [[-4, -4], [2, -5], [6, 0], [-5, 3], [1, 2], [-1, 7], [5, 6]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.6" fill="#2d1838"/><circle cx="${x - 1}" cy="${y - 1}" r="1" fill="#8a5aa0" opacity=".7"/>`).join('') },
    { id: 'ananas', name: 'Ananas', price: 20, n: 8, icon: '<path d="M-12 -6 L12 -6 L8 8 L-8 8Z" fill="#f6c935"/><path d="M-10 -6 L-6 8 M0 -6 L0 8 M10 -6 L6 8" stroke="#e0a91c" stroke-width="1.2"/>' },
  ];
  const DECOR = [
    { id: 'findik', name: 'Fındık', price: 15, n: 12, minD: 14, icon: '<path d="M-5 -6 Q2 -9 6 -3 Q8 4 2 7 Q-6 8 -7 1 Q-8 -4 -5 -6Z" fill="#b07a42"/><path d="M-3 -3 Q1 -5 3 -1" stroke="#e0b884" stroke-width="1.2" fill="none"/>' },
    { id: 'fistik', name: 'Antep Fıstığı', price: 25, n: 14, minD: 12, icon: '<path d="M-6 -3 Q0 -8 6 -3 Q4 5 0 6 Q-5 5 -6 -3Z" fill="#7cb342"/><path d="M-3 -2 Q0 -4 3 -2" stroke="#c5e1a5" stroke-width="1.2" fill="none"/>' },
    { id: 'seker', name: 'Renkli Şeker', price: 10, n: 46, minD: 8, scale: 0.8,
      icon: SPR.map((c, i) => `<rect x="${-12 + i * 4}" y="${-8 + (i % 3) * 6}" width="7" height="2.6" rx="1.3" fill="${c}" transform="rotate(${i * 40} ${-9 + i * 4} ${-7 + (i % 3) * 6})"/>`).join(''),
      draw: () => `<rect x="-4" y="-1.3" width="8" height="2.6" rx="1.3" fill="${pick(SPR)}"/>` },
    { id: 'biskuvi', name: 'Bisküvi', price: 15, n: 10, icon: '<path d="M-8 -6 L7 -7 L9 5 L-6 7Z" fill="#d9a85f"/><circle cx="-2" cy="-1" r="1.2" fill="#a8743a"/><circle cx="3" cy="2" r="1.2" fill="#a8743a"/>' },
    { id: 'hindistan', name: 'Hindistan Cevizi', price: 10, n: 22, minD: 10, icon: '<path d="M-8 -2 q4 -3 8 0 M-4 4 q4 -3 8 0 M0 -7 q4 -3 8 0" stroke="#fffaf0" stroke-width="2.4" stroke-linecap="round" fill="none"/>', draw: () => `<path d="M-6 0 q4 -3 ${rand(6, 10).toFixed(1)} 0" stroke="#fffaf0" stroke-width="2.4" stroke-linecap="round" fill="none"/>` },
    { id: 'dondurma', name: 'Dondurma Topu', price: 40, n: 1, big: true, icon: '<circle r="13" fill="#fbf3dc"/><path d="M-13 3 Q-9 9 -5 4 Q-1 10 3 4 Q7 10 13 3" fill="#fbf3dc"/><circle cx="-4" cy="-5" r="3" fill="#fff" opacity=".7"/><circle cx="3" cy="0" r=".8" fill="#3a2a1a"/><circle cx="-2" cy="3" r=".8" fill="#3a2a1a"/>' },
  ];

  const defs = DOUGHS.map((d) => `
    <pattern id="wf-grid-${d.id}" width="30" height="30" patternUnits="userSpaceOnUse" x="5" y="5">
      <rect width="30" height="30" fill="${d.ridge}"/>
      <rect x="6" y="6" width="18" height="18" rx="3" fill="${d.pocket}"/>
      <rect x="6" y="6" width="18" height="6" rx="2.5" fill="${d.shade}" opacity=".7"/>
      <rect x="1" y="1" width="28" height="3" rx="1.5" fill="#fff" opacity=".12"/>
    </pattern>`).join('')
    + `<radialGradient id="wf-shade" cx="50%" cy="50%" r="50%"><stop offset="70%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".35"/></radialGradient>
       <clipPath id="wf-sauce-anim"><circle cx="200" cy="200" r="0"/></clipPath>`;

  let L = {}, scatter, cur;
  const findOpt = (id) => [...FRUITS, ...DECOR].find((x) => x.id === id);

  function drawDough() {
    const d = DOUGHS.find((x) => x.id === cur.sel.dough) || DOUGHS[0];
    L.body.setAttribute('fill', `url(#wf-grid-${d.id})`);
    L.body.setAttribute('d', blob(172, 2, 3.1));
    L.rim.setAttribute('stroke', d.edge);
    L.rim.setAttribute('d', blob(172, 2, 3.1));
    L.cuts.setAttribute('stroke', d.edge);
  }

  function drawSauce(o = {}) {
    const clip = document.querySelector('#wf-sauce-anim circle');
    const s = SAUCES.find((x) => x.id === cur.sel.sauce);
    stopTween('wf-sauce');
    if (!s || !s.c) {
      if (o.instant) { clip.setAttribute('r', 0); L.sauce.innerHTML = ''; return; }
      tween('wf-sauce', +clip.getAttribute('r'), 0, 350, (v) => clip.setAttribute('r', v.toFixed(1)), () => { L.sauce.innerHTML = ''; });
      return;
    }
    const seed = rand(0, 9);
    L.sauce.innerHTML = '';
    L.sauce.append(el('path', { d: blob(116, 14, seed), fill: s.c, opacity: 0.95 }));
    // akan damlalar kenara doğru
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + seed;
      const r1 = 106, r2 = rand(128, 148);
      L.sauce.append(el('path', {
        d: `M${(200 + Math.cos(a - 0.08) * r1).toFixed(1)} ${(200 + Math.sin(a - 0.08) * r1).toFixed(1)} Q${(200 + Math.cos(a) * r2).toFixed(1)} ${(200 + Math.sin(a) * r2).toFixed(1)} ${(200 + Math.cos(a + 0.08) * r1).toFixed(1)} ${(200 + Math.sin(a + 0.08) * r1).toFixed(1)}Z`,
        fill: s.c, opacity: 0.94,
      }));
    }
    L.sauce.append(el('path', { d: `M140 150 Q170 128 210 132`, stroke: '#fff', 'stroke-opacity': 0.22, 'stroke-width': 6, 'stroke-linecap': 'round', fill: 'none' }));
    if (o.instant) { clip.setAttribute('r', 190); return; }
    clip.setAttribute('r', 0);
    tween('wf-sauce', 0, 190, 1000, (v) => clip.setAttribute('r', v.toFixed(1)));
  }

  const add = (t, at, o = {}) => {
    if (t.big) return scatter.add(t.id, () => t.icon, 1, at || { x: 200, y: 200 }, { spread: 0, scale: 2.4, rotate: false, ...o });
    scatter.add(t.id, t.draw || (() => t.icon), t.n, at, { minD: t.minD, scale: t.scale, ...o });
  };

  const scene = {
    init(svg, state, o = {}) {
      cur = state;
      svg.innerHTML = `
        <path class="wf-body"/>
        <circle cx="200" cy="200" r="172" fill="url(#wf-shade)"/>
        <path class="wf-rim" fill="none" stroke-width="7"/>
        <path class="wf-cuts" d="M200 30 V370 M30 200 H370" stroke-width="3" opacity=".45"/>
        <g clip-path="url(#wf-sauce-anim)"><g class="wf-sauce"></g></g>
        <g class="wf-top toppings-layer"></g>
        <circle cx="200" cy="200" r="174" fill="url(#sheen)" pointer-events="none"/>`;
      const q = (c) => svg.querySelector(c);
      L = { body: q('.wf-body'), rim: q('.wf-rim'), cuts: q('.wf-cuts'), sauce: q('.wf-sauce'), top: q('.wf-top') };
      scatter = new Scatter(L.top, regions.circle(140));
      drawDough();
      drawSauce({ instant: true });
      [...state.multi.fruits, ...state.multi.decor].forEach((id) => add(findOpt(id), null, { instant: o.instant }));
    },
    setSingle(stepId, v, state) {
      cur = state;
      if (stepId === 'dough') { drawDough(); PL.fx.puff('#f6e7c8'); PL.fx.wobble(); }
      if (stepId === 'sauce') drawSauce();
    },
    addMulti(stepId, t, at) { add(t, at); },
    more(stepId, t, at) {
      if (t.big || scatter.count(t.id) >= t.n * 2) return false;
      scatter.add(t.id, t.draw || (() => t.icon), Math.max(3, Math.round(t.n / 3)), at, { minD: t.minD, scale: t.scale });
      return true;
    },
    removeMulti(stepId, t) { scatter.remove(t.id); },
    hit: (p) => (Math.hypot(p.x - 200, p.y - 200) < 180 ? p : null),
  };

  PL.register({
    id: 'waffle',
    brand: 'Waffle Lab', mark: 'WL', label: 'Waffle', tagline: 'Sos, meyve, çıtırlık',
    theme: { accent: '#e07a2a', accent2: '#f5b84a', glow: 'rgba(240,160,70,.20)' },
    board: 'plate', spin: true, scale: 0.9, base: 160, defs,
    splash: { t1: "Waffle'ını", t2: 'sen süsle.', sub: 'Hamuru seç, sosu dök, meyveyi diz. Makineyi biz kapatıyoruz.' },
    defaults: { dough: 'klasik' },
    showcase: { sel: { dough: 'klasik', sauce: 'sutlu' }, multi: { fruits: ['cilek', 'muz', 'yaban'], decor: ['findik'] } },
    orbit: ['cilek', 'muz', 'kivi', 'yaban', 'findik', 'bogurtlen'],
    nouns: ['Bulut', 'Bahçe', 'Şölen', 'Rüya', 'Tatlı Kriz', 'Pazar Sabahı'],
    names(s) {
      const f = s.multi.fruits, d = s.multi.decor, pool = [];
      if (f.includes('cilek') && s.sel.sauce === 'sutlu') pool.push('Çilek Aşkı');
      if (s.sel.dough === 'redv') pool.push('Kırmızı Halı');
      if (s.sel.sauce === 'findik') pool.push('Karadeniz Rüzgârı');
      if (d.includes('seker')) pool.push('Doğum Günü Partisi');
      if (d.includes('dondurma')) pool.push('Sıcak-Soğuk');
      if (f.length >= 3) pool.push('Meyve Bahçesi');
      return pool;
    },
    steps: [
      { id: 'dough', kind: 'single', label: 'Hamur', title: 'Hamurunu seç', sub: 'Makineden çıtır çıtır çıkacak.', hint: 'Petek desenine bak', options: DOUGHS },
      { id: 'sauce', kind: 'single', label: 'Sos', title: 'Sosu dök', sub: 'Ortadan kenarlara akıyor.', hint: 'Sos kenarlardan süzülür', options: SAUCES },
      { id: 'fruits', kind: 'multi', label: 'Meyve', title: 'Meyveleri diz', sub: 'Dokun ya da yukarı sürükleyip bırak. En fazla 4.', hint: 'Meyveyi istediğin yere bırak', max: 4, unit: 'meyve', options: FRUITS },
      { id: 'decor', kind: 'multi', label: 'Süsleme', title: 'Son dokunuş', sub: 'Çıtırlık, renk, belki bir top dondurma.', hint: 'Dondurma topu ortaya oturur', max: 4, unit: 'süsleme', options: DECOR },
      { id: 'name', kind: 'name', label: 'İsim', title: 'Ona bir isim ver', sub: 'Tatlının da bir adı olur.' },
    ],
    bake: { scene: 'iron', msgs: ['Makine ısınıyor…', 'Hamur kabarıyor…', 'Petekler çıtırlaşıyor…', 'Kapak açılıyor…', 'Afiyet olsun!'], meter: { from: 20, to: 200, unit: '°C' } },
    scene,
  });
})();
