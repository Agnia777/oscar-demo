// Слайдер «до / после»
(function () {
  var range = document.getElementById('ba-range');
  var before = document.getElementById('ba-before');
  var handle = document.getElementById('ba-handle');
  if (!range || !before || !handle) return;
  function update() {
    var pos = Number(range.value);
    before.style.clipPath = 'inset(0 ' + (100 - pos) + '% 0 0)';
    handle.style.left = pos + '%';
  }
  range.addEventListener('input', update);
  update();
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
