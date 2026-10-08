var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var canHover = window.matchMedia('(hover: hover)').matches;

// Индикатор прокрутки и «прилипшая» шапка
(function () {
  var bar = document.getElementById('progress');
  var header = document.querySelector('.site-header');
  var ticking = false;
  function update() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? window.scrollY / max : 0;
    if (bar) bar.style.setProperty('--p', Math.min(1, Math.max(0, p)));
    if (header) header.classList.toggle('scrolled', window.scrollY > 24);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
})();

// Появление блоков при прокрутке со ступенчатой задержкой
(function () {
  var items = document.querySelectorAll('.reveal');
  var groups = new Map();
  items.forEach(function (el) {
    var parent = el.parentElement;
    var i = groups.get(parent) || 0;
    el.style.setProperty('--d', Math.min(i, 5) * 90 + 'ms');
    groups.set(parent, i + 1);
  });
  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  items.forEach(function (el) { io.observe(el); });
})();

// Счётчики в блоке с цифрами
(function () {
  var nums = document.querySelectorAll('[data-count]');
  function format(n) { return n >= 1000 ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : String(n); }
  function run(el) {
    var target = Number(el.dataset.count);
    var suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = format(target) + suffix; return; }
    var start = performance.now();
    var dur = 1600;
    (function tick(now) {
      var t = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = format(Math.round(target * eased)) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    })(start);
  }
  if (reduceMotion || !('IntersectionObserver' in window)) { nums.forEach(run); return; }
  nums.forEach(function (el) { el.textContent = '0' + (el.dataset.suffix || ''); });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { run(entry.target); io.unobserve(entry.target); }
    });
  }, { threshold: 0.6 });
  nums.forEach(function (el) { io.observe(el); });
})();

// Наклон карточек за курсором и подсветка
(function () {
  if (reduceMotion || !canHover) return;
  document.querySelectorAll('.tilt').forEach(function (el) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width;
      var y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--ry', ((x - 0.5) * 10).toFixed(2) + 'deg');
      el.style.setProperty('--rx', ((0.5 - y) * 10).toFixed(2) + 'deg');
      el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
    });
    el.addEventListener('pointerleave', function () {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  });
})();

// Слайдер «до / после»: сам покачивается, когда появляется на экране
(function () {
  var range = document.getElementById('ba-range');
  var before = document.getElementById('ba-before');
  var handle = document.getElementById('ba-handle');
  var box = document.getElementById('ba');
  if (!range || !before || !handle) return;
  function set(pos) {
    range.value = pos;
    before.style.clipPath = 'inset(0 ' + (100 - pos) + '% 0 0)';
    handle.style.left = pos + '%';
  }
  var userTouched = false;
  range.addEventListener('input', function () { userTouched = true; set(Number(range.value)); });
  set(50);
  if (reduceMotion || !box || !('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting) return;
    io.disconnect();
    var start = performance.now();
    var dur = 3200;
    (function tick(now) {
      if (userTouched) return;
      var t = Math.min(1, (now - start) / dur);
      set(Math.round(50 + Math.sin(t * Math.PI * 2) * 40 * (1 - t * 0.2)));
      if (t < 1) requestAnimationFrame(tick); else set(50);
    })(start);
  }, { threshold: 0.6 });
  io.observe(box);
})();

// Демо-форма записи: данные никуда не отправляются
(function () {
  var form = document.getElementById('booking-form');
  var status = document.getElementById('form-status');
  if (!form || !status) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var phone = form.elements.phone.value.trim();
    if (!phone) {
      status.textContent = 'Укажите телефон, чтобы мы могли перезвонить.';
      form.elements.phone.focus();
      return;
    }
    status.textContent = 'Спасибо! Это демо-форма, заявка никуда не отправлена.';
    form.reset();
  });
})();

// Временный переключатель фона: ?bg=1..5 или кнопки внизу слева
(function () {
  var root = document.documentElement;
  var buttons = document.querySelectorAll('.bg-picker [data-bg]');
  var saved = null;
  try { saved = localStorage.getItem('bg'); } catch (e) {}
  var fromUrl = new URLSearchParams(location.search).get('bg');
  function apply(v) {
    root.dataset.bg = v;
    buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.bg === v)); });
    try { localStorage.setItem('bg', v); } catch (e) {}
  }
  apply(/^[1-5]$/.test(fromUrl) ? fromUrl : (/^[1-5]$/.test(saved) ? saved : '2'));
  buttons.forEach(function (b) { b.addEventListener('click', function () { apply(b.dataset.bg); }); });
})();
