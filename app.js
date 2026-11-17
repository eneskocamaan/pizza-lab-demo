(() => {
  'use strict';

  // ---------- yardımcılar ----------
  const $ = (s, r = document) => r.querySelector(s);
  const NS = 'http://www.w3.org/2000/svg';
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const byId = (list, id) => list.find((x) => x.id === id);
  const tl = (n) => '₺' + Math.round(n).toLocaleString('tr-TR');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const replay = (node, cls) => { node.classList.remove(cls); void node.getBoundingClientRect(); node.classList.add(cls); };
  const buzz = (ms = 10) => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (_) { /* yok */ } };
  const isDesktop = () => window.matchMedia('(min-width: 920px)').matches;

  function el(tag, attrs = {}) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  const tweens = {};
  function tween(key, from, to, ms, step, done) {
    cancelAnimationFrame(tweens[key]);
    const t0 = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const f = (now) => {
      const t = Math.min(1, Math.max(0, (now - t0) / ms));
      step(from + (to - from) * ease(t));
      if (t < 1) tweens[key] = requestAnimationFrame(f);
      else if (done) done();
    };
    tweens[key] = requestAnimationFrame(f);
  }

  // Hafif dalgalı organik daire
  function blob(r, amp, seed, cx = 200, cy = 200, pts = 90) {
    let d = '';
    for (let i = 0; i < pts; i++) {
      const a = (i / pts) * Math.PI * 2;
      const n = Math.sin(a * 3 + seed) * 0.5 + Math.sin(a * 5 + seed * 1.7) * 0.3 + Math.sin(a * 11 + seed * 0.6) * 0.2;
      const rr = r + n * amp;
      d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(1) + ' ' + (cy + Math.sin(a) * rr).toFixed(1);
    }
    return d + 'Z';
  }

  function randInCircle(R, cx = 200, cy = 200) {
    const a = rand(0, Math.PI * 2);
    const r = R * Math.sqrt(Math.random());
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  }

  // ---------- veri ----------
  const SIZES = [
    { id: 'S', name: 'Küçük', cm: 26, price: 190, scale: 0.76, note: 'Tek kişilik' },
    { id: 'M', name: 'Orta', cm: 32, price: 250, scale: 0.88, note: 'Paylaşmalık (belki)' },
    { id: 'L', name: 'Büyük', cm: 38, price: 320, scale: 1, note: 'Kalabalık masa' },
  ];
  const DOUGHS = [
    { id: 'klasik', name: 'Klasik', desc: '48 saat mayalı', price: 0, rim: ['#f6cf86', '#dda04b', '#a5602a'], base: '#f1d7a3', inner: 162 },
    { id: 'ince', name: 'İncecik', desc: 'Çıtır, Roma usulü', price: 0, rim: ['#f8dca0', '#e6b66a', '#b8783a'], base: '#f4dfb2', inner: 174 },
    { id: 'tam', name: 'Tam Buğday', desc: 'Fındıksı aroma', price: 20, rim: ['#d1a26a', '#a06d3b', '#6b4222'], base: '#d9b88c', inner: 162 },
    { id: 'komur', name: 'Kömür', desc: 'Simsiyah, aktif karbon', price: 35, rim: ['#5a524d', '#34302d', '#191615'], base: '#433b37', inner: 164 },
  ];
  const SAUCES = [
    { id: 'domates', name: 'San Marzano', desc: 'Klasik domates', price: 0, color: '#cf3a22', fleck: '#7d1a0c' },
    { id: 'pesto', name: 'Pesto', desc: 'Fesleğen, çam fıstığı', price: 20, color: '#5c8f2c', fleck: '#2a5212' },
    { id: 'beyaz', name: 'Beyaz Sos', desc: 'Kremalı, sarımsaklı', price: 15, color: '#efe2c6', fleck: '#b9a37a' },
    { id: 'bbq', name: 'Füme BBQ', desc: 'Tatlı ve isli', price: 15, color: '#6e2716', fleck: '#3b120a' },
    { id: 'yok', name: 'Sossuz', desc: 'Sade kalsın', price: 0, color: null },
  ];
  const CHEESES = [
    { id: 'mozz', name: 'Mozzarella', desc: 'Fior di latte', price: 0, colors: ['#fbf4df', '#f3e6c4'] },
    { id: 'ched', name: 'Cheddar', desc: 'Olgun, keskin', price: 20, colors: ['#f7b941', '#eaa22a'] },
    { id: 'mix', name: '4 Peynir', desc: 'Gorgonzola dahil', price: 35, colors: ['#fbf4df', '#f7b941', '#e9e3cf', '#d6dcc2'] },
    { id: 'vegan', name: 'Vegan', desc: 'Kaju bazlı', price: 25, colors: ['#f2e4ae', '#e8d692'] },
    { id: 'yok', name: 'Peynirsiz', desc: 'Hafif olsun', price: 0, colors: null },
  ];
  const TOPPINGS = [
    { id: 'pep', name: 'Pepperoni', price: 30, n: 8, draw: () => '<circle r="15" fill="#b8321f"/><circle r="12.5" fill="#d0452c"/><circle cx="-4" cy="-3" r="1.8" fill="#8a2112"/><circle cx="5" cy="2" r="1.5" fill="#8a2112"/><circle cx="-1" cy="6" r="1.4" fill="#8a2112"/><ellipse cx="-4" cy="-6" rx="5" ry="2.2" fill="#fff" opacity=".18"/>' },
    { id: 'suc', name: 'Sucuk', price: 35, n: 9, draw: () => '<circle r="12" fill="#6e1f15"/><circle r="10" fill="#9a2c1d"/><circle cx="-3" cy="-2" r="1.6" fill="#f3d9c4"/><circle cx="4" cy="3" r="1.3" fill="#f3d9c4"/><circle cx="2" cy="-5" r="1.1" fill="#f3d9c4"/><circle cx="-4" cy="5" r="1" fill="#f3d9c4"/>' },
    { id: 'mant', name: 'Mantar', price: 25, n: 9, draw: () => '<path d="M-13 1 C-13 -12 13 -12 13 1 Z" fill="#e7d3b2" stroke="#a88a62" stroke-width="1.5"/><path d="M-5 1 L-4 11 Q0 13 4 11 L5 1 Z" fill="#f2e3c8" stroke="#a88a62" stroke-width="1.5"/><path d="M-8 -3 Q0 -7 8 -3" stroke="#c4a87f" fill="none" stroke-width="1.2"/>' },
    { id: 'zeyt', name: 'Zeytin', price: 20, n: 11, draw: () => '<circle r="7" fill="none" stroke="#1f1a1c" stroke-width="5"/><circle cx="-2.5" cy="-4" r="1.4" fill="#fff" opacity=".35"/>' },
    { id: 'biber', name: 'Yeşil Biber', price: 15, n: 8, draw: () => '<path d="M-12 4 Q-8 -10 10 -6" fill="none" stroke="#2f9446" stroke-width="5" stroke-linecap="round"/><path d="M-11 3 Q-7 -8 9 -5" fill="none" stroke="#7fd08a" stroke-width="1.4" stroke-linecap="round"/>' },
    { id: 'sogan', name: 'Mor Soğan', price: 15, n: 7, draw: () => '<path d="M-12 6 A13 13 0 0 1 12 -4" fill="none" stroke="#9b5cb4" stroke-width="3" stroke-linecap="round"/><path d="M-8 6 A9 9 0 0 1 8 -1" fill="none" stroke="#d3a8e0" stroke-width="2.4" stroke-linecap="round"/>' },
    { id: 'misir', name: 'Mısır', price: 15, n: 10, draw: () => '<rect x="-9" y="-3" width="6" height="7" rx="2.5" fill="#f6c92f"/><rect x="-2" y="-5" width="6" height="7" rx="2.5" fill="#f9d64e"/><rect x="5" y="-2" width="6" height="7" rx="2.5" fill="#efbd22"/>' },
    { id: 'jal', name: 'Jalapeño', price: 20, n: 7, draw: () => '<circle r="9" fill="#3d8a2e"/><circle r="6.5" fill="#cfe7a6"/><circle cx="-2" cy="-1" r="1.3" fill="#f6f1d8"/><circle cx="2" cy="1.5" r="1.3" fill="#f6f1d8"/><circle cx="0" cy="-3.2" r="1.1" fill="#f6f1d8"/>' },
    { id: 'cherry', name: 'Cherry Domates', price: 20, n: 8, draw: () => '<circle r="10" fill="#e2412b"/><circle r="7.5" fill="#f1735a"/><path d="M0 -7 V7 M-6 -3.5 L6 3.5 M-6 3.5 L6 -3.5" stroke="#e2412b" stroke-width="1.6"/><circle r="2" fill="#f6d1a8"/>' },
    { id: 'feslegen', name: 'Fesleğen', price: 15, n: 6, draw: () => '<path d="M0 -14 C10 -8 10 8 0 14 C-10 8 -10 -8 0 -14 Z" fill="#2f8f3a"/><path d="M0 -12 V12" stroke="#6fcf74" stroke-width="1.4"/>' },
  ];
  const MAX_TOPPINGS = 6;

  const STEPS = [
    { id: 'size', label: 'Boyut', title: 'Ne kadar acıktın?', sub: 'Boyutu seç. Sonradan her şeyi değiştirebilirsin.', hint: 'Boyut seçtikçe pizza büyür' },
    { id: 'dough', label: 'Hamur', title: 'Hamurunu seç', sub: 'İyi pizza iyi hamurla başlar.', hint: 'Kenarlara bak, her hamur farklı pişer' },
    { id: 'sauce', label: 'Sos', title: 'Sosu yay', sub: 'Kepçe bizde, sen sadece seç.', hint: 'Sos ortadan kenarlara yayılır' },
    { id: 'cheese', label: 'Peynir', title: 'Peynir yağmuru', sub: 'Fırında eriyip birbirine karışacak.', hint: 'Rende hazır' },
    { id: 'toppings', label: 'Malzeme', title: 'Üstüne ne koyalım?', sub: 'Dokun ya da yukarı sürükleyip pizzaya bırak. En fazla 6.', hint: 'Malzemeyi sürükle, istediğin yere bırak' },
    { id: 'name', label: 'İsim', title: 'Ona bir isim ver', sub: 'Her başyapıtın bir adı olur.', hint: '' },
  ];

  const ADJ = ['Kızgın', 'Volkanik', 'Tembel', 'Efsane', 'Kadife', 'Asi', 'Çılgın', 'Sakin', 'Gece Yarısı', 'Mahalle'];
  const NOUN = ['Volkan', 'Fırtına', 'Klasik', 'Rüya', 'Usta', 'Pazar Keyfi', 'Kaçamak', 'Şölen'];

  // ---------- durum ----------
  const fresh = () => ({ step: 0, size: 'M', dough: 'klasik', sauce: null, cheese: null, toppings: [], name: '', share: true });
  let state = fresh();
  let pieces = {};
  let shownPrice = 0;
  let lastTotal = null;
  let turn = 0;

  const svg = $('#pizza');
  const board = $('#board');
  const turnEl = $('#turn');
  const stage = $('#stage');
  const optionsBox = $('#options');
  const root = document.documentElement;

  const innerR = () => byId(DOUGHS, state.dough).inner;

  // ---------- ekrana sığdırma ----------
  let fitRaf;
  function fit() {
    cancelAnimationFrame(fitRaf);
    fitRaf = requestAnimationFrame(() => {
      const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      if (!isDesktop()) {
        root.style.setProperty('--app-h', vh + 'px');
        window.scrollTo(0, 0);
      } else {
        root.style.setProperty('--app-h', '100dvh');
      }
      const r = stage.getBoundingClientRect();
      const pz = Math.max(130, Math.min(r.width * 0.74, r.height * 0.72, 470));
      root.style.setProperty('--pz', pz.toFixed(0) + 'px');
    });
  }
  window.addEventListener('resize', fit);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', fit);

  // ---------- pizza çizimi ----------
  function drawDough() {
    const d = byId(DOUGHS, state.dough);
    ['cs0', 'cs1', 'cs2'].forEach((id, i) => $('#' + id).setAttribute('stop-color', d.rim[i]));
    $('#crust').setAttribute('d', blob(186, 3.5, 1.7));
    const base = $('#base');
    base.setAttribute('d', blob(d.inner, 2.2, 4.1));
    base.setAttribute('fill', d.base);
    $('#innerClipC').setAttribute('r', d.inner - 3);

    const spots = $('#rimSpots');
    spots.innerHTML = '';
    for (let i = 0; i < 24; i++) {
      const a = rand(0, Math.PI * 2);
      const rr = rand(d.inner + 5, 181);
      const x = 200 + Math.cos(a) * rr;
      const y = 200 + Math.sin(a) * rr;
      spots.append(el('ellipse', {
        cx: x.toFixed(1), cy: y.toFixed(1), rx: rand(2, 6).toFixed(1), ry: rand(1.5, 3.2).toFixed(1),
        transform: `rotate(${((a * 180) / Math.PI + 90).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})`,
        fill: d.rim[2], opacity: rand(0.25, 0.55).toFixed(2),
      }));
    }
  }

  function drawSauce() {
    const g = $('#sauce');
    const clip = $('#sauceClipC');
    const s = byId(SAUCES, state.sauce);
    const R = innerR() - 7;
    if (!s || !s.color) {
      tween('sauce', +clip.getAttribute('r'), 0, 350, (v) => clip.setAttribute('r', v.toFixed(1)), () => { g.innerHTML = ''; });
      return;
    }
    g.innerHTML = '';
    g.append(el('path', { d: blob(R, 3, 7.3), fill: s.color }));
    g.append(el('path', { d: blob(R * 0.62, 7, 2.2), fill: '#fff', opacity: 0.06 }));
    for (let i = 0; i < 50; i++) {
      const p = randInCircle(R - 6);
      g.append(el('circle', { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: rand(0.8, 2.2).toFixed(1), fill: s.fleck, opacity: rand(0.3, 0.7).toFixed(2) }));
    }
    clip.setAttribute('r', 0);
    tween('sauce', 0, R + 6, 950, (v) => clip.setAttribute('r', v.toFixed(1)));
  }

  function drawCheese() {
    const g = $('#cheese');
    const c = byId(CHEESES, state.cheese);
    g.innerHTML = '';
    if (!c || !c.colors) return;
    const R = innerR() - 24;
    for (let i = 0; i < 40; i++) {
      const p = randInCircle(R);
      const n = el('circle', { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: rand(12, 24).toFixed(1), fill: pick(c.colors), class: 'cheese-bit' });
      n.style.animationDelay = i * 20 + 'ms';
      g.append(n);
    }
  }

  const allPoints = () => Object.values(pieces).flat();

  function placePoint(at, existing) {
    const R = innerR() - 24;
    let best = null;
    for (let tries = 0; tries < 40; tries++) {
      let p;
      if (at) {
        const a = rand(0, Math.PI * 2);
        const r = rand(0, 58);
        p = { x: at.x + Math.cos(a) * r, y: at.y + Math.sin(a) * r };
        if (Math.hypot(p.x - 200, p.y - 200) > R) continue;
      } else {
        p = randInCircle(R);
      }
      best = p;
      const minD = tries < 25 ? 24 : 12;
      if (existing.every((q) => Math.hypot(q.x - p.x, q.y - p.y) > minD)) return p;
    }
    return best || randInCircle(R);
  }

  function spawnPieces(id, count, at) {
    const t = byId(TOPPINGS, id);
    let g = $(`#toppings g[data-id="${id}"]`);
    if (!g) {
      g = el('g', { 'data-id': id });
      $('#toppings').append(g);
    }
    pieces[id] = pieces[id] || [];
    const existing = allPoints();
    for (let i = 0; i < count; i++) {
      const p = placePoint(at, existing);
      existing.push(p);
      pieces[id].push(p);
      const outer = el('g', { transform: `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${rand(0, 360).toFixed(0)})` });
      const inner = el('g', { class: 'piece' });
      inner.innerHTML = t.draw();
      inner.style.animationDelay = i * 45 + 'ms';
      outer.append(inner);
      g.append(outer);
    }
  }

  function addTopping(id, at) {
    const t = byId(TOPPINGS, id);
    if (state.toppings.includes(id)) {
      if (at) { // zaten varsa sürüklemek "bir avuç daha" ekler
        if (pieces[id].length >= t.n * 2) return toast('Bu kadarı yeter, pizza taşacak');
        spawnPieces(id, 3, at);
        buzz(8);
      } else {
        removeTopping(id);
      }
      return;
    }
    if (state.toppings.length >= MAX_TOPPINGS) {
      const chip = optionsBox.querySelector(`.chip[data-v="${id}"]`);
      if (chip) replay(chip, 'nope');
      buzz([20, 40, 20]);
      return toast(`En fazla ${MAX_TOPPINGS} malzeme. Birini çıkar, sonra ekle.`);
    }
    state.toppings.push(id);
    spawnPieces(id, t.n, at);
    buzz(12);
    afterChange();
  }

  function removeTopping(id) {
    state.toppings = state.toppings.filter((x) => x !== id);
    delete pieces[id];
    const g = $(`#toppings g[data-id="${id}"]`);
    if (g) {
      g.removeAttribute('data-id');
      g.querySelectorAll('.piece').forEach((p, i) => {
        p.style.animationDelay = i * 25 + 'ms';
        p.classList.add('leave');
      });
      setTimeout(() => g.remove(), 650);
    }
    afterChange();
  }

  function afterChange() {
    optionsBox.querySelectorAll('.chip').forEach((c) => {
      const on = state.toppings.includes(c.dataset.v);
      c.classList.toggle('on', on);
      c.setAttribute('aria-pressed', on);
    });
    updatePrice();
    renderSummary();
  }

  function applySize() {
    const z = byId(SIZES, state.size);
    board.style.setProperty('--scale', z.scale);
    $('#sizeTag').textContent = `${z.cm} cm`;
  }

  const wobble = () => replay(svg, 'wobble');

  function flour() {
    const r = board.getBoundingClientRect();
    const st = stage.getBoundingClientRect();
    const cx = r.left - st.left + r.width / 2;
    const cy = r.top - st.top + r.height / 2;
    for (let i = 0; i < 22; i++) {
      const p = document.createElement('i');
      p.className = 'flour';
      const a = rand(0, Math.PI * 2);
      const d = rand(r.width * 0.3, r.width * 0.7);
      p.style.left = cx + Math.cos(a) * r.width * 0.2 + 'px';
      p.style.top = cy + Math.sin(a) * r.width * 0.2 + 'px';
      p.style.setProperty('--x', Math.cos(a) * d + 'px');
      p.style.setProperty('--y', Math.sin(a) * d + 'px');
      p.style.animationDelay = rand(0, 120) + 'ms';
      stage.append(p);
      setTimeout(() => p.remove(), 1300);
    }
  }

  // ---------- fiyat ----------
  function total() {
    let p = byId(SIZES, state.size).price + byId(DOUGHS, state.dough).price;
    if (state.sauce) p += byId(SAUCES, state.sauce).price;
    if (state.cheese) p += byId(CHEESES, state.cheese).price;
    state.toppings.forEach((id) => { p += byId(TOPPINGS, id).price; });
    return p;
  }

  function updatePrice() {
    const to = total();
    const delta = lastTotal === null ? 0 : to - lastTotal;
    lastTotal = to;
    if (Math.round(to) === Math.round(shownPrice)) return;
    tween('price', shownPrice, to, 550, (v) => { shownPrice = v; $('#price').textContent = tl(v); });
    const pill = $('#pricePill');
    replay(pill, 'bump');
    if (delta) {
      const f = document.createElement('span');
      f.className = 'float-price' + (delta < 0 ? ' neg' : '');
      f.textContent = (delta > 0 ? '+' : '−') + tl(Math.abs(delta));
      pill.append(f);
      setTimeout(() => f.remove(), 1000);
    }
  }

  // ---------- panel ----------
  const priceTag = (p) => (p ? `<span class="opt-price">+${tl(p)}</span>` : '<span class="opt-price free">dahil</span>');
  const DICE = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.2" fill="currentColor"/></svg>';

  const opt = (on, v, vis, name, desc, price) => `
    <button class="opt ${on ? 'on' : ''}" data-v="${v}">
      <span class="opt-vis">${vis}</span>
      <span class="opt-txt"><b>${name}</b><small>${desc}</small></span>
      ${price}
    </button>`;

  const builders = {
    size: () => SIZES.map((z) => opt(state.size === z.id, z.id,
      `<i class="vis-size" style="--s:${z.scale}"></i>`, `${z.name} · ${z.cm} cm`, z.note,
      `<span class="opt-price">${tl(z.price)}</span>`)).join(''),

    dough: () => DOUGHS.map((d) => opt(state.dough === d.id, d.id,
      `<i class="vis-dough" style="--a:${d.rim[0]};--b:${d.rim[1]};--c:${d.rim[2]};--base:${d.base}"></i>`,
      d.name, d.desc, priceTag(d.price))).join(''),

    sauce: () => SAUCES.map((s) => opt(state.sauce === s.id, s.id,
      s.color ? `<i class="vis-sauce" style="--c:${s.color}"></i>` : '<i class="vis-none"></i>',
      s.name, s.desc, priceTag(s.price))).join(''),

    cheese: () => CHEESES.map((c) => opt(state.cheese === c.id, c.id,
      c.colors ? `<i class="vis-cheese" style="--c1:${c.colors[0]};--c2:${c.colors[1]}"></i>` : '<i class="vis-none"></i>',
      c.name, c.desc, priceTag(c.price))).join(''),

    toppings: () => TOPPINGS.map((t) => `
      <button class="chip ${state.toppings.includes(t.id) ? 'on' : ''}" data-v="${t.id}" aria-pressed="${state.toppings.includes(t.id)}">
        <svg viewBox="-18 -18 36 36">${t.draw()}</svg>
        <b>${t.name}</b><small>+${tl(t.price)}</small>
      </button>`).join(''),

    name: () => `
      <div class="name-box">
        <input id="nameInput" maxlength="26" autocomplete="off" enterkeyhint="go" placeholder="Örn. Kadıköy Volkanı" value="${esc(state.name)}">
        <button class="dice" id="dice" aria-label="Rastgele isim">${DICE}</button>
      </div>
      <div class="name-sugs">${suggestions().map((n) => `<button class="sug" data-v="${esc(n)}">${esc(n)}</button>`).join('')}</div>
      <label class="switch"><input type="checkbox" id="shareToggle" ${state.share ? 'checked' : ''}><span></span>Topluluk Favorileri'nde paylaş</label>`,
  };

  function renderPanel() {
    const s = STEPS[state.step];
    $('#stepNo').textContent = String(state.step + 1).padStart(2, '0');
    $('#stepTitle').textContent = s.title;
    $('#stepSub').textContent = s.sub;
    replay($('.sheet-head'), 'in');
    board.dataset.step = s.id;
    updateHint(true);

    optionsBox.className = 'options opts-' + s.id;
    optionsBox.innerHTML = builders[s.id]();
    [...optionsBox.children].forEach((c, i) => c.style.setProperty('--i', i));
    replay(optionsBox, 'enter');
    bindOptions(s.id);

    // seçili kartı görünür yap (mobil yatay liste)
    optionsBox.scrollLeft = 0;
    const on = optionsBox.querySelector('.opt.on');
    if (on && !isDesktop()) optionsBox.scrollLeft = Math.max(0, on.offsetLeft - 18);

    $('#back').disabled = state.step === 0;
    const last = state.step === STEPS.length - 1;
    $('#nextLabel').textContent = last ? 'Fırına ver' : 'Devam';
    $('#next').classList.toggle('fire', last);
    renderStepper();
    renderSummary();
  }

  function updateHint(animate) {
    const s = STEPS[state.step];
    const h = $('#hint');
    if (s.id === 'name') {
      h.textContent = state.name.trim() || 'İsimsiz başyapıt';
      h.classList.add('named');
    } else {
      h.textContent = s.hint;
      h.classList.remove('named');
    }
    if (animate) replay(h, 'in');
  }

  function renderStepper() {
    $('#stepper').innerHTML = STEPS.map((s, i) => `
      <button class="st ${i < state.step ? 'done' : ''} ${i === state.step ? 'now' : ''}" data-i="${i}">
        <span class="st-bar"></span><span class="st-lbl">${s.label}</span>
      </button>`).join('');
  }

  function renderSummary() {
    const parts = [`${byId(SIZES, state.size).cm} cm`, byId(DOUGHS, state.dough).name + ' hamur'];
    if (state.sauce) parts.push(byId(SAUCES, state.sauce).name);
    if (state.cheese) parts.push(byId(CHEESES, state.cheese).name);
    state.toppings.forEach((id) => parts.push(byId(TOPPINGS, id).name));
    $('#summary').innerHTML = '<span class="sum-lbl">Tarifin</span>' + parts.map((p) => `<span class="tag">${esc(p)}</span>`).join('');
  }

  function bindOptions(stepId) {
    if (stepId === 'toppings') {
      optionsBox.querySelectorAll('.chip').forEach(bindChip);
      return;
    }
    if (stepId === 'name') {
      const input = $('#nameInput');
      input.addEventListener('input', () => { state.name = input.value; updateHint(); });
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { input.blur(); bake(); } });
      $('#dice').addEventListener('click', (e) => {
        state.name = makeName();
        input.value = state.name;
        updateHint(true);
        replay(e.currentTarget, 'roll');
        buzz(8);
      });
      optionsBox.querySelectorAll('.sug').forEach((b) => b.addEventListener('click', () => {
        state.name = b.dataset.v;
        input.value = state.name;
        updateHint(true);
        buzz(8);
      }));
      $('#shareToggle').addEventListener('change', (e) => { state.share = e.target.checked; buzz(8); });
      return;
    }
    optionsBox.querySelectorAll('.opt').forEach((b) => b.addEventListener('click', () => {
      optionsBox.querySelectorAll('.opt').forEach((x) => x.classList.toggle('on', x === b));
      choose(stepId, b.dataset.v);
      buzz(10);
    }));
  }

  function choose(stepId, v) {
    if (stepId === 'size') { state.size = v; applySize(); wobble(); }
    if (stepId === 'dough') {
      state.dough = v;
      drawDough();
      flour();
      wobble();
      if (state.sauce) drawSauce();
      if (state.cheese) drawCheese();
    }
    if (stepId === 'sauce') { state.sauce = v; drawSauce(); }
    if (stepId === 'cheese') { state.cheese = v; drawCheese(); }
    updatePrice();
    renderSummary();
  }

  // ---------- sürükle-bırak ----------
  // Ekran koordinatını pizza (döndürülmüş SVG) koordinatına çevirir
  function pizzaPoint(cx, cy) {
    const r = board.getBoundingClientRect();
    const k = 400 / r.width;
    const dx = (cx - (r.left + r.width / 2)) * k;
    const dy = (cy - (r.top + r.height / 2)) * k;
    const a = (-turn * Math.PI) / 180;
    return { x: 200 + dx * Math.cos(a) - dy * Math.sin(a), y: 200 + dx * Math.sin(a) + dy * Math.cos(a) };
  }
  function overPizza(cx, cy) {
    const p = pizzaPoint(cx, cy);
    return Math.hypot(p.x - 200, p.y - 200) < innerR() + 14 ? p : null;
  }

  function bindChip(chip) {
    const id = chip.dataset.v;
    let suppressClick = false;

    chip.addEventListener('click', () => {
      if (suppressClick) { suppressClick = false; return; }
      addTopping(id);
    });

    chip.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const pid = e.pointerId;
      const sx = e.clientX, sy = e.clientY;
      const touch = e.pointerType !== 'mouse';
      let ghost = null;

      const cleanup = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', end);
        window.removeEventListener('pointercancel', end);
      };
      const move = (ev) => {
        if (ev.pointerId !== pid) return;
        const dx = ev.clientX - sx, dy = ev.clientY - sy;
        if (!ghost) {
          if (Math.hypot(dx, dy) < 8) return;
          // dokunmatikte: yukarı hareket = sürükle, yana hareket = listeyi kaydır
          if (touch && !(dy < -4 && Math.abs(dy) > Math.abs(dx) * 0.7)) { cleanup(); return; }
          ghost = document.createElement('div');
          ghost.className = 'drag-ghost';
          ghost.innerHTML = `<svg viewBox="-18 -18 36 36">${byId(TOPPINGS, id).draw()}</svg>`;
          document.body.append(ghost);
          chip.classList.add('lifting');
          board.classList.add('drop-ready');
          try { chip.setPointerCapture(pid); } catch (_) { /* yok */ }
          buzz(6);
        }
        ev.preventDefault();
        ghost.style.transform = `translate(${ev.clientX}px, ${ev.clientY - (touch ? 30 : 0)}px)`;
        board.classList.toggle('drop-over', !!overPizza(ev.clientX, ev.clientY - (touch ? 30 : 0)));
      };
      const end = (ev) => {
        if (ev.pointerId !== pid) return;
        cleanup();
        if (!ghost) return;
        suppressClick = true;
        setTimeout(() => { suppressClick = false; }, 60);
        ghost.remove();
        chip.classList.remove('lifting');
        board.classList.remove('drop-ready', 'drop-over');
        const p = ev.type === 'pointerup' ? overPizza(ev.clientX, ev.clientY - (touch ? 30 : 0)) : null;
        if (p) addTopping(id, p);
      };
      window.addEventListener('pointermove', move, { passive: false });
      window.addEventListener('pointerup', end);
      window.addEventListener('pointercancel', end);
    });
  }

  // ---------- isim ----------
  function makeName() {
    const t = state.toppings;
    const pool = [];
    if (t.includes('jal')) pool.push('Ateş Topu', 'Acı Gerçek');
    if (state.dough === 'komur') pool.push('Kara Elmas', 'Gece Yarısı');
    if (state.sauce === 'pesto') pool.push('Yeşil Rüya');
    if (state.sauce === 'bbq') pool.push('Dumanaltı');
    if (t.includes('suc')) pool.push('Sucuk Sevdası');
    if (t.includes('mant')) pool.push('Orman Gizemi');
    if (state.cheese === 'mix') pool.push('Peynir Şelalesi');
    if (t.length >= 5) pool.push('Ne Varsa Koy');
    if (t.length === 0) pool.push('Sade ve Asil');
    pool.push(`${pick(ADJ)} ${pick(NOUN)}`, `${pick(ADJ)} ${pick(NOUN)}`);
    return pick(pool);
  }
  function suggestions() {
    const s = new Set();
    let guard = 0;
    while (s.size < 4 && guard++ < 50) s.add(makeName());
    return [...s];
  }

  // ---------- fırın ----------
  const MSGS = ['Odun ateşi harlanıyor…', 'Hamur kabarıyor…', 'Peynir eriyor…', 'Kenarlar kızarıyor…', 'Son bir tur…'];

  function clonePizza() {
    const c = svg.cloneNode(true);
    c.removeAttribute('id');
    c.removeAttribute('class');
    c.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
    c.classList.add('clone');
    c.querySelectorAll('.piece, .cheese-bit').forEach((n) => { n.style.animation = 'none'; });
    const char = el('g', { class: 'char' });
    for (let i = 0; i < 18; i++) {
      const p = randInCircle(innerR() - 14);
      char.append(el('circle', { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: rand(3, 9).toFixed(1), fill: '#8a4b17', opacity: rand(0.12, 0.28).toFixed(2) }));
    }
    c.querySelector('.toppings-layer').before(char);
    return c;
  }

  let baking = false;
  function bake() {
    if (baking) return;
    baking = true;
    buzz(15);
    if (!state.name.trim()) state.name = makeName();
    const oven = $('#oven');
    const holder = $('#ovenPizza');
    holder.innerHTML = '';
    const c = clonePizza();
    holder.append(c);
    oven.hidden = false;
    requestAnimationFrame(() => oven.classList.add('show'));

    const T = 4600;
    const t0 = performance.now();
    let mi = -1;
    const f = (now) => {
      const t = Math.min(1, Math.max(0, (now - t0) / T));
      $('#ovenBar').style.width = t * 100 + '%';
      $('#ovenTemp').textContent = Math.round(20 + 430 * (1 - Math.pow(1 - t, 2)));
      const i = Math.min(MSGS.length - 1, Math.floor(t * MSGS.length));
      if (i !== mi) {
        mi = i;
        const m = $('#ovenMsg');
        m.textContent = MSGS[i];
        replay(m, 'in');
      }
      if (t > 0.4) c.classList.add('baked');
      if (t < 1) requestAnimationFrame(f);
      else setTimeout(showResult, 300);
    };
    requestAnimationFrame(f);
  }

  function showResult() {
    const oven = $('#oven');
    oven.classList.remove('show');
    setTimeout(() => { oven.hidden = true; }, 450);

    const holder = $('#resultPizza');
    holder.innerHTML = '';
    const c = clonePizza();
    c.classList.add('baked');
    holder.append(c);

    $('#resultName').textContent = state.name;
    $('#shareBadge').style.display = state.share ? '' : 'none';
    const z = byId(SIZES, state.size);
    const rows = [
      ['Boyut', `${z.name} · ${z.cm} cm`],
      ['Hamur', byId(DOUGHS, state.dough).name],
      ['Sos', state.sauce ? byId(SAUCES, state.sauce).name : 'Sossuz'],
      ['Peynir', state.cheese ? byId(CHEESES, state.cheese).name : 'Peynirsiz'],
      ['Malzemeler', state.toppings.length ? state.toppings.map((id) => byId(TOPPINGS, id).name).join(', ') : 'Sade'],
    ];
    $('#resultList').innerHTML = rows.map(([k, v]) => `<li><span>${k}</span><b>${esc(v)}</b></li>`).join('');
    $('#resultPrice').textContent = tl(total());

    const cart = $('#cartBtn');
    cart.textContent = 'Sepete ekle';
    cart.classList.remove('done');
    const save = $('#saveBtn');
    save.textContent = 'Kaydet';
    save.disabled = false;

    const r = $('#result');
    r.hidden = false;
    r.scrollTop = 0;
    requestAnimationFrame(() => r.classList.add('show'));
    setTimeout(confetti, 250);
    buzz([10, 60, 20]);
    baking = false;
  }

  function confetti() {
    const ids = state.toppings.length ? state.toppings : ['pep', 'feslegen', 'cherry'];
    const W = Math.min(window.innerWidth, 760);
    for (let i = 0; i < 30; i++) {
      const d = document.createElement('div');
      d.className = 'cf';
      d.innerHTML = `<svg viewBox="-18 -18 36 36">${byId(TOPPINGS, pick(ids)).draw()}</svg>`;
      const a = rand(0, Math.PI * 2);
      const r = rand(90, W * 0.6);
      d.style.setProperty('--x', Math.cos(a) * r + 'px');
      d.style.setProperty('--y', Math.sin(a) * r * 0.7 + rand(120, 300) + 'px');
      d.style.setProperty('--r', rand(-400, 400) + 'deg');
      d.style.animationDelay = rand(0, 160) + 'ms';
      document.body.append(d);
      setTimeout(() => d.remove(), 2100);
    }
  }

  // ---------- toast ----------
  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }

  // ---------- açılış ----------
  function buildSplash() {
    const s = $('#splashPizza');
    let h = `<path d="${blob(186, 3.5, 1.7)}" fill="url(#gCrust)"/>`;
    h += `<path d="${blob(162, 2.2, 4.1)}" fill="#f1d7a3"/>`;
    h += `<path d="${blob(155, 3, 7.3)}" fill="#cf3a22"/>`;
    h += '<g filter="url(#melt)">';
    for (let i = 0; i < 34; i++) {
      const p = randInCircle(132);
      h += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${rand(12, 22).toFixed(1)}" fill="${pick(['#fbf4df', '#f3e6c4'])}"/>`;
    }
    h += '</g>';
    const placed = [];
    const put = (id, n) => {
      const t = byId(TOPPINGS, id);
      for (let i = 0; i < n; i++) {
        let p;
        for (let k = 0; k < 30; k++) {
          p = randInCircle(130);
          if (placed.every((q) => Math.hypot(q.x - p.x, q.y - p.y) > 30)) break;
        }
        placed.push(p);
        h += `<g transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${rand(0, 360).toFixed(0)})">${t.draw()}</g>`;
      }
    };
    put('pep', 8); put('feslegen', 4); put('zeyt', 6);
    s.innerHTML = h;

    $('#orbit').innerHTML = ['pep', 'mant', 'cherry', 'biber', 'feslegen', 'jal']
      .map((id, i) => `<i style="--i:${i}"><svg viewBox="-18 -18 36 36">${byId(TOPPINGS, id).draw()}</svg></i>`).join('');
  }

  $('#start').addEventListener('click', () => {
    buzz(12);
    $('#splash').classList.add('out');
    setTimeout(() => { $('#splash').hidden = true; }, 700);
    fit();
    replay(turnEl, 'intro');
  });

  // ---------- olaylar ----------
  function go(i) {
    if (i < 0 || i >= STEPS.length || i === state.step) return;
    turn += (i - state.step) * 34;
    turnEl.style.setProperty('--turn', turn + 'deg');
    board.style.setProperty('--turn', turn + 'deg');
    state.step = i;
    renderPanel();
    buzz(8);
  }

  $('#next').addEventListener('click', () => {
    if (state.step === STEPS.length - 1) bake();
    else go(state.step + 1);
  });
  $('#back').addEventListener('click', () => go(state.step - 1));
  $('#stepper').addEventListener('click', (e) => {
    const b = e.target.closest('.st');
    if (b) go(+b.dataset.i);
  });

  $('#cartBtn').addEventListener('click', (e) => {
    const b = e.currentTarget;
    if (b.classList.contains('done')) return;
    b.textContent = 'Sepette ✓';
    b.classList.add('done');
    buzz(12);
    toast('Sepete eklendi · Demo, mutfağa gitmedi :)');
  });

  $('#saveBtn').addEventListener('click', (e) => {
    const b = e.currentTarget;
    let list = [];
    try { list = JSON.parse(localStorage.getItem('pizzalab.saved') || '[]'); } catch (_) { list = []; }
    list.push({ name: state.name, size: state.size, dough: state.dough, sauce: state.sauce, cheese: state.cheese, toppings: state.toppings.slice(), price: total(), at: Date.now() });
    try {
      localStorage.setItem('pizzalab.saved', JSON.stringify(list));
      toast(`Kaydedildi · Bu cihazda ${list.length} tarif`);
    } catch (_) {
      toast('Bu tarayıcıda kaydedilemedi');
    }
    b.textContent = 'Kaydedildi';
    b.disabled = true;
  });

  $('#restart').addEventListener('click', () => {
    const r = $('#result');
    r.classList.remove('show');
    setTimeout(() => { r.hidden = true; }, 400);
    state = fresh();
    pieces = {};
    turn = 0;
    turnEl.style.setProperty('--turn', '0deg');
    board.style.setProperty('--turn', '0deg');
    $('#toppings').innerHTML = '';
    $('#cheese').innerHTML = '';
    drawDough();
    drawSauce();
    applySize();
    renderPanel();
    updatePrice();
    replay(turnEl, 'intro');
  });

  // ---------- başlat ----------
  drawDough();
  buildSplash();
  applySize();
  renderPanel();
  updatePrice();
  fit();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
})();
