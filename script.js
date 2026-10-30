"use strict";
(function () {
  var root = document.documentElement;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(id) { return document.getElementById(id); }

  // Theme toggle
  var btn = $("themeBtn"), saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  if (saved) root.setAttribute("data-theme", saved);
  function isDark() { var t = root.getAttribute("data-theme"); return t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches; }
  function label() { btn.textContent = isDark() ? "Light mode" : "Dark mode"; }
  btn.addEventListener("click", function () {
    var n = isDark() ? "light" : "dark"; root.setAttribute("data-theme", n);
    try { localStorage.setItem("theme", n); } catch (e) {} label();
  });
  label();

  // Missing images fall back gracefully
  document.addEventListener("error", function (e) {
    var el = e.target;
    if (el.tagName !== "IMG") return;
    el.removeAttribute("src"); el.style.display = "none";
    if (el.parentNode.classList.contains("thumb")) el.parentNode.textContent = "Certificate image";
    el.setAttribute("data-missing", "1");
  }, true);

  // Typing line
  var roles = ["Student Leader at Jigme Namgyel Engineering College", "Computer Systems and Networking student", "Aspiring software developer and UI/UX designer"];
  var typed = $("typed"), ri = 0, ci = 0, del = false;
  function tick() {
    var w = roles[ri];
    if (reduce) { typed.textContent = roles[0]; return; }
    typed.textContent = w.slice(0, ci);
    if (!del && ci < w.length) { ci++; setTimeout(tick, 55); }
    else if (!del) { del = true; setTimeout(tick, 1800); }
    else if (ci > 0) { ci--; setTimeout(tick, 25); }
    else { del = false; ri = (ri + 1) % roles.length; setTimeout(tick, 300); }
  }
  tick();

  // Network canvas
  var cv = $("net"), ctx = cv.getContext("2d"), pts = [], W = 0, H = 0, mx = -999, my = -999;
  function size() {
    var r = cv.parentNode.getBoundingClientRect(), d = window.devicePixelRatio || 1;
    W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    var n = Math.round(Math.min(70, W * H / 14000)); pts = [];
    for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4 });
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(function (p) {
      if (!reduce) { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1; }
      ctx.fillStyle = "rgba(245,165,36,.8)"; ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, 6.3); ctx.fill();
    });
    for (var i = 0; i < pts.length; i++) {
      for (var j = i + 1; j < pts.length; j++) {
        var dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 130) { ctx.strokeStyle = "rgba(79,209,232," + (0.35 * (1 - d / 130)) + ")"; ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke(); }
      }
      var ex = pts[i].x - mx, ey = pts[i].y - my;
      if (ex * ex + ey * ey < 20000) { ctx.strokeStyle = "rgba(245,165,36,.5)"; ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(mx, my); ctx.stroke(); }
    }
    if (!reduce) requestAnimationFrame(draw);
  }
  size(); draw();
  addEventListener("resize", function () { size(); if (reduce) draw(); });
  cv.parentNode.addEventListener("mousemove", function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });

  // Certificates dialog
  var dlg = $("dlg");
  document.querySelectorAll(".cert").forEach(function (b) {
    b.addEventListener("click", function () {
      var im = b.querySelector("img");
      if (!im || im.getAttribute("data-missing")) return;
      $("dlgImg").src = im.src; $("dlgImg").alt = im.alt; $("dlgCap").textContent = b.querySelector("h3").textContent; dlg.showModal();
    });
  });
  $("dlgClose").addEventListener("click", function () { dlg.close(); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });

  // Scroll reveal + nav highlight
  var links = document.querySelectorAll("nav a[href^='#']"), map = {};
  links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
  if ("IntersectionObserver" in window) {
    var rv = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); rv.unobserve(en.target); } }); }, { threshold: .12 });
    document.querySelectorAll(".reveal").forEach(function (el) { rv.observe(el); });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting && map[en.target.id]) { links.forEach(function (l) { l.classList.remove("active"); }); map[en.target.id].classList.add("active"); } });
    }, { rootMargin: "-40% 0px -55% 0px" });
    Object.keys(map).forEach(function (id) { var s = $(id); if (s) io.observe(s); });
  } else document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });

  // Copy email
  var toast = $("toast"), copy = $("copyBtn");
  copy.addEventListener("click", function () {
    function done(m) { toast.textContent = m; toast.classList.add("show"); setTimeout(function () { toast.classList.remove("show"); }, 2000); }
    if (navigator.clipboard && navigator.clipboard.writeText)
      navigator.clipboard.writeText(copy.getAttribute("data-email")).then(function () { done("Email copied"); }, function () { done("Copy failed. Select the address instead."); });
    else done("Copy failed. Select the address instead.");
  });
  $("year").textContent = new Date().getFullYear();
})();
