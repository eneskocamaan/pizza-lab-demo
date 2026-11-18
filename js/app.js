(() => {
  'use strict';
  const { byId, tl, esc, pick, rand, products } = PL;
  const $ = (s, r = document) => r.querySelector(s);
  const replay = (node, cls) => { node.classList.remove(cls); void node.getBoundingClientRect(); node.classList.add(cls); };
  const buzz = (ms = 10) => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (_) { /* yok */ } };
  const isDesktop = () => window.matchMedia('(min-width: 920px)').matches;

  const svg = $('#stageSvg');
  const board = $('#board');
  const turnEl = $('#turn');
  const stage = $('#stage');
  const optionsBox = $('#options');
  const root = document.documentElement;

  const ADJ = ['Kızgın', 'Efsane', 'Kadife', 'Asi', 'Çılgın', 'Sakin', 'Gece Yarısı', 'Mahalle', 'Tembel', 'Altın'];

  let product = null, state = null, turn = 0, shownPrice = 0, lastTotal = null, baking = false;
  const heroes = {};

  // Ürünlerin gradyan/desen tanımları tek yerde (klonlar da kullanabilsin diye)
  const defsHost = $('#sharedDefs');
  products.forEach((p) => { if (p.defs) defsHost.insertAdjacentHTML('beforeend', p.defs); });

  // ---------- efektler ----------
  PL.fx.wobble = () => replay(svg, 'wobble');
  PL.fx.puff = (color = '#fff8ec') => {
    const r = board.getBoundingClientRect();
    const st = stage.getBoundingClientRect();
    const cx = r.left - st.left + r.width / 2, cy = r.top - st.top + r.height / 2;
    for (let i = 0; i < 22; i++) {
      const p = document.createElement('i');
      p.className = 'flour';
      p.style.background = color;
      const a = rand(0, Math.PI * 2), d = rand(r.width * 0.3, r.width * 0.7);
      p.style.left = cx + Math.cos(a) * r.width * 0.2 + 'px';
      p.style.top = cy + Math.sin(a) * r.width * 0.2 + 'px';
      p.style.setProperty('--x', Math.cos(a) * d + 'px');
      p.style.setProperty('--y', Math.sin(a) * d + 'px');
      p.style.animationDelay = rand(0, 120) + 'ms';
      stage.append(p);
      setTimeout(() => p.remove(), 1300);
    }
  };

  // ---------- ekrana sığdırma ----------
  let fitRaf;
  function fit() {
    cancelAnimationFrame(fitRaf);
    fitRaf = requestAnimationFrame(() => {
      const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      if (!isDesktop()) { root.style.setProperty('--app-h', vh + 'px'); window.scrollTo(0, 0); }
      else root.style.setProperty('--app-h', '100dvh');
      const r = stage.getBoundingClientRect();
      const pz = Math.max(130, Math.min(r.width * 0.74, r.height * 0.72, 470));
      root.style.setProperty('--pz', pz.toFixed(0) + 'px');
    });
  }
  window.addEventListener('resize', fit);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', fit);

  // ---------- durum ----------
  function fresh(p) {
    const s = { step: 0, sel: {}, multi: {}, name: '', share: true };
    p.steps.forEach((st) => {
      if (st.kind === 'single') s.sel[st.id] = (p.defaults && p.defaults[st.id]) || null;
      if (st.kind === 'multi') s.multi[st.id] = [];
    });
    return s;
  }
  const optOf = (st, id) => st.options.find((o) => o.id === id);
  const findIcon = (p, id) => {
    for (const st of p.steps) if (st.kind === 'multi') { const o = optOf(st, id); if (o) return o.icon; }
    return null;
  };

  function total() {
    let sum = product.base || 0;
    product.steps.forEach((st) => {
      if (st.kind === 'single') { const o = optOf(st, state.sel[st.id]); if (o) sum += o.price || 0; }
      if (st.kind === 'multi') state.multi[st.id].forEach((id) => { sum += optOf(st, id).price || 0; });
    });
    return sum;
  }

  function applyScale() {
    let s = product.scale || 0.9, tag = '';
    product.steps.forEach((st) => {
      if (st.kind !== 'single') return;
      const o = optOf(st, state.sel[st.id]);
      if (o && o.scale) { s = o.scale; tag = o.tag || o.name; }
    });
    board.style.setProperty('--scale', s);
    $('#sizeTag').textContent = tag;
  }

  function setTurn() {
    turnEl.style.setProperty('--turn', turn + 'deg');
    board.style.setProperty('--turn', turn + 'deg');
  }

  function cloneSvg() {
    const c = svg.cloneNode(true);
    c.removeAttribute('id');
    c.removeAttribute('class');
    c.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
    c.querySelectorAll('[clip-path*="-anim"]').forEach((n) => n.removeAttribute('clip-path'));
    c.querySelectorAll('*').forEach((n) => { if (n.style) { n.style.animation = 'none'; n.style.transition = 'none'; } });
    c.classList.add('clone');
    return c;
  }

  function buildHero(p) {
    const s = fresh(p);
    Object.assign(s.sel, p.showcase.sel);
    Object.keys(p.showcase.multi).forEach((k) => { s.multi[k] = p.showcase.multi[k].slice(); });
    product = p;
    p.scene.init(svg, s, { instant: true });
    return cloneSvg();
  }

  // ---------- ürün yükleme ----------
  function loadProduct(id) {
    product = byId(products, id) || products[0];
    state = fresh(product);
    turn = 0;
    setTurn();
    const t = product.theme;
    root.style.setProperty('--accent', t.accent);
    root.style.setProperty('--accent2', t.accent2);
    root.style.setProperty('--glow', t.glow);
    board.dataset.board = product.board;
    $('#brandName').textContent = product.brand;
    $('#brandMark').textContent = product.mark;
    document.title = `${product.brand} · ${product.splash.t1} ${product.splash.t2}`;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', '#140e0b');
    product.scene.init(svg, state, {});
    applyScale();
    lastTotal = null;
    renderPanel();
    updatePrice();
    try { history.replaceState(null, '', '#' + product.id); } catch (_) { /* file:// vb. */ }
    renderSplash();
    markMenu();
  }

  // ---------- açılış ----------
  function renderSplash() {
    const art = $('#splashArt');
    const old = art.querySelector('.splash-hero');
    if (old) old.remove();
    const h = heroes[product.id].cloneNode(true);
    h.classList.add('splash-hero');
    art.append(h);
    art.toggleAttribute('data-spin', !!product.spin);
    $('#orbit').innerHTML = product.orbit.map((id, i) => {
      const ic = findIcon(product, id);
      return ic ? `<i style="--i:${i}"><svg viewBox="-18 -18 36 36">${ic}</svg></i>` : '';
    }).join('');
    $('#splashT1').textContent = product.splash.t1;
    $('#splashT2').textContent = product.splash.t2;
    $('#splashSub').textContent = product.splash.sub;
  }
  function showSplash() {
    const sp = $('#splash');
    sp.hidden = false;
    sp.classList.remove('out');
    replay($('.splash-inner'), 'play');
  }
  $('#start').addEventListener('click', () => {
    buzz(12);
    $('#splash').classList.add('out');
    setTimeout(() => { $('#splash').hidden = true; }, 650);
    fit();
    replay(turnEl, 'intro');
  });

  // ---------- fiyat ----------
  function updatePrice() {
    const to = total();
    const delta = lastTotal === null ? 0 : to - lastTotal;
    lastTotal = to;
    if (Math.round(to) === Math.round(shownPrice)) return;
    PL.tween('price', shownPrice, to, 550, (v) => { shownPrice = v; $('#price').textContent = tl(v); });
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

  function build(st) {
    if (st.kind === 'single') {
      return st.options.map((o) => `
        <button class="opt ${state.sel[st.id] === o.id ? 'on' : ''}" data-v="${o.id}">
          <span class="opt-vis">${o.vis || ''}</span>
          <span class="opt-txt"><b>${o.name}</b><small>${o.desc || ''}</small></span>
          ${st.absolute ? `<span class="opt-price">${tl(o.price)}</span>` : priceTag(o.price)}
        </button>`).join('');
    }
    if (st.kind === 'multi') {
      return st.options.map((o) => {
        const on = state.multi[st.id].includes(o.id);
        return `<button class="chip ${on ? 'on' : ''}" data-v="${o.id}" aria-pressed="${on}">
          <svg viewBox="-18 -18 36 36">${o.icon}</svg><b>${o.name}</b><small>${o.price ? '+' + tl(o.price) : 'dahil'}</small></button>`;
      }).join('');
    }
    return `
      <div class="name-box">
        <input id="nameInput" maxlength="26" autocomplete="off" enterkeyhint="go" placeholder="Bir isim yaz…" value="${esc(state.name)}">
        <button class="dice" id="dice" aria-label="Rastgele isim">${DICE}</button>
      </div>
      <div class="name-sugs">${suggestions().map((n) => `<button class="sug" data-v="${esc(n)}">${esc(n)}</button>`).join('')}</div>
      <label class="switch"><input type="checkbox" id="shareToggle" ${state.share ? 'checked' : ''}><span></span>Topluluk Favorileri'nde paylaş</label>`;
  }

  function renderPanel() {
    const st = product.steps[state.step];
    $('#stepNo').textContent = String(state.step + 1).padStart(2, '0');
    $('#stepTitle').textContent = st.title;
    $('#stepSub').textContent = st.sub;
    replay($('.sheet-head'), 'in');
    board.dataset.step = st.id;
    board.classList.toggle('sizing', st.kind === 'single' && st.options.some((o) => o.scale));
    updateHint(true);

    optionsBox.className = 'options opts-' + st.kind;
    optionsBox.innerHTML = build(st);
    [...optionsBox.children].forEach((c, i) => c.style.setProperty('--i', i));
    replay(optionsBox, 'enter');
    bindOptions(st);

    optionsBox.scrollLeft = 0;
    const on = optionsBox.querySelector('.opt.on');
    if (on && !isDesktop()) optionsBox.scrollLeft = Math.max(0, on.offsetLeft - 18);

    $('#back').disabled = state.step === 0;
    const last = state.step === product.steps.length - 1;
    const CTA = { oven: 'Fırına ver', grill: 'Izgaraya at', iron: 'Makineye koy', frost: 'Hazırla', fresh: 'Kaseyi hazırla' };
    $('#nextLabel').textContent = last ? product.bake.cta || CTA[product.bake.scene] || 'Hazırla' : 'Devam';
    $('#next').classList.toggle('fire', last);
    renderStepper();
    renderSummary();
  }

  function updateHint(animate) {
    const st = product.steps[state.step];
    const h = $('#hint');
    if (st.kind === 'name') { h.textContent = state.name.trim() || 'İsimsiz başyapıt'; h.classList.add('named'); }
    else { h.textContent = st.hint || ''; h.classList.remove('named'); }
    if (animate) replay(h, 'in');
  }

  function renderStepper() {
    const nav = $('#stepper');
    nav.style.gridTemplateColumns = `repeat(${product.steps.length}, 1fr)`;
    nav.innerHTML = product.steps.map((s, i) => `
      <button class="st ${i < state.step ? 'done' : ''} ${i === state.step ? 'now' : ''}" data-i="${i}">
        <span class="st-bar"></span><span class="st-lbl">${s.label}</span>
      </button>`).join('');
  }

  function renderSummary() {
    const parts = [];
    product.steps.forEach((st) => {
      if (st.kind === 'single') { const o = optOf(st, state.sel[st.id]); if (o) parts.push(o.name); }
      if (st.kind === 'multi') state.multi[st.id].forEach((id) => parts.push(optOf(st, id).name));
    });
    $('#summary').innerHTML = '<span class="sum-lbl">Tarifin</span>' + parts.map((p) => `<span class="tag">${esc(p)}</span>`).join('');
  }

  function afterChange() {
    const st = product.steps[state.step];
    if (st.kind === 'multi') {
      optionsBox.querySelectorAll('.chip').forEach((c) => {
        const on = state.multi[st.id].includes(c.dataset.v);
        c.classList.toggle('on', on);
        c.setAttribute('aria-pressed', on);
      });
    }
    updatePrice();
    renderSummary();
  }

  function bindOptions(st) {
    if (st.kind === 'multi') { optionsBox.querySelectorAll('.chip').forEach((c) => bindChip(c, st)); return; }
    if (st.kind === 'name') {
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
      if (state.sel[st.id] === b.dataset.v) return;
      optionsBox.querySelectorAll('.opt').forEach((x) => x.classList.toggle('on', x === b));
      state.sel[st.id] = b.dataset.v;
      product.scene.setSingle(st.id, b.dataset.v, state);
      applyScale();
      afterChange();
      buzz(10);
    }));
  }

  function toggleMulti(st, id, at) {
    const list = state.multi[st.id];
    const o = optOf(st, id);
    if (list.includes(id)) {
      if (at) {
        const ok = product.scene.more ? product.scene.more(st.id, o, at, state) : false;
        if (ok === false) toast(product.scene.more ? 'Bu kadarı yeter, taşacak' : 'Zaten eklendi');
        else buzz(8);
        return;
      }
      state.multi[st.id] = list.filter((x) => x !== id);
      product.scene.removeMulti(st.id, o, state);
      afterChange();
      return;
    }
    if (list.length >= st.max) {
      const chip = optionsBox.querySelector(`.chip[data-v="${id}"]`);
      if (chip) replay(chip, 'nope');
      buzz([20, 40, 20]);
      toast(`En fazla ${st.max} ${st.unit || 'seçim'}. Birini çıkar, sonra ekle.`);
      return;
    }
    list.push(id);
    product.scene.addMulti(st.id, o, at, state);
    buzz(12);
    afterChange();
  }

  // ---------- sürükle-bırak ----------
  function stagePoint(cx, cy) {
    const r = board.getBoundingClientRect();
    const k = 400 / r.width;
    const dx = (cx - (r.left + r.width / 2)) * k, dy = (cy - (r.top + r.height / 2)) * k;
    const a = (-turn * Math.PI) / 180;
    return { x: 200 + dx * Math.cos(a) - dy * Math.sin(a), y: 200 + dx * Math.sin(a) + dy * Math.cos(a) };
  }
  const overTarget = (cx, cy) => product.scene.hit(stagePoint(cx, cy));

  function bindChip(chip, st) {
    const id = chip.dataset.v;
    let suppressClick = false;
    chip.addEventListener('click', () => {
      if (suppressClick) { suppressClick = false; return; }
      toggleMulti(st, id);
    });
    chip.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const pid = e.pointerId, sx = e.clientX, sy = e.clientY, touch = e.pointerType !== 'mouse';
      const lift = touch ? 30 : 0;
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
          if (touch && !(dy < -4 && Math.abs(dy) > Math.abs(dx) * 0.7)) { cleanup(); return; }
          ghost = document.createElement('div');
          ghost.className = 'drag-ghost';
          ghost.innerHTML = `<svg viewBox="-18 -18 36 36">${optOf(st, id).icon}</svg>`;
          document.body.append(ghost);
          chip.classList.add('lifting');
          board.classList.add('drop-ready');
          try { chip.setPointerCapture(pid); } catch (_) { /* yok */ }
          buzz(6);
        }
        ev.preventDefault();
        ghost.style.transform = `translate(${ev.clientX}px, ${ev.clientY - lift}px)`;
        board.classList.toggle('drop-over', !!overTarget(ev.clientX, ev.clientY - lift));
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
        const p = ev.type === 'pointerup' ? overTarget(ev.clientX, ev.clientY - lift) : null;
        if (p) toggleMulti(st, id, p);
      };
      window.addEventListener('pointermove', move, { passive: false });
      window.addEventListener('pointerup', end);
      window.addEventListener('pointercancel', end);
    });
  }

  // ---------- isim ----------
  function makeName() {
    const pool = (product.names ? product.names(state) : []).slice();
    pool.push(`${pick(ADJ)} ${pick(product.nouns)}`, `${pick(ADJ)} ${pick(product.nouns)}`);
    return pick(pool);
  }
  function suggestions() {
    const s = new Set();
    let guard = 0;
    while (s.size < 4 && guard++ < 60) s.add(makeName());
    return [...s];
  }

  // ---------- hazırlama sahnesi ----------
  function bake() {
    if (baking) return;
    baking = true;
    buzz(15);
    if (!state.name.trim()) state.name = makeName();
    const b = product.bake;
    const cook = $('#cook');
    cook.dataset.scene = b.scene;
    cook.classList.remove('closed');
    const holder = cook.querySelector(`.scene-${b.scene} .item`);
    holder.innerHTML = '';
    const c = cloneSvg();
    if (product.onBakeClone) product.onBakeClone(c);
    holder.append(c);
    if (b.scene === 'frost') {
      const snow = cook.querySelector('.snow');
      snow.innerHTML = [...Array(28)].map(() => `<i style="left:${rand(0, 100).toFixed(1)}%;animation-delay:${rand(-4, 0).toFixed(2)}s;animation-duration:${rand(2.6, 5).toFixed(2)}s;--s:${rand(0.4, 1.2).toFixed(2)}"></i>`).join('');
    }
    $('#cookUnit').textContent = b.meter.unit;
    cook.hidden = false;
    requestAnimationFrame(() => cook.classList.add('show'));

    const T = 4600, t0 = performance.now();
    let mi = -1;
    const f = (now) => {
      const t = Math.min(1, Math.max(0, (now - t0) / T));
      $('#cookBar').style.width = t * 100 + '%';
      $('#cookVal').textContent = Math.round(b.meter.from + (b.meter.to - b.meter.from) * (1 - Math.pow(1 - t, 2)));
      const i = Math.min(b.msgs.length - 1, Math.floor(t * b.msgs.length));
      if (i !== mi) { mi = i; const m = $('#cookMsg'); m.textContent = b.msgs[i]; replay(m, 'in'); }
      if (b.scene === 'iron') cook.classList.toggle('closed', t > 0.12 && t < 0.62);
      if (b.effect && t > 0.4) c.classList.add(b.effect);
      if (t < 1) requestAnimationFrame(f);
      else setTimeout(showResult, 350);
    };
    requestAnimationFrame(f);
  }

  function showResult() {
    const cook = $('#cook');
    cook.classList.remove('show');
    setTimeout(() => { cook.hidden = true; }, 450);

    const holder = $('#resultPizza');
    holder.innerHTML = '';
    const c = cloneSvg();
    if (product.onBakeClone) product.onBakeClone(c);
    if (product.bake.effect) c.classList.add(product.bake.effect);
    holder.append(c);
    $('#resultEyebrow').textContent = `Masa 7 · ${product.brand}`;
    $('#resultName').textContent = state.name;
    $('#shareBadge').style.display = state.share ? '' : 'none';
    const rows = product.steps.filter((st) => st.kind !== 'name').map((st) => {
      if (st.kind === 'single') { const o = optOf(st, state.sel[st.id]); return [st.label, o ? o.name : '—']; }
      const names = state.multi[st.id].map((id) => optOf(st, id).name);
      return [st.label, names.length ? names.join(', ') : 'Yok'];
    });
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
    let icons = [];
    product.steps.forEach((st) => { if (st.kind === 'multi') state.multi[st.id].forEach((id) => icons.push(optOf(st, id).icon)); });
    if (!icons.length) icons = product.orbit.map((id) => findIcon(product, id)).filter(Boolean);
    const W = Math.min(window.innerWidth, 760);
    for (let i = 0; i < 30; i++) {
      const d = document.createElement('div');
      d.className = 'cf';
      d.innerHTML = `<svg viewBox="-18 -18 36 36">${pick(icons)}</svg>`;
      const a = rand(0, Math.PI * 2), r = rand(90, W * 0.6);
      d.style.setProperty('--x', Math.cos(a) * r + 'px');
      d.style.setProperty('--y', Math.sin(a) * r * 0.7 + rand(120, 300) + 'px');
      d.style.setProperty('--r', rand(-400, 400) + 'deg');
      d.style.animationDelay = rand(0, 160) + 'ms';
      document.body.append(d);
      setTimeout(() => d.remove(), 2100);
    }
  }

  // ---------- atölye menüsü ----------
  function buildMenu() {
    $('#menuGrid').innerHTML = products.map((p) => `
      <button class="mcard" data-p="${p.id}" style="--a:${p.theme.accent};--a2:${p.theme.accent2}">
        <span class="mcard-art"></span>
        <span class="mcard-txt"><b>${p.label}</b><small>${p.tagline}</small></span>
        <span class="mcard-on">Açık</span>
      </button>`).join('');
    products.forEach((p) => { $(`.mcard[data-p="${p.id}"] .mcard-art`).append(heroes[p.id].cloneNode(true)); });
    $('#menuGrid').addEventListener('click', (e) => {
      const b = e.target.closest('.mcard');
      if (b) switchTo(b.dataset.p);
    });
  }
  function markMenu() {
    document.querySelectorAll('.mcard').forEach((m) => m.classList.toggle('on', m.dataset.p === product.id));
  }
  function openMenu() {
    const m = $('#menu');
    m.hidden = false;
    requestAnimationFrame(() => m.classList.add('show'));
    buzz(8);
  }
  function closeMenu() {
    const m = $('#menu');
    m.classList.remove('show');
    setTimeout(() => { m.hidden = true; }, 350);
  }
  function switchTo(id) {
    closeMenu();
    if (product && id === product.id) return;
    const app = $('#app');
    app.classList.add('switching');
    $('#result').hidden = true;
    $('#result').classList.remove('show');
    setTimeout(() => {
      loadProduct(id);
      app.classList.remove('switching');
      showSplash();
    }, 260);
  }
  $('#cornerSwitch').addEventListener('click', openMenu);
  $('#menu').addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeMenu(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#menu').hidden) closeMenu(); });
  window.addEventListener('hashchange', () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (byId(products, id) && id !== product.id) switchTo(id);
  });

  // ---------- toast ----------
  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }

  // ---------- olaylar ----------
  function go(i) {
    if (i < 0 || i >= product.steps.length || i === state.step) return;
    if (product.spin) { turn += (i - state.step) * 34; setTurn(); }
    state.step = i;
    renderPanel();
    buzz(8);
  }
  $('#next').addEventListener('click', () => {
    if (state.step === product.steps.length - 1) bake();
    else go(state.step + 1);
  });
  $('#back').addEventListener('click', () => go(state.step - 1));
  $('#stepper').addEventListener('click', (e) => { const b = e.target.closest('.st'); if (b) go(+b.dataset.i); });

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
    try { list = JSON.parse(localStorage.getItem('lab.saved') || '[]'); } catch (_) { list = []; }
    list.push({ product: product.id, name: state.name, sel: state.sel, multi: state.multi, price: total(), at: Date.now() });
    try {
      localStorage.setItem('lab.saved', JSON.stringify(list));
      toast(`Kaydedildi · Bu cihazda ${list.length} tarif`);
    } catch (_) { toast('Bu tarayıcıda kaydedilemedi'); }
    b.textContent = 'Kaydedildi';
    b.disabled = true;
  });
  $('#restart').addEventListener('click', () => {
    const r = $('#result');
    r.classList.remove('show');
    setTimeout(() => { r.hidden = true; }, 400);
    loadProduct(product.id);
    replay(turnEl, 'intro');
  });

  // ---------- başlat ----------
  products.forEach((p) => { heroes[p.id] = buildHero(p); });
  buildMenu();
  const initial = decodeURIComponent(location.hash.slice(1));
  loadProduct(byId(products, initial) ? initial : 'pizza');
  fit();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
})();
