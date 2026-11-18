// Ortak yardımcılar + ürün kaydı. Her ürün dosyası PL.register({...}) ile kendini ekler.
window.PL = (() => {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const byId = (list, id) => list.find((x) => x.id === id);
  const tl = (n) => '₺' + Math.round(n).toLocaleString('tr-TR');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function el(tag, attrs = {}) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  // Organik daire / elips
  function blob(r, amp, seed, cx = 200, cy = 200, pts = 90, ry = r) {
    let d = '';
    for (let i = 0; i < pts; i++) {
      const a = (i / pts) * Math.PI * 2;
      const n = Math.sin(a * 3 + seed) * 0.5 + Math.sin(a * 5 + seed * 1.7) * 0.3 + Math.sin(a * 11 + seed * 0.6) * 0.2;
      const k = 1 + (n * amp) / r;
      d += (i ? 'L' : 'M') + (cx + Math.cos(a) * r * k).toFixed(1) + ' ' + (cy + Math.sin(a) * ry * k).toFixed(1);
    }
    return d + 'Z';
  }

  function randInCircle(R, cx = 200, cy = 200) {
    const a = rand(0, Math.PI * 2);
    const r = R * Math.sqrt(Math.random());
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  }
  function randInEllipse(rx, ry, cx = 200, cy = 200) {
    const a = rand(0, Math.PI * 2);
    const s = Math.sqrt(Math.random());
    return { x: cx + Math.cos(a) * rx * s, y: cy + Math.sin(a) * ry * s };
  }
  const regions = {
    circle: (R, cx = 200, cy = 200) => {
      const r = () => (typeof R === 'function' ? R() : R);
      return { rand: () => randInCircle(r(), cx, cy), contains: (p) => Math.hypot(p.x - cx, p.y - cy) <= r() };
    },
    ellipse: (rx, ry, cx = 200, cy = 200) => ({
      rand: () => randInEllipse(rx, ry, cx, cy),
      contains: (p) => ((p.x - cx) / rx) ** 2 + ((p.y - cy) / ry) ** 2 <= 1,
    }),
    // Halka dilimi (bowl bölmeleri)
    wedge: (a0, a1, r0, r1, cx = 200, cy = 200) => ({
      rand: () => {
        const a = rand(a0, a1);
        const r = Math.sqrt(rand(r0 * r0, r1 * r1));
        return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
      },
      contains: (p) => {
        const r = Math.hypot(p.x - cx, p.y - cy);
        let a = Math.atan2(p.y - cy, p.x - cx);
        while (a < a0) a += Math.PI * 2;
        return r >= r0 && r <= r1 && a <= a1;
      },
    }),
  };

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
  const stopTween = (key) => cancelAnimationFrame(tweens[key]);

  // Malzemeleri bir bölgeye serpiştirir (pizza, waffle, kumpir, bowl...)
  class Scatter {
    constructor(group, region) { this.g = group; this.region = region; this.pieces = {}; }
    all() { return Object.values(this.pieces).flat(); }
    count(id) { return (this.pieces[id] || []).length; }
    place(at, existing, minD, region, spread) {
      let best = null;
      for (let tries = 0; tries < 40; tries++) {
        let p;
        if (at) {
          const a = rand(0, Math.PI * 2);
          const r = rand(0, spread);
          p = { x: at.x + Math.cos(a) * r, y: at.y + Math.sin(a) * r };
          if (spread && !region.contains(p)) continue;
        } else {
          p = region.rand();
        }
        best = p;
        const md = tries < 25 ? minD : minD / 2;
        if (existing.every((q) => Math.hypot(q.x - p.x, q.y - p.y) > md)) return p;
      }
      return best || region.rand();
    }
    add(id, draw, count, at, o = {}) {
      let g = this.g.querySelector(`g[data-id="${id}"]`);
      if (!g) { g = el('g', { 'data-id': id }); this.g.append(g); }
      const list = (this.pieces[id] = this.pieces[id] || []);
      const existing = this.all();
      const region = o.region || this.region;
      const spread = o.spread === undefined ? 58 : o.spread;
      for (let i = 0; i < count; i++) {
        const p = this.place(at, existing, o.minD || 24, region, spread);
        existing.push(p);
        list.push(p);
        const rot = o.rotate === false ? 0 : rand(0, 360);
        const sc = o.scale || 1;
        const outer = el('g', { transform: `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${rot.toFixed(0)}) scale(${sc})` });
        const inner = el('g', { class: 'piece' });
        inner.innerHTML = draw(i);
        if (o.instant) inner.style.animation = 'none';
        else inner.style.animationDelay = i * (o.stagger || 45) + 'ms';
        outer.append(inner);
        g.append(outer);
      }
    }
    remove(id) {
      delete this.pieces[id];
      const g = this.g.querySelector(`g[data-id="${id}"]`);
      if (!g) return;
      g.removeAttribute('data-id');
      g.querySelectorAll('.piece').forEach((p, i) => {
        p.style.animationDelay = Math.min(i, 20) * 20 + 'ms';
        p.classList.add('leave');
      });
      setTimeout(() => g.remove(), 700);
    }
    clear() { this.g.innerHTML = ''; this.pieces = {}; }
  }

  // Sos gezdirme (zikzak çizgi), çizilerek gelir
  function drizzle(group, color, seed, o = {}) {
    const cx = o.cx || 200, cy = o.cy || 200, rx = o.rx || 130, ry = o.ry || 130;
    const turns = o.turns || 6;
    const pts = [];
    for (let i = 0; i <= turns; i++) {
      const t = i / turns;
      const x = cx - rx * 0.92 + rx * 1.84 * t;
      const lim = ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2)) * 0.82;
      const y = cy + (i % 2 ? 1 : -1) * lim * (0.55 + 0.45 * Math.abs(Math.sin(seed * 2.3 + i)));
      pts.push([x, y]);
    }
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
      d += ` Q${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
    }
    const last = pts[pts.length - 1];
    d += ` L${last[0].toFixed(1)} ${last[1].toFixed(1)}`;
    const g = el('g', { transform: `rotate(${(o.rotate || 0).toFixed(1)} ${cx} ${cy})`, class: 'drizzle' });
    const main = el('path', { d, fill: 'none', stroke: color, 'stroke-width': o.width || 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    const hi = el('path', { d, fill: 'none', stroke: '#fff', 'stroke-opacity': 0.28, 'stroke-width': 1.6, 'stroke-linecap': 'round', transform: 'translate(-1.2 -1.4)' });
    g.append(main, hi);
    group.append(g);
    if (!o.instant) {
      [main, hi].forEach((p) => {
        const len = p.getTotalLength();
        p.style.strokeDasharray = len;
        p.style.strokeDashoffset = len;
        p.getBoundingClientRect();
        p.style.transition = 'stroke-dashoffset 1.1s cubic-bezier(.4,.1,.3,1)';
        p.style.strokeDashoffset = 0;
      });
    }
    return g;
  }

  // Seçenek kartı görselleri
  const sw = {
    color: (c) => `<i class="sw" style="--c:${c}"></i>`,
    blob: (c) => `<i class="sw blob" style="--c:${c}"></i>`,
    dots: (a, b) => `<i class="sw dots" style="--c1:${a};--c2:${b}"></i>`,
    ring: (a, b, c, base) => `<i class="sw ring" style="--a:${a};--b:${b};--c:${c};--base:${base}"></i>`,
    size: (s) => `<i class="sw size" style="--s:${s}"></i>`,
    none: () => '<i class="sw none"></i>',
    icon: (d, vb = '-18 -18 36 36') => `<svg class="sw-ic" viewBox="${vb}">${d}</svg>`,
  };

  const products = [];
  return {
    NS, rand, pick, byId, tl, esc, el, blob, randInCircle, randInEllipse, regions,
    tween, stopTween, Scatter, drizzle, sw, products,
    register: (p) => products.push(p),
    fx: { wobble() {}, puff() {} },
  };
})();
