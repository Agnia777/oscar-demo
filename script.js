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
