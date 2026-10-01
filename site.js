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

  function init() {
    apply();
    initMenu();
    buildCalma();
    initReveal();
    icons();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
