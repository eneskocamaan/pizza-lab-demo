(() => {
  const { el, blob, rand, pick, randInCircle, tween, stopTween, sw, Scatter } = PL;

  const SIZES = [
    { id: 'S', name: 'Küçük · 26 cm', desc: 'Tek kişilik', price: 190, scale: 0.76, tag: '26 cm' },
    { id: 'M', name: 'Orta · 32 cm', desc: 'Paylaşmalık (belki)', price: 250, scale: 0.88, tag: '32 cm' },
    { id: 'L', name: 'Büyük · 38 cm', desc: 'Kalabalık masa', price: 320, scale: 1, tag: '38 cm' },
  ].map((o) => ({ ...o, vis: sw.size(o.scale) }));

  const DOUGHS = [
    { id: 'klasik', name: 'Klasik', desc: '48 saat mayalı', price: 0, rim: ['#f6cf86', '#dda04b', '#a5602a'], base: '#f1d7a3', inner: 162 },
    { id: 'ince', name: 'İncecik', desc: 'Çıtır, Roma usulü', price: 0, rim: ['#f8dca0', '#e6b66a', '#b8783a'], base: '#f4dfb2', inner: 174 },
    { id: 'tam', name: 'Tam Buğday', desc: 'Fındıksı aroma', price: 20, rim: ['#d1a26a', '#a06d3b', '#6b4222'], base: '#d9b88c', inner: 162 },
    { id: 'komur', name: 'Kömür', desc: 'Simsiyah, aktif karbon', price: 35, rim: ['#5a524d', '#34302d', '#191615'], base: '#433b37', inner: 164 },
  ].map((d) => ({ ...d, vis: sw.ring(d.rim[0], d.rim[1], d.rim[2], d.base) }));

  const SAUCES = [
    { id: 'domates', name: 'San Marzano', desc: 'Klasik domates', price: 0, color: '#cf3a22', fleck: '#7d1a0c' },
    { id: 'pesto', name: 'Pesto', desc: 'Fesleğen, çam fıstığı', price: 20, color: '#5c8f2c', fleck: '#2a5212' },
    { id: 'beyaz', name: 'Beyaz Sos', desc: 'Kremalı, sarımsaklı', price: 15, color: '#efe2c6', fleck: '#b9a37a' },
    { id: 'bbq', name: 'Füme BBQ', desc: 'Tatlı ve isli', price: 15, color: '#6e2716', fleck: '#3b120a' },
    { id: 'yok', name: 'Sossuz', desc: 'Sade kalsın', price: 0, color: null },
  ].map((s) => ({ ...s, vis: s.color ? sw.blob(s.color) : sw.none() }));

  const CHEESES = [
    { id: 'mozz', name: 'Mozzarella', desc: 'Fior di latte', price: 0, colors: ['#fbf4df', '#f3e6c4'] },
    { id: 'ched', name: 'Cheddar', desc: 'Olgun, keskin', price: 20, colors: ['#f7b941', '#eaa22a'] },
    { id: 'mix', name: '4 Peynir', desc: 'Gorgonzola dahil', price: 35, colors: ['#fbf4df', '#f7b941', '#e9e3cf', '#d6dcc2'] },
    { id: 'vegan', name: 'Vegan', desc: 'Kaju bazlı', price: 25, colors: ['#f2e4ae', '#e8d692'] },
    { id: 'yok', name: 'Peynirsiz', desc: 'Hafif olsun', price: 0, colors: null },
  ].map((c) => ({ ...c, vis: c.colors ? sw.dots(c.colors[0], c.colors[1]) : sw.none() }));

  const TOPPINGS = [
    { id: 'pep', name: 'Pepperoni', price: 30, n: 8, icon: '<circle r="15" fill="#b8321f"/><circle r="12.5" fill="#d0452c"/><circle cx="-4" cy="-3" r="1.8" fill="#8a2112"/><circle cx="5" cy="2" r="1.5" fill="#8a2112"/><circle cx="-1" cy="6" r="1.4" fill="#8a2112"/><ellipse cx="-4" cy="-6" rx="5" ry="2.2" fill="#fff" opacity=".18"/>' },
    { id: 'suc', name: 'Sucuk', price: 35, n: 9, icon: '<circle r="12" fill="#6e1f15"/><circle r="10" fill="#9a2c1d"/><circle cx="-3" cy="-2" r="1.6" fill="#f3d9c4"/><circle cx="4" cy="3" r="1.3" fill="#f3d9c4"/><circle cx="2" cy="-5" r="1.1" fill="#f3d9c4"/><circle cx="-4" cy="5" r="1" fill="#f3d9c4"/>' },
    { id: 'mant', name: 'Mantar', price: 25, n: 9, icon: '<path d="M-13 1 C-13 -12 13 -12 13 1 Z" fill="#e7d3b2" stroke="#a88a62" stroke-width="1.5"/><path d="M-5 1 L-4 11 Q0 13 4 11 L5 1 Z" fill="#f2e3c8" stroke="#a88a62" stroke-width="1.5"/><path d="M-8 -3 Q0 -7 8 -3" stroke="#c4a87f" fill="none" stroke-width="1.2"/>' },
    { id: 'zeyt', name: 'Zeytin', price: 20, n: 11, icon: '<circle r="7" fill="none" stroke="#1f1a1c" stroke-width="5"/><circle cx="-2.5" cy="-4" r="1.4" fill="#fff" opacity=".35"/>' },
    { id: 'biber', name: 'Yeşil Biber', price: 15, n: 8, icon: '<path d="M-12 4 Q-8 -10 10 -6" fill="none" stroke="#2f9446" stroke-width="5" stroke-linecap="round"/><path d="M-11 3 Q-7 -8 9 -5" fill="none" stroke="#7fd08a" stroke-width="1.4" stroke-linecap="round"/>' },
    { id: 'sogan', name: 'Mor Soğan', price: 15, n: 7, icon: '<path d="M-12 6 A13 13 0 0 1 12 -4" fill="none" stroke="#9b5cb4" stroke-width="3" stroke-linecap="round"/><path d="M-8 6 A9 9 0 0 1 8 -1" fill="none" stroke="#d3a8e0" stroke-width="2.4" stroke-linecap="round"/>' },
    { id: 'misir', name: 'Mısır', price: 15, n: 10, icon: '<rect x="-9" y="-3" width="6" height="7" rx="2.5" fill="#f6c92f"/><rect x="-2" y="-5" width="6" height="7" rx="2.5" fill="#f9d64e"/><rect x="5" y="-2" width="6" height="7" rx="2.5" fill="#efbd22"/>' },
    { id: 'jal', name: 'Jalapeño', price: 20, n: 7, icon: '<circle r="9" fill="#3d8a2e"/><circle r="6.5" fill="#cfe7a6"/><circle cx="-2" cy="-1" r="1.3" fill="#f6f1d8"/><circle cx="2" cy="1.5" r="1.3" fill="#f6f1d8"/><circle cx="0" cy="-3.2" r="1.1" fill="#f6f1d8"/>' },
    { id: 'cherry', name: 'Cherry Domates', price: 20, n: 8, icon: '<circle r="10" fill="#e2412b"/><circle r="7.5" fill="#f1735a"/><path d="M0 -7 V7 M-6 -3.5 L6 3.5 M-6 3.5 L6 -3.5" stroke="#e2412b" stroke-width="1.6"/><circle r="2" fill="#f6d1a8"/>' },
    { id: 'feslegen', name: 'Fesleğen', price: 15, n: 6, icon: '<path d="M0 -14 C10 -8 10 8 0 14 C-10 8 -10 -8 0 -14 Z" fill="#2f8f3a"/><path d="M0 -12 V12" stroke="#6fcf74" stroke-width="1.4"/>' },
  ];

  const defs = DOUGHS.map((d) => `
    <radialGradient id="pz-crust-${d.id}" cx="50%" cy="50%" r="50%">
      <stop offset="78%" stop-color="${d.rim[0]}"/><stop offset="86%" stop-color="${d.rim[1]}"/><stop offset="93%" stop-color="${d.rim[2]}"/>
    </radialGradient>
    <clipPath id="pz-clip-${d.id}"><circle cx="200" cy="200" r="${d.inner - 3}"/></clipPath>`).join('')
    + '<clipPath id="pz-sauce-anim"><circle cx="200" cy="200" r="0"/></clipPath>';

  let L = {}, scatter, cur;
  const dough = () => DOUGHS.find((d) => d.id === cur.sel.dough) || DOUGHS[0];
  const inner = () => dough().inner;

  function drawDough() {
    const d = dough();
    L.crust.setAttribute('d', blob(186, 3.5, 1.7));
    L.crust.setAttribute('fill', `url(#pz-crust-${d.id})`);
    L.base.setAttribute('d', blob(d.inner, 2.2, 4.1));
    L.base.setAttribute('fill', d.base);
    L.cheeseWrap.setAttribute('clip-path', `url(#pz-clip-${d.id})`);
    L.spots.innerHTML = '';
    for (let i = 0; i < 24; i++) {
      const a = rand(0, Math.PI * 2);
      const rr = rand(d.inner + 5, 181);
      const x = 200 + Math.cos(a) * rr, y = 200 + Math.sin(a) * rr;
      L.spots.append(el('ellipse', {
        cx: x.toFixed(1), cy: y.toFixed(1), rx: rand(2, 6).toFixed(1), ry: rand(1.5, 3.2).toFixed(1),
        transform: `rotate(${((a * 180) / Math.PI + 90).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})`,
        fill: d.rim[2], opacity: rand(0.25, 0.55).toFixed(2),
      }));
    }
  }

  function drawSauce(o = {}) {
    const clip = document.querySelector('#pz-sauce-anim circle');
    const s = SAUCES.find((x) => x.id === cur.sel.sauce);
    const R = inner() - 7;
    stopTween('pz-sauce');
    if (!s || !s.color) {
      if (o.instant) { clip.setAttribute('r', 0); L.sauce.innerHTML = ''; return; }
      tween('pz-sauce', +clip.getAttribute('r'), 0, 350, (v) => clip.setAttribute('r', v.toFixed(1)), () => { L.sauce.innerHTML = ''; });
      return;
    }
    L.sauce.innerHTML = '';
    L.sauce.append(el('path', { d: blob(R, 3, 7.3), fill: s.color }));
    L.sauce.append(el('path', { d: blob(R * 0.62, 7, 2.2), fill: '#fff', opacity: 0.06 }));
    for (let i = 0; i < 50; i++) {
      const p = randInCircle(R - 6);
      L.sauce.append(el('circle', { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: rand(0.8, 2.2).toFixed(1), fill: s.fleck, opacity: rand(0.3, 0.7).toFixed(2) }));
    }
    if (o.instant) { clip.setAttribute('r', R + 6); return; }
    clip.setAttribute('r', 0);
    tween('pz-sauce', 0, R + 6, 950, (v) => clip.setAttribute('r', v.toFixed(1)));
  }

  function drawCheese(o = {}) {
    const c = CHEESES.find((x) => x.id === cur.sel.cheese);
    L.cheese.innerHTML = '';
    if (!c || !c.colors) return;
    const R = inner() - 24;
    for (let i = 0; i < 40; i++) {
      const p = randInCircle(R);
      const n = el('circle', { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: rand(12, 24).toFixed(1), fill: pick(c.colors), class: 'cheese-bit' });
      if (o.instant) n.style.animation = 'none';
      else n.style.animationDelay = i * 20 + 'ms';
      L.cheese.append(n);
    }
  }

  const scene = {
    init(svg, state, o = {}) {
      cur = state;
      svg.innerHTML = `
        <path class="pz-crust"/><g class="pz-spots"></g><path class="pz-base"/>
        <g clip-path="url(#pz-sauce-anim)"><g class="pz-sauce"></g></g>
        <g class="pz-cheese-wrap"><g class="pz-cheese" filter="url(#melt)"></g></g>
        <g class="pz-top toppings-layer"></g>
        <circle cx="200" cy="200" r="186" fill="url(#sheen)" pointer-events="none"/>`;
      const q = (c) => svg.querySelector(c);
      L = { crust: q('.pz-crust'), spots: q('.pz-spots'), base: q('.pz-base'), sauce: q('.pz-sauce'), cheeseWrap: q('.pz-cheese-wrap'), cheese: q('.pz-cheese'), top: q('.pz-top') };
      scatter = new Scatter(L.top, { rand: () => randInCircle(inner() - 24), contains: (p) => Math.hypot(p.x - 200, p.y - 200) <= inner() - 24 });
      drawDough();
      drawSauce({ instant: true });
      drawCheese(o);
      state.multi.toppings.forEach((id) => {
        const t = TOPPINGS.find((x) => x.id === id);
        scatter.add(id, () => t.icon, t.n, null, { instant: o.instant });
      });
    },
    setSingle(stepId, v, state) {
      cur = state;
      if (stepId === 'size') PL.fx.wobble();
      if (stepId === 'dough') {
        drawDough();
        PL.fx.puff('#fff8ec');
        PL.fx.wobble();
        if (state.sel.sauce) drawSauce();
        if (state.sel.cheese) drawCheese();
      }
      if (stepId === 'sauce') drawSauce();
      if (stepId === 'cheese') drawCheese();
    },
    addMulti(stepId, t, at) { scatter.add(t.id, () => t.icon, t.n, at); },
    more(stepId, t, at) {
      if (scatter.count(t.id) >= t.n * 2) return false;
      scatter.add(t.id, () => t.icon, 3, at);
      return true;
    },
    removeMulti(stepId, t) { scatter.remove(t.id); },
    hit: (p) => (Math.hypot(p.x - 200, p.y - 200) < inner() + 14 ? p : null),
  };

  PL.register({
    id: 'pizza',
    brand: 'Pizza Lab', mark: 'PL', label: 'Pizza', tagline: 'Hamurdan malzemeye',
    theme: { accent: '#ff5a36', accent2: '#ff8a3d', glow: 'rgba(255,120,50,.20)' },
    board: 'wood', spin: true, scale: 0.88, base: 0, defs,
    splash: { t1: 'Pizzanı', t2: 'sen tasarla.', sub: 'Hamurdan malzemeye her şey senin elinde. Fırını biz yakıyoruz.' },
    defaults: { size: 'M', dough: 'klasik' },
    showcase: { sel: { size: 'L', dough: 'klasik', sauce: 'domates', cheese: 'mozz' }, multi: { toppings: ['pep', 'feslegen', 'zeyt'] } },
    orbit: ['pep', 'mant', 'cherry', 'biber', 'feslegen', 'jal'],
    nouns: ['Volkan', 'Fırtına', 'Klasik', 'Rüya', 'Usta', 'Pazar Keyfi'],
    names(s) {
      const t = s.multi.toppings, pool = [];
      if (t.includes('jal')) pool.push('Ateş Topu', 'Acı Gerçek');
      if (s.sel.dough === 'komur') pool.push('Kara Elmas', 'Gece Yarısı');
      if (s.sel.sauce === 'pesto') pool.push('Yeşil Rüya');
      if (t.includes('suc')) pool.push('Sucuk Sevdası');
      if (t.includes('mant')) pool.push('Orman Gizemi');
      if (s.sel.cheese === 'mix') pool.push('Peynir Şelalesi');
      if (t.length >= 5) pool.push('Ne Varsa Koy');
      return pool;
    },
    steps: [
      { id: 'size', kind: 'single', label: 'Boyut', title: 'Ne kadar acıktın?', sub: 'Boyutu seç. Sonradan her şeyi değiştirebilirsin.', hint: 'Boyut seçtikçe pizza büyür', absolute: true, options: SIZES },
      { id: 'dough', kind: 'single', label: 'Hamur', title: 'Hamurunu seç', sub: 'İyi pizza iyi hamurla başlar.', hint: 'Kenarlara bak, her hamur farklı pişer', options: DOUGHS },
      { id: 'sauce', kind: 'single', label: 'Sos', title: 'Sosu yay', sub: 'Kepçe bizde, sen sadece seç.', hint: 'Sos ortadan kenarlara yayılır', options: SAUCES },
      { id: 'cheese', kind: 'single', label: 'Peynir', title: 'Peynir yağmuru', sub: 'Fırında eriyip birbirine karışacak.', hint: 'Rende hazır', options: CHEESES },
      { id: 'toppings', kind: 'multi', label: 'Malzeme', title: 'Üstüne ne koyalım?', sub: 'Dokun ya da yukarı sürükleyip pizzaya bırak. En fazla 6.', hint: 'Malzemeyi sürükle, istediğin yere bırak', max: 6, unit: 'malzeme', options: TOPPINGS },
      { id: 'name', kind: 'name', label: 'İsim', title: 'Ona bir isim ver', sub: 'Her başyapıtın bir adı olur.' },
    ],
    bake: { scene: 'oven', msgs: ['Odun ateşi harlanıyor…', 'Hamur kabarıyor…', 'Peynir eriyor…', 'Kenarlar kızarıyor…', 'Son bir tur…'], meter: { from: 20, to: 450, unit: '°C' }, effect: 'baked' },
    onBakeClone(c) {
      const char = el('g', { class: 'char' });
      for (let i = 0; i < 18; i++) {
        const p = randInCircle(inner() - 14);
        char.append(el('circle', { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: rand(3, 9).toFixed(1), fill: '#8a4b17', opacity: rand(0.12, 0.28).toFixed(2) }));
      }
      const top = c.querySelector('.toppings-layer');
      if (top) top.before(char);
    },
    scene,
  });
})();
