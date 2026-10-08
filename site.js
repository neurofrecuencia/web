/* Neurofrecuencia · comportamiento compartido: Modo calma, aparición suave, menú móvil e iconos */
(function () {
  'use strict';
  var KEY = 'nf-calma';
  var root = document.documentElement;
  var reduceMQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* sin almacenamiento: no pasa nada */ } }

  var state = load();
  if (state.mov === undefined) state.mov = reduceMQ.matches;

  function apply() {
    root.classList.toggle('calma-mov', !!state.mov);
    root.classList.toggle('calma-contraste', !!state.contraste);
    root.classList.toggle('calma-texto', !!state.texto);
  }

  /* ---------- Modo calma ---------- */
  var OPTIONS = [
    ['mov', 'Reducir movimiento', 'Sin animaciones ni efectos de aparición'],
    ['contraste', 'Alto contraste', 'Textos y bordes más marcados'],
    ['texto', 'Texto más grande', 'Letra más grande en toda la página']
  ];

  function buildCalma() {
    var wrap = document.createElement('div');
    wrap.className = 'calma-wrap';
    var items = OPTIONS.map(function (o) {
      return '<li><button type="button" class="calma-switch" role="switch" data-key="' + o[0] + '" aria-checked="false">' +
        '<span>' + o[1] + '<small>' + o[2] + '</small></span><span class="track" aria-hidden="true"></span></button></li>';
    }).join('');
    wrap.innerHTML =
      '<div id="calma-panel" class="calma-panel" role="dialog" aria-labelledby="calma-title" hidden>' +
        '<div class="calma-head">' +
          '<img src="sparkie-sm.png" alt="" width="44" height="44">' +
          '<div><h2 id="calma-title">Modo calma</h2><p>Sparkie te ayuda a sentirte a gusto</p></div>' +
          '<button type="button" class="calma-close" aria-label="Cerrar ajustes">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
          '</button>' +
        '</div>' +
        '<ul class="calma-list">' + items + '</ul>' +
        '<div class="calma-actions"><button type="button" data-act="all">Activar todo</button><button type="button" data-act="reset">Restablecer</button></div>' +
        '<p class="calma-note">Tus ajustes se guardan solo en este dispositivo.</p>' +
      '</div>' +
      '<button type="button" id="calma-btn" class="calma-btn" aria-expanded="false" aria-controls="calma-panel" aria-label="Modo calma: ajustes de comodidad">' +
        '<img src="sparkie-sm.png" alt="" width="48" height="48"><span class="calma-label">Modo calma</span>' +
      '</button>';
    document.body.appendChild(wrap);

    var btn = wrap.querySelector('#calma-btn');
    var panel = wrap.querySelector('#calma-panel');
    var switches = wrap.querySelectorAll('.calma-switch');

    function paint() {
      switches.forEach(function (s) { s.setAttribute('aria-checked', String(!!state[s.dataset.key])); });
    }
    function setOpen(open, returnFocus) {
      panel.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      if (open) { var first = panel.querySelector('.calma-switch'); if (first) first.focus(); }
      else if (returnFocus) btn.focus();
    }

    btn.addEventListener('click', function () { setOpen(panel.hidden, false); });
    wrap.querySelector('.calma-close').addEventListener('click', function () { setOpen(false, true); });
    switches.forEach(function (s) {
      s.addEventListener('click', function () {
        state[s.dataset.key] = !state[s.dataset.key];
        save(state); apply(); paint();
      });
    });
    wrap.querySelectorAll('.calma-actions button').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.dataset.act === 'all') state = { mov: true, contraste: true, texto: true };
        else state = { mov: reduceMQ.matches, contraste: false, texto: false };
        save(state); apply(); paint();
      });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) setOpen(false, true); });
    document.addEventListener('click', function (e) { if (!panel.hidden && !wrap.contains(e.target)) setOpen(false, false); });
    paint();
  }

  /* ---------- Aparición suave al hacer scroll ---------- */
  function mark(el, i) {
    if (!el || el.hasAttribute('data-no-reveal') || el.classList.contains('reveal')) return;
    el.classList.add('reveal');
    if (i) el.style.transitionDelay = (Math.min(i, 4) * 80) + 'ms';
  }
  function tagChildren(container) {
    Array.prototype.forEach.call(container.children, function (el) {
      if (el.classList.contains('grid')) Array.prototype.forEach.call(el.children, function (c, i) { mark(c, i); });
      else mark(el, 0);
    });
  }
  function initReveal() {
    document.querySelectorAll('main section:not(#inicio) > div').forEach(tagChildren);
    document.querySelectorAll('main > div').forEach(tagChildren);
    var targets = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (t) { t.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (t) { io.observe(t); });
  }

  /* ---------- Iconos y menú móvil ---------- */
  function icons() { if (window.lucide) window.lucide.createIcons(); }

  function initMenu() {
    var toggle = document.getElementById('menu-toggle');
    var menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;
    function setOpen(open) {
      menu.classList.toggle('hidden', !open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      toggle.innerHTML = '<i data-lucide="' + (open ? 'x' : 'menu') + '" class="w-6 h-6"></i>';
      icons();
    }
    toggle.addEventListener('click', function () { setOpen(toggle.getAttribute('aria-expanded') !== 'true'); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 768) setOpen(false); });
  }

  /* ---------- Cal.com: el calendario se abre en una ventana dentro de la página ---------- */
  var calState = 'idle'; // idle | loading | ready | failed
  var calWaiters = [];
  function calSettle(ok) {
    calState = ok ? 'ready' : 'failed';
    calWaiters.splice(0).forEach(function (fn) { fn(ok); });
  }
  function loadCal() {
    if (calState !== 'idle') return;
    calState = 'loading';
    (function (C, A, L) {
      var p = function (a, ar) { a.q.push(ar); };
      var d = C.document;
      C.Cal = C.Cal || function () {
        var cal = C.Cal; var ar = arguments;
        if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement('script')).src = A; cal.loaded = true; }
        if (ar[0] === L) {
          var api = function () { p(api, arguments); };
          var namespace = ar[1]; api.q = api.q || [];
          if (typeof namespace === 'string') { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ['initNamespace', namespace]); }
          else p(cal, ar);
          return;
        }
        p(cal, ar);
      };
    })(window, 'https://app.cal.com/embed/embed.js', 'init');
    window.Cal('init', { origin: 'https://cal.com' });
    window.Cal('ui', { theme: 'light', cssVarsPerTheme: { light: { 'cal-brand': '#0044FF' }, dark: { 'cal-brand': '#9D26B0' } }, hideEventTypeDetails: false, layout: 'month_view' });
    var s = document.querySelector('script[src="https://app.cal.com/embed/embed.js"]');
    if (!s) { calSettle(false); return; }
    s.addEventListener('load', function () { calSettle(true); });
    s.addEventListener('error', function () { calSettle(false); });
  }
  function calLinkOf(a) { return (a.getAttribute('href') || '').replace(/^https:\/\/cal\.com\//, ''); }
  function openCal(a) { window.Cal('modal', { calLink: calLinkOf(a), config: { layout: 'month_view' } }); }

  function initCal() {
    var links = document.querySelectorAll('a[href^="https://cal.com/"]');
    if (!links.length) return;
    links.forEach(function (a) {
      ['pointerenter', 'focus', 'touchstart'].forEach(function (ev) { a.addEventListener(ev, loadCal, { once: true, passive: true }); });
      a.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // respeta "abrir en pestaña nueva"
        loadCal();
        if (calState === 'ready') { e.preventDefault(); openCal(a); }
        else if (calState === 'loading') {
          e.preventDefault();
          var t = setTimeout(function () { window.location.href = a.href; }, 3000);
          calWaiters.push(function (ok) { clearTimeout(t); if (ok) openCal(a); else window.location.href = a.href; });
        } // si falló (bloqueador de anuncios, sin red), el enlace abre Cal.com normalmente
      });
    });
    (window.requestIdleCallback || function (f) { return setTimeout(f, 2500); })(loadCal, { timeout: 4000 });
  }

  /* ---------- Blog: últimas entradas de Blogger ---------- */
  var BLOG_URL = 'https://neurofrecuencia.blogspot.com';
  var LABELS = { neurodivergencia: 'Neurodivergencia', cajadeherramientas: 'Caja de herramientas', historiasquecontar: 'Historias que contar' };

  function node(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }
  function plain(html) { return new DOMParser().parseFromString(html || '', 'text/html').body.textContent.replace(/\s+/g, ' ').trim(); }
  function excerpt(t, n) { return t.length <= n ? t : t.slice(0, n).replace(/\s+\S*$/, '') + '…'; }
  function firstImage(html) { var m = /<img[^>]+src=["']([^"']+)["']/i.exec(html || ''); return m ? m[1] : null; }
  function sized(u) { return u.replace(/\/(?:s\d+|w\d+-h\d+)(?:-[a-z]+)*\//, '/w800-h450-c/').replace(/=s\d+(-c)?$/, '=w800-h450-c'); }
  var ARROW = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  function parsePost(e) {
    var link = (e.link || []).filter(function (l) { return l.rel === 'alternate'; })[0];
    var html = (e.content && e.content.$t) || (e.summary && e.summary.$t) || '';
    var text = plain(html);
    var img = firstImage(html) || (e.media$thumbnail && e.media$thumbnail.url) || null;
    var cat = e.category && e.category[0] && e.category[0].term;
    return {
      title: e.title.$t, url: link && link.href, text: text, cat: cat,
      date: new Date(e.published.$t), img: img ? sized(img) : null,
      mins: e.content ? Math.max(1, Math.round(text.split(' ').length / 200)) : 0
    };
  }

  function fallbackCover(i) {
    var c = node('div', 'blog-cover is-fallback tone-' + (i % 3));
    var im = node('img', 'blog-cover-sparkie'); im.src = 'sparkie-sm.png'; im.alt = ''; im.width = 144; im.height = 144;
    c.appendChild(im);
    return c;
  }

  function postCard(p, i, featured) {
    var a = node('a', 'blog-card' + (featured ? ' is-featured' : ''));
    a.href = p.url;
    var cover;
    if (p.img) {
      cover = node('div', 'blog-cover');
      var im = node('img'); im.src = p.img; im.alt = ''; im.loading = 'lazy'; im.decoding = 'async';
      im.addEventListener('error', function () { cover.replaceWith(fallbackCover(i)); });
      cover.appendChild(im);
    } else cover = fallbackCover(i);
    a.appendChild(cover);

    var body = node('div', 'blog-body');
    var meta = node('p', 'blog-meta');
    if (p.cat) meta.appendChild(node('span', 'blog-pill', LABELS[p.cat.toLowerCase()] || p.cat));
    meta.appendChild(node('span', '', p.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })));
    if (p.mins) meta.appendChild(node('span', '', p.mins + ' min de lectura'));
    body.appendChild(meta);
    body.appendChild(node('h3', 'blog-title', p.title));
    body.appendChild(node('p', 'blog-excerpt', excerpt(p.text, featured ? 260 : 150)));
    var more = node('span', 'blog-more', 'Seguir leyendo '); more.insertAdjacentHTML('beforeend', ARROW);
    body.appendChild(more);
    a.appendChild(body);
    return a;
  }

  function softCard(title, text) {
    var a = node('a', 'blog-card is-soon'); a.href = BLOG_URL;
    var im = node('img', 'blog-soon-sparkie sparkie-float'); im.src = 'sparkie-sm.png'; im.alt = ''; im.width = 144; im.height = 144;
    a.appendChild(im);
    a.appendChild(node('h3', 'blog-title', title));
    a.appendChild(node('p', 'blog-excerpt', text));
    var more = node('span', 'blog-more', 'Visitar el blog '); more.insertAdjacentHTML('beforeend', ARROW);
    a.appendChild(more);
    return a;
  }

  function renderPosts(grid, posts) {
    grid.setAttribute('aria-busy', 'false');
    while (grid.firstChild) grid.removeChild(grid.firstChild);
    var items = [];
    if (posts.length === 0) items.push(softCard('Muy pronto, nuevas lecturas', 'Sparkie y yo estamos preparando las primeras entradas. Pásate por el blog cuando quieras.'));
    else if (posts.length === 1) items.push(postCard(posts[0], 0, true));
    else {
      posts.forEach(function (p, i) { items.push(postCard(p, i, false)); });
      if (posts.length === 2) items.push(softCard('Pronto, más lecturas', 'Estamos preparando nuevas entradas para tu ritmo.'));
    }
    grid.className = 'blog-grid' + (items.length === 1 ? ' is-single' : '');
    items.forEach(function (n) { n.classList.add('blog-in'); grid.appendChild(n); });
    var wrap = grid.parentNode;
    if (posts.length === 1 && !wrap.querySelector('.blog-note')) {
      var note = node('div', 'sparkie-says blog-note');
      note.innerHTML = '<img src="sparkie-sm.png" alt="" width="60" height="60" loading="lazy"><p class="bubble"><strong>Sparkie dice:</strong> Pronto habrá más lecturas por aquí.</p>';
      grid.insertAdjacentElement('afterend', note);
    }
  }

  function loadBlog() {
    var grid = document.getElementById('blog-posts');
    if (!grid) return;
    var feed = BLOG_URL + '/feeds/posts/default?max-results=3';
    var done = false;
    function ok(d) { if (done) return; done = true; renderPosts(grid, ((d && d.feed && d.feed.entry) || []).map(parsePost).filter(function (p) { return p.url; })); }
    function fail() { if (done) return; done = true; renderPosts(grid, []); }
    function jsonp() {
      window.__nfBlog = ok;
      var sc = document.createElement('script');
      sc.src = feed + '&alt=json-in-script&callback=__nfBlog';
      sc.onerror = fail;
      document.head.appendChild(sc);
      setTimeout(fail, 8000);
    }
    if (!window.fetch) return jsonp();
    fetch(feed + '&alt=json').then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(ok).catch(jsonp);
  }

  function init() {
    apply();
    initMenu();
    buildCalma();
    initReveal();
    initCal();
    loadBlog();
    icons();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
