(function () {
  var body = document.body;
  body.dataset.lang = body.dataset.lang || 'zh';
  function setLang(l) {
    body.dataset.lang = l;
    document.documentElement.lang = l === 'en' ? 'en' : 'zh-Hant';
    document.querySelectorAll('.lang button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.set === l));
    });
    try { localStorage.setItem('lang', l); } catch (e) {}
  }
  document.querySelectorAll('.lang button').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.dataset.set); });
  });
  var saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) {}
  if (saved === 'en' || saved === 'zh') setLang(saved);
  document.querySelectorAll('.logo img').forEach(function (img) {
    function ok() { img.parentNode.classList.add('img'); }
    if (img.complete && img.naturalWidth) ok();
    img.addEventListener('load', ok);
    img.addEventListener('error', function () { img.remove(); });
  });
})();
