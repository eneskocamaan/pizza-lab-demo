(() => {
  const { el, blob, rand, pick, tween, stopTween, sw, Scatter, regions, drizzle } = PL;

  const BASES = [
    { id: 'pirinc', name: 'Suşi Pirinci', desc: 'Sirkeli, yapışkan', price: 0, c: '#f4f1e8', grain: ['#ffffff', '#ebe6d8'], kind: 'grain' },
    { id: 'kinoa', name: 'Kinoa', desc: 'Protein deposu', price: 20, c: '#e6d3a5', grain: ['#d9c08a', '#f2e4c0', '#c9a96e'], kind: 'dot' },
    { id: 'yesil', name: 'Yeşillik', desc: 'Roka, marul, ıspanak', price: 0, c: '#4f8f3c', grain: ['#6db34a', '#3f7a2e', '#8fd06a'], kind: 'leaf' },
    { id: 'soba', name: 'Soba Erişte', desc: 'Karabuğday', price: 25, c: '#9a7448', grain: ['#b08a5a', '#8a6438'], kind: 'noodle' },
  ].map((b) => ({ ...b, vis: sw.color(b.c) }));

  const PROTEINS = [
    { id: 'somon', name: 'Somon', desc: 'Çiğ, küp', price: 90, icon: '<rect x="-9" y="-9" width="18" height="18" rx="3" fill="#f2884b"/><path d="M-7 -3 L7 -6 M-7 3 L7 0 M-7 8 L6 6" stroke="#fcd0ad" stroke-width="1.6"/>' },
    { id: 'tavuk', name: 'Izgara Tavuk', desc: 'Teriyaki soslu', price: 50, icon: '<rect x="-13" y="-6" width="26" height="12" rx="5" fill="#b9773c"/><path d="M-8 -5 l4 10 M0 -5 l4 10 M8 -5 l3 8" stroke="#4a2a0e" stroke-width="2" opacity=".7"/>' },
    { id: 'tofu', name: 'Tofu', desc: 'Çıtır kızarmış', price: 40, icon: '<rect x="-8" y="-8" width="16" height="16" rx="2.5" fill="#f3e3b5" stroke="#d9a85a" stroke-width="2.5"/>' },
    { id: 'karides', name: 'Karides', desc: 'Haşlanmış', price: 80, icon: '<path d="M8 -8 A10 10 0 1 0 8 8" stroke="#f48a6a" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M6 -6 A8 8 0 1 0 6 6" stroke="#ffc2a8" stroke-width="2" fill="none"/><path d="M8 8 l5 4 l1 -6z" fill="#e0603e"/>' },
    { id: 'falafel', name: 'Falafel', desc: 'Nohut köftesi', price: 40, icon: '<circle r="10" fill="#8a5a2a"/><circle cx="-3" cy="-3" r="2" fill="#a8743a"/><circle cx="3" cy="2" r="1.6" fill="#5e8a2e"/><circle cx="-2" cy="4" r="1.4" fill="#6e4420"/>' },
    { id: 'yok', name: 'Proteinsiz', desc: 'Sadece sebze', price: 0, icon: null },
  ].map((p) => ({ ...p, vis: p.icon ? sw.icon(p.icon) : sw.none() }));

  const TOPS = [
    { id: 'avokado', name: 'Avokado', price: 30, n: 7, icon: '<path d="M-14 4 Q0 -16 14 4 Q0 10 -14 4Z" fill="#c6e07a"/><path d="M-14 4 Q0 -16 14 4" stroke="#3f6b22" stroke-width="2.5" fill="none"/><path d="M-9 3 Q0 -9 9 3" stroke="#e6f2b0" stroke-width="2" fill="none" opacity=".7"/>' },
    { id: 'edamame', name: 'Edamame', price: 20, n: 18, minD: 14, icon: '<ellipse cx="-5" rx="4.5" ry="6" fill="#6fbf4a"/><ellipse cx="4" cy="1" rx="4.5" ry="6" fill="#62b03f"/><ellipse cx="-6" cy="-2" rx="1.3" ry="2" fill="#bfe8a0"/>' },
    { id: 'salatalik', name: 'Salatalık', price: 10, n: 10, icon: '<circle r="10" fill="#2f7a2e"/><circle r="8.5" fill="#c9e8a6"/>' + [...Array(6)].map((_, i) => `<ellipse cx="${(Math.cos(i * 1.05) * 4.2).toFixed(1)}" cy="${(Math.sin(i * 1.05) * 4.2).toFixed(1)}" rx="1.3" ry=".8" fill="#f2f8e0"/>`).join('') },
    { id: 'mango', name: 'Mango', price: 25, n: 12, icon: '<rect x="-7" y="-7" width="14" height="14" rx="2.5" fill="#ffb627"/><rect x="-5" y="-5" width="6" height="4" rx="1.5" fill="#ffd36e"/>' },
    { id: 'havuc', name: 'Havuç', price: 10, n: 15, icon: '<rect x="-12" y="-2" width="24" height="4" rx="2" fill="#f08a2c" transform="rotate(-20)"/><rect x="-10" y="3" width="20" height="4" rx="2" fill="#f5a04a" transform="rotate(10)"/>' },
    { id: 'misir', name: 'Mısır', price: 10, n: 12, icon: '<rect x="-9" y="-3" width="6" height="7" rx="2.5" fill="#f6c92f"/><rect x="-2" y="-5" width="6" height="7" rx="2.5" fill="#f9d64e"/><rect x="5" y="-2" width="6" height="7" rx="2.5" fill="#efbd22"/>' },
    { id: 'lahana', name: 'Mor Lahana', price: 10, n: 11, icon: '<path d="M-12 -4 q6 -6 12 0 q6 6 12 0 M-12 3 q6 -6 12 0 q6 6 10 0" stroke="#8e3a8f" stroke-width="2.8" fill="none" stroke-linecap="round"/>' },
    { id: 'turp', name: 'Turp', price: 15, n: 11, icon: '<circle r="9" fill="#e0457a"/><circle r="7.4" fill="#fbf2f4"/><circle r="2" fill="#f7d5df"/>' },
  ];

  const SAUCES = [
    { id: 'soya', name: 'Soya', desc: 'Az tuzlu', price: 0, c: '#3a2416' },
    { id: 'susam', name: 'Susam Zencefil', desc: 'Kremamsı', price: 10, c: '#d9a85a' },
    { id: 'acimayo', name: 'Acı Mayo', desc: 'Sriracha dokunuşu', price: 10, c: '#f08a3c' },
    { id: 'yuzu', name: 'Narenciye', desc: 'Ponzu, yuzu', price: 10, c: '#e8d36a' },
    { id: 'yok', name: 'Sossuz', desc: 'Sade kalsın', price: 0, c: null },
  ].map((s) => ({ ...s, vis: s.c ? sw.blob(s.c) : sw.none() }));

  const defs = `
    <radialGradient id="bw-rim" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#3f5a51"/><stop offset="1" stop-color="#1b2a25"/></radialGradient>
    <radialGradient id="bw-inner" cx="50%" cy="50%" r="50%"><stop offset="80%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".45"/></radialGradient>
    <clipPath id="bw-in"><circle cx="200" cy="200" r="158"/></clipPath>
    <clipPath id="bw-base-anim"><circle cx="200" cy="200" r="0"/></clipPath>`;

  // 6 bölme: 0 = protein, 1..5 = malzemeler
  const SECT = 6;
  const sector = (i) => {
    const a0 = -Math.PI / 2 - Math.PI / SECT + (i * 2 * Math.PI) / SECT;
    return regions.wedge(a0 + 0.08, a0 + (2 * Math.PI) / SECT - 0.08, 44, 140);
  };
  const sectorOf = (p) => {
    let a = Math.atan2(p.y - 200, p.x - 200) + Math.PI / 2 + Math.PI / SECT;
    a = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    return Math.floor(a / ((2 * Math.PI) / SECT));
  };

  let L = {}, scatter, cur, slots = {};

  function drawBase(o = {}) {
    const b = BASES.find((x) => x.id === cur.sel.base);
    const clip = document.querySelector('#bw-base-anim circle');
    stopTween('bw-base');
    if (!b) { L.base.innerHTML = ''; clip.setAttribute('r', 0); return; }
    let s = `<circle cx="200" cy="200" r="160" fill="${b.c}"/>`;
    for (let i = 0; i < 260; i++) {
      const p = PL.randInCircle(158);
      const c = pick(b.grain);
      if (b.kind === 'grain') s += `<ellipse cx="${p.x.toFixed(0)}" cy="${p.y.toFixed(0)}" rx="3.4" ry="1.7" transform="rotate(${rand(0, 180).toFixed(0)} ${p.x.toFixed(0)} ${p.y.toFixed(0)})" fill="${c}"/>`;
      else if (b.kind === 'dot') s += `<circle cx="${p.x.toFixed(0)}" cy="${p.y.toFixed(0)}" r="${rand(1.4, 2.6).toFixed(1)}" fill="${c}"/>`;
      else if (b.kind === 'leaf' && i < 90) s += `<path d="M${p.x.toFixed(0)} ${p.y.toFixed(0)} q8 -12 18 -2 q-8 12 -18 2z" transform="rotate(${rand(0, 360).toFixed(0)} ${p.x.toFixed(0)} ${p.y.toFixed(0)})" fill="${c}"/>`;
      else if (b.kind === 'noodle' && i < 60) s += `<path d="M${p.x.toFixed(0)} ${p.y.toFixed(0)} q10 -8 20 0 t20 0" stroke="${c}" stroke-width="3" fill="none" transform="rotate(${rand(0, 360).toFixed(0)} ${p.x.toFixed(0)} ${p.y.toFixed(0)})"/>`;
    }
    L.base.innerHTML = s;
    if (o.instant) { clip.setAttribute('r', 170); return; }
    clip.setAttribute('r', 0);
    tween('bw-base', 0, 170, 900, (v) => clip.setAttribute('r', v.toFixed(1)));
  }

  function drawProtein(o = {}) {
    scatter.remove('pro');
    const p = PROTEINS.find((x) => x.id === cur.sel.protein);
    if (!p || !p.icon) return;
    const go = () => scatter.add('pro', () => p.icon, 11, null, { region: sector(0), minD: 20, instant: o.instant });
    if (o.instant) go(); else setTimeout(go, 120);
  }

  function drawSauce(o = {}) {
    L.sauce.innerHTML = '';
    const s = SAUCES.find((x) => x.id === cur.sel.sauce);
    if (!s || !s.c) return;
    drizzle(L.sauce, s.c, rand(0, 9), { rx: 130, ry: 130, turns: 7, rotate: rand(0, 180), width: 5, instant: o.instant });
    for (let i = 0; i < 26; i++) {
      const p = PL.randInCircle(60);
      L.sauce.append(el('ellipse', { cx: p.x.toFixed(1), cy: p.y.toFixed(1), rx: 2.4, ry: 1.3, fill: i % 3 ? '#fbf6e8' : '#2a2420', transform: `rotate(${rand(0, 180).toFixed(0)} ${p.x.toFixed(1)} ${p.y.toFixed(1)})` }));
    }
  }

  function freeSlot(pref) {
    const used = new Set(Object.values(slots));
    if (pref && pref > 0 && !used.has(pref)) return pref;
    for (let i = 1; i < SECT; i++) if (!used.has(i)) return i;
    return 1;
  }
  function addTop(t, at, o = {}) {
    const slot = freeSlot(at ? sectorOf(at) : null);
    slots[t.id] = slot;
    scatter.add(t.id, () => t.icon, t.n, null, { region: sector(slot), minD: t.minD || 20, ...o });
  }

  const scene = {
    init(svg, state, o = {}) {
      cur = state; slots = {};
      svg.innerHTML = `
        <circle cx="200" cy="200" r="190" fill="url(#bw-rim)"/>
        <circle cx="200" cy="200" r="190" fill="none" stroke="#5c7a70" stroke-width="2" opacity=".5"/>
        <circle cx="200" cy="200" r="166" fill="#16211d"/>
        <g clip-path="url(#bw-in)"><g clip-path="url(#bw-base-anim)"><g class="bw-base"></g></g></g>
        <g class="bw-top toppings-layer" filter="url(#pieceShadow)"></g>
        <g class="bw-sauce"></g>
        <circle cx="200" cy="200" r="166" fill="url(#bw-inner)" pointer-events="none"/>
        <path d="M80 120 Q120 50 210 36" stroke="#fff" stroke-opacity=".12" stroke-width="8" stroke-linecap="round" fill="none"/>`;
      const q = (c) => svg.querySelector(c);
      L = { base: q('.bw-base'), top: q('.bw-top'), sauce: q('.bw-sauce') };
      scatter = new Scatter(L.top, regions.circle(140));
      drawBase({ instant: true });
      drawProtein({ instant: true });
      state.multi.tops.forEach((id) => addTop(TOPS.find((x) => x.id === id), null, { instant: o.instant }));
      drawSauce({ instant: true });
    },
    setSingle(stepId, v, state) {
      cur = state;
      if (stepId === 'base') { drawBase(); PL.fx.puff('#eaf6dc'); }
      if (stepId === 'protein') drawProtein();
      if (stepId === 'sauce') drawSauce();
      PL.fx.wobble();
    },
    addMulti(stepId, t, at) { addTop(t, at); },
    removeMulti(stepId, t) { delete slots[t.id]; scatter.remove(t.id); },
    hit: (p) => (Math.hypot(p.x - 200, p.y - 200) < 175 ? p : null),
  };

  PL.register({
    id: 'bowl',
    brand: 'Bowl Lab', mark: 'BW', label: 'Bowl', tagline: 'Taze, renkli, dengeli',
    theme: { accent: '#20a46b', accent2: '#7fd49a', glow: 'rgba(60,200,130,.16)' },
    board: 'wood', spin: true, scale: 0.92, base: 210,
    splash: { t1: "Bowl'unu", t2: 'sen oluştur.', sub: 'Tabanı seç, proteini ekle, renkleri diz. Tazeliği biz garantiliyoruz.' },
    defaults: { base: 'pirinc' },
    showcase: { sel: { base: 'pirinc', protein: 'somon', sauce: 'acimayo' }, multi: { tops: ['avokado', 'edamame', 'mango', 'lahana', 'salatalik'] } },
    orbit: ['avokado', 'edamame', 'mango', 'turp', 'salatalik', 'havuc'],
    nouns: ['Bahçe', 'Denge', 'Enerji', 'Tazelik', 'Okyanus', 'Gökkuşağı'],
    names(s) {
      const t = s.multi.tops, pool = [];
      if (s.sel.protein === 'somon') pool.push('Okyanus Kasesi', 'Hawaii Esintisi');
      if (s.sel.protein === 'yok') pool.push('Yeşil Güç');
      if (t.length >= 5) pool.push('Gökkuşağı Kasesi');
      if (t.includes('avokado')) pool.push('Avokado Aşkı');
      if (s.sel.sauce === 'acimayo') pool.push('Acı Dalga');
      return pool;
    },
    steps: [
      { id: 'base', kind: 'single', label: 'Taban', title: 'Tabanı seç', sub: 'Kasenin temeli.', hint: 'Taban kaseyi doldurur', options: BASES },
      { id: 'protein', kind: 'single', label: 'Protein', title: 'Protein ekle', sub: 'Kendi bölmesine yerleşir.', hint: 'Protein üst bölmeye oturur', options: PROTEINS },
      { id: 'tops', kind: 'multi', label: 'Malzeme', title: 'Renkleri diz', sub: 'Her malzeme kendi dilimine. En fazla 5.', hint: 'Sürükle: istediğin dilime bırak', max: 5, unit: 'malzeme', options: TOPS },
      { id: 'sauce', kind: 'single', label: 'Sos', title: 'Sosu gezdir', sub: 'Üstüne susam da serpiyoruz.', hint: 'Sos çizgi çizgi akar', options: SAUCES },
      { id: 'name', kind: 'name', label: 'İsim', title: 'Ona bir isim ver', sub: 'Bu kasenin bir adı olsun.' },
    ],
    bake: { scene: 'fresh', msgs: ['Malzemeler toplanıyor…', 'Sebzeler doğranıyor…', 'Bölmeler diziliyor…', 'Sos gezdiriliyor…', 'Taptaze!'], meter: { from: 0, to: 100, unit: '% tazelik' } },
    defs,
    scene,
  });
})();
