(function () {
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var KEY = "lc-seen";
  function getSeen() { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } }
  function setSeen(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} }
  var all = [], seenMap = {};
  (window.LC_NAV || []).forEach(function (t) { t.p.forEach(function (p) { if (!seenMap[p[2]]) { seenMap[p[2]] = 1; all.push(p); } }); });

  // confetti burst from an element
  function burst(el) {
    if (reduce) return;
    var r = el.getBoundingClientRect(), em = ["🎉", "✨", "💚", "⭐", "🎊"];
    for (var i = 0; i < 16; i++) {
      var s = document.createElement("span"); s.className = "confetti"; s.textContent = em[i % em.length];
      s.style.left = r.left + r.width / 2 + "px"; s.style.top = r.top + r.height / 2 + "px";
      var a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 90;
      s.style.setProperty("--dx", Math.cos(a) * d + "px"); s.style.setProperty("--dy", Math.sin(a) * d - 40 + "px");
      document.body.appendChild(s); setTimeout(function (x) { return function () { x.remove(); }; }(s), 1000);
    }
  }

  // language toggle (UI only; notes stay as written)
  var qi = document.getElementById("q");
  function applyLang(l) {
    document.body.dataset.lang = l; document.documentElement.lang = l === "en" ? "en" : "zh-Hant";
    if (qi) { if (!qi.dataset.phZh) qi.dataset.phZh = qi.placeholder; qi.placeholder = l === "en" ? qi.dataset.phEn : qi.dataset.phZh; }
  }
  applyLang(document.body.dataset.lang || "zh");
  var lb = document.querySelector(".langbtn");
  if (lb) lb.addEventListener("click", function () {
    var l = document.body.dataset.lang === "en" ? "zh" : "en"; applyLang(l);
    try { localStorage.setItem("lc-lang", l); } catch (e) {}
  });

  // 1. count-up numbers + growing bars when they scroll into view
  function countUp(el) {
    var to = parseInt(el.textContent, 10); if (isNaN(to) || reduce) return;
    var t0 = null; el.textContent = "0";
    function step(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 900); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); if (e.target.matches(".stats b,.erow b")) countUp(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.3 }) : null;
  document.querySelectorAll(".stats b,.erow b,.energy").forEach(function (el) { if (io) io.observe(el); else el.classList.add("in"); });

  // 2. reveal solution
  document.querySelectorAll(".reveal-btn").forEach(function (b) {
    b.addEventListener("click", function () { var s = b.closest(".sol"); s.classList.remove("locked"); s.classList.add("open"); burst(b); });
  });

  // 4. seen tracking
  var slug = document.body.dataset.slug, seen = getSeen();
  var sb = document.querySelector(".seen-btn");
  function paintBtn() { if (!sb) return; var on = seen.indexOf(slug) >= 0; sb.classList.toggle("on", on); }
  if (sb && slug) {
    paintBtn();
    sb.addEventListener("click", function () {
      var i = seen.indexOf(slug);
      if (i >= 0) seen.splice(i, 1); else { seen.push(slug); burst(sb); }
      setSeen(seen); paintBtn(); markNav();
    });
  }
  function markNav() { document.querySelectorAll("#nav li a").forEach(function (a) { var m = a.getAttribute("href").match(/p\/([^/]+)\/$/); a.classList.toggle("seen", !!m && seen.indexOf(m[1]) >= 0); }); }
  markNav(); var q = document.getElementById("q"); if (q) q.addEventListener("input", function () { setTimeout(markNav, 0); });

  var fg = document.getElementById("ringFg");
  if (fg) {
    var n = seen.filter(function (s) { return seenMap[s]; }).length, T = all.length, C = 2 * Math.PI * 50;
    document.getElementById("seenT").textContent = T;
    document.getElementById("seenN").textContent = n;
    fg.style.strokeDasharray = C; fg.style.strokeDashoffset = C;
    setTimeout(function () { fg.style.strokeDashoffset = C * (1 - (T ? n / T : 0)); countUp(document.getElementById("seenN")); }, 300);
  }

  // 3. random pick
  var db = document.getElementById("diceBtn"), dc = document.getElementById("diceCard");
  if (db && all.length) {
    db.addEventListener("click", function () {
      db.disabled = true; db.classList.add("roll");
      var k = 0, steps = reduce ? 1 : 14, pick;
      (function tick() {
        pick = all[Math.floor(Math.random() * all.length)];
        dc.textContent = pick[1]; dc.classList.remove("flip"); void dc.offsetWidth; dc.classList.add("flip");
        if (++k < steps) setTimeout(tick, 40 + k * 12);
        else { dc.classList.add("done"); burst(dc); setTimeout(function () { location.href = (document.body.dataset.root || "") + "p/" + pick[2] + "/"; }, 900); }
      })();
    });
  }
})();
