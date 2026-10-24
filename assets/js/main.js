/* ==========================================================================
   Ekrem Arslan - Portfolio interactions (vanilla JS, no dependencies)
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduceMotion = motionQuery.matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (reduceMotion) root.classList.add('no-motion');

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }

  /* ------------------------------------------------------------------
     Clock (Turkiye time) and footer year
     ------------------------------------------------------------------ */
  function initClock() {
    var el = $('[data-clock]');
    if (!el) return;
    var fmt;
    try {
      fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' });
    } catch (e) {
      fmt = null;
    }
    function tick() {
      var now = new Date();
      el.textContent = (fmt ? fmt.format(now) : now.toTimeString().slice(0, 5)) + ' GMT+3';
    }
    tick();
    setInterval(tick, 20000);
    var year = $('[data-year]');
    if (year) year.textContent = String(new Date().getFullYear());
  }

  /* ------------------------------------------------------------------
     Masthead state + scroll progress
     ------------------------------------------------------------------ */
  function initScroll() {
    var masthead = $('[data-masthead]');
    var bar = $('[data-progress]');
    var ticking = false;

    function update() {
      var y = window.scrollY || window.pageYOffset;
      var max = Math.max(1, root.scrollHeight - window.innerHeight);
      if (masthead) masthead.classList.toggle('is-scrolled', y > 12);
      if (bar) bar.style.transform = 'scaleX(' + Math.min(1, y / max).toFixed(4) + ')';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ------------------------------------------------------------------
     Mobile menu
     ------------------------------------------------------------------ */
  function initMenu() {
    var toggle = $('[data-menu-toggle]');
    var menu = $('[data-menu]');
    if (!toggle || !menu) return;
    var label = $('.menu-toggle__label', toggle);
    var main = $('#main');

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
      root.classList.toggle('menu-open', open);
      if (label) label.textContent = open ? 'Close' : 'Menu';
      if (main) {
        if (open) main.setAttribute('inert', ''); else main.removeAttribute('inert');
      }
      if (open) {
        var first = $('a', menu);
        if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 50);
      }
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    $$('a', menu).forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 960 && menu.classList.contains('is-open')) setOpen(false);
    });
  }

  /* ------------------------------------------------------------------
     Active section in navigation
     ------------------------------------------------------------------ */
  function initActiveNav() {
    var links = $$('[data-nav]');
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    links.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      (map[id] = map[id] || []).push(a);
    });
    var sections = Object.keys(map).map(function (id) { return doc.getElementById(id); }).filter(Boolean);

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
        (map[entry.target.id] || []).forEach(function (a) {
          a.classList.add('is-active');
          a.setAttribute('aria-current', 'location');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { io.observe(s); });

    // Clear the state when back in the hero.
    var hero = $('[data-hero]');
    if (hero) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          links.forEach(function (a) { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
        }
      }, { rootMargin: '-45% 0px -50% 0px' }).observe(hero);
    }
  }

  /* ------------------------------------------------------------------
     Reveal on scroll
     ------------------------------------------------------------------ */
  function initReveal() {
    var items = $$('[data-reveal]');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------
     Hero ambient light following the pointer
     ------------------------------------------------------------------ */
  function initHeroLight() {
    var hero = $('[data-hero]');
    if (!hero || !finePointer || reduceMotion) return;
    var raf = 0;
    hero.addEventListener('pointermove', function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        var r = hero.getBoundingClientRect();
        hero.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        hero.style.setProperty('--my', (e.clientY - r.top) + 'px');
        raf = 0;
      });
    });
  }

  /* ------------------------------------------------------------------
     Subtle parallax for the Rotiva map layers
     ------------------------------------------------------------------ */
  function initTilt() {
    if (!finePointer || reduceMotion) return;
    $$('[data-tilt]').forEach(function (box) {
      var layers = $$('[data-depth]', box);
      box.addEventListener('pointermove', function (e) {
        var r = box.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        layers.forEach(function (g) {
          var d = parseFloat(g.getAttribute('data-depth')) || 0;
          g.style.transform = 'translate(' + (px * d).toFixed(2) + 'px,' + (py * d).toFixed(2) + 'px)';
        });
      });
      box.addEventListener('pointerleave', function () {
        layers.forEach(function (g) { g.style.transform = ''; });
      });
    });
  }

  /* ------------------------------------------------------------------
     Copy email
     ------------------------------------------------------------------ */
  function initCopy() {
    $$('[data-copy]').forEach(function (btn) {
      var label = $('[data-copy-label]', btn);
      var status = $('[data-copy-status]');
      var original = label ? label.textContent : '';
      var timer = 0;

      function done(ok) {
        if (label) label.textContent = ok ? 'Copied' : 'Press Ctrl+C';
        if (status) status.textContent = ok ? 'Email address copied to clipboard.' : 'Copy failed. Please copy the address manually.';
        btn.classList.toggle('is-done', ok);
        clearTimeout(timer);
        timer = setTimeout(function () {
          if (label) label.textContent = original;
          btn.classList.remove('is-done');
        }, 2200);
      }

      function fallback(text) {
        var ta = doc.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        doc.body.appendChild(ta);
        ta.select();
        var ok = false;
        try { ok = doc.execCommand('copy'); } catch (e) { ok = false; }
        doc.body.removeChild(ta);
        return ok;
      }

      btn.addEventListener('click', function () {
        var text = btn.getAttribute('data-copy');
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallback(text)); });
        } else {
          done(fallback(text));
        }
      });
    });
  }

  /* ------------------------------------------------------------------
     Fig. 01 - live route optimization
     Random points -> nearest-neighbour tour -> 2-opt improvement.
     Every number shown is computed live in the browser.
     ------------------------------------------------------------------ */
  function initRouteFigure() {
    var fig = $('[data-route-fig]');
    var svg = $('[data-route-svg]');
    if (!fig || !svg) return;
    var meta = $('[data-route-meta]');
    var btn = $('[data-reroute]');
    var NS = 'http://www.w3.org/2000/svg';
    var W = 600, H = 420, PAD = 42;
    var N = 14;
    var seed = 12;
    var token = null, routePath = null, routeLen = 0;
    var nodeEls = [];
    var tour = [];
    var pts = [];
    var animId = 0, startTime = 0, visible = true;
    var drawTimers = [];

    function el(name, attrs, parent) {
      var n = doc.createElementNS(NS, name);
      for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) n.setAttribute(k, attrs[k]);
      if (parent) parent.appendChild(n);
      return n;
    }

    function rng(a) {
      return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        var t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }

    function dist(a, b) { var dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); }

    function genPoints(rand) {
      var out = [], tries = 0, minD = 62;
      while (out.length < N && tries < 6000) {
        tries++;
        var p = { x: PAD + rand() * (W - 2 * PAD), y: PAD + rand() * (H - 2 * PAD) };
        var ok = true;
        for (var i = 0; i < out.length; i++) if (dist(p, out[i]) < minD) { ok = false; break; }
        if (ok) out.push(p);
      }
      return out;
    }

    function nearestNeighbour(p) {
      var n = p.length, used = new Array(n), order = [0];
      used[0] = true;
      for (var s = 1; s < n; s++) {
        var last = p[order[order.length - 1]], best = -1, bd = Infinity;
        for (var j = 0; j < n; j++) {
          if (used[j]) continue;
          var d = dist(last, p[j]);
          if (d < bd) { bd = d; best = j; }
        }
        used[best] = true;
        order.push(best);
      }
      return order;
    }

    function twoOpt(p, order) {
      var o = order.slice(), n = o.length, improved = true, guard = 0;
      while (improved && guard < 200) {
        improved = false; guard++;
        for (var i = 1; i < n - 1; i++) {
          for (var k = i + 1; k < n; k++) {
            var a = p[o[i - 1]], b = p[o[i]], c = p[o[k]], d = p[o[(k + 1) % n]];
            var delta = dist(a, c) + dist(b, d) - dist(a, b) - dist(c, d);
            if (delta < -1e-7) {
              var seg = o.slice(i, k + 1).reverse();
              for (var m = 0; m < seg.length; m++) o[i + m] = seg[m];
              improved = true;
            }
          }
        }
      }
      return o;
    }

    function tourLength(p, o) {
      var L = 0;
      for (var i = 0; i < o.length; i++) L += dist(p[o[i]], p[o[(i + 1) % o.length]]);
      return L;
    }

    function pathFor(p, o) {
      var d = 'M' + p[o[0]].x.toFixed(1) + ' ' + p[o[0]].y.toFixed(1);
      for (var i = 1; i < o.length; i++) d += 'L' + p[o[i]].x.toFixed(1) + ' ' + p[o[i]].y.toFixed(1);
      return d + 'Z';
    }

    function clearTimers() {
      drawTimers.forEach(clearTimeout);
      drawTimers = [];
      cancelAnimationFrame(animId);
      animId = 0;
    }

    function build() {
      clearTimers();
      var nn, nnLen, optLen, attempt = 0;
      do {
        var rand = rng(seed + attempt);
        pts = genPoints(rand);
        nn = nearestNeighbour(pts);
        nnLen = tourLength(pts, nn);
        tour = twoOpt(pts, nn);
        optLen = tourLength(pts, tour);
        attempt++;
      } while (nnLen - optLen < 60 && attempt < 25);
      seed = seed + attempt - 1;

      // Wipe everything except <title>/<desc>.
      $$('svg > :not(title):not(desc)', fig).forEach(function (n) { n.parentNode.removeChild(n); });

      var defs = el('defs', {}, svg);
      var grad = el('linearGradient', { id: 'rfGrad', x1: '0', y1: '0', x2: '1', y2: '1' }, defs);
      el('stop', { offset: '0', 'stop-color': '#7d9bff' }, grad);
      el('stop', { offset: '1', 'stop-color': '#a78bfa' }, grad);

      // Dot grid
      var g0 = el('g', {}, svg);
      for (var gx = 20; gx < W; gx += 40) {
        for (var gy = 20; gy < H; gy += 40) el('circle', { cx: gx, cy: gy, r: 0.9, 'class': 'rf-dot' }, g0);
      }

      // Candidate network: each node to its 3 nearest neighbours
      var gE = el('g', {}, svg), seen = {};
      pts.forEach(function (p, i) {
        var near = pts.map(function (q, j) { return { j: j, d: i === j ? Infinity : dist(p, q) }; })
          .sort(function (a, b) { return a.d - b.d; }).slice(0, 3);
        near.forEach(function (nb) {
          var key = Math.min(i, nb.j) + '-' + Math.max(i, nb.j);
          if (seen[key]) return;
          seen[key] = true;
          el('line', { x1: p.x, y1: p.y, x2: pts[nb.j].x, y2: pts[nb.j].y, 'class': 'rf-edge' }, gE);
        });
      });

      var nnPath = el('path', { d: pathFor(pts, nn), 'class': 'rf-nn' }, svg);
      routePath = el('path', { d: pathFor(pts, tour), 'class': 'rf-route' }, svg);
      routeLen = routePath.getTotalLength();

      // Nodes
      var gN = el('g', {}, svg);
      nodeEls = new Array(pts.length);
      tour.forEach(function (idx, step) {
        var p = pts[idx];
        var isStart = step === 0;
        var g = el('g', { 'class': 'rf-node' + (isStart ? ' rf-node--start' : '') }, gN);
        if (isStart) el('circle', { cx: p.x, cy: p.y, r: 11, 'class': 'rf-ring' }, gN);
        el('circle', { cx: p.x, cy: p.y, r: isStart ? 5 : 3.6 }, g);
        var t = el('text', { x: p.x + 9, y: p.y - 8 }, g);
        t.textContent = isStart ? 'S' : (step < 10 ? '0' : '') + step;
        nodeEls[idx] = g;
      });

      token = el('circle', { r: 3.4, 'class': 'rf-token', opacity: 0 }, svg);

      var gain = nnLen > 0 ? (1 - optLen / nnLen) * 100 : 0;
      if (meta) {
        meta.innerHTML = 'n=' + pts.length + ' &middot; NN ' + Math.round(nnLen) +
          ' &rarr; 2-opt <b>' + Math.round(optLen) + '</b>' +
          (gain > 0.05 ? ' (&minus;' + gain.toFixed(1) + '%)' : '');
      }

      if (reduceMotion) {
        nnPath.classList.add('is-on', 'is-faded');
        return;
      }

      // Sequence: show first guess, then draw the improved route, then send a token around it.
      routePath.style.strokeDasharray = routeLen + ' ' + routeLen;
      routePath.style.strokeDashoffset = String(routeLen);
      drawTimers.push(setTimeout(function () { nnPath.classList.add('is-on'); }, 250));
      drawTimers.push(setTimeout(function () {
        nnPath.classList.add('is-faded');
        routePath.style.transition = 'stroke-dashoffset 2.4s cubic-bezier(.65,0,.35,1)';
        routePath.getBoundingClientRect();
        routePath.style.strokeDashoffset = '0';
      }, 1150));
      drawTimers.push(setTimeout(function () {
        token.setAttribute('opacity', '1');
        startTime = performance.now();
        loop();
      }, 3600));
    }

    function loop() {
      if (!visible || !routePath) { animId = 0; return; }
      var speed = 70; // svg units per second
      var t = ((performance.now() - startTime) / 1000 * speed) % routeLen;
      var pt = routePath.getPointAtLength(t);
      token.setAttribute('cx', pt.x.toFixed(2));
      token.setAttribute('cy', pt.y.toFixed(2));
      // highlight node when the token passes it
      for (var i = 0; i < pts.length; i++) {
        var near = Math.abs(pts[i].x - pt.x) < 7 && Math.abs(pts[i].y - pt.y) < 7;
        if (nodeEls[i]) nodeEls[i].classList.toggle('is-hit', near);
      }
      animId = requestAnimationFrame(loop);
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible && !animId && !reduceMotion && token && token.getAttribute('opacity') === '1') loop();
      }).observe(fig);
    }

    if (btn) {
      btn.addEventListener('click', function () {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        build();
      });
    }

    build();
  }

  /* ------------------------------------------------------------------ */
  function init() {
    initClock();
    initScroll();
    initMenu();
    initActiveNav();
    initReveal();
    initHeroLight();
    initTilt();
    initCopy();
    initRouteFigure();
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})();
