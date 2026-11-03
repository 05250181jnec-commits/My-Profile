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
  function label() { btn.textContent = isDark() ? "\u2600\uFE0F" : "\uD83C\uDF19"; btn.setAttribute("aria-label", isDark() ? "Switch to light mode" : "Switch to dark mode"); }
  btn.addEventListener("click", function () {
    var n = isDark() ? "light" : "dark"; root.setAttribute("data-theme", n);
    try { localStorage.setItem("theme", n); } catch (e) {} label(); btn.classList.remove("spin"); void btn.offsetWidth; btn.classList.add("spin");
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

  // Intro video fallback
  document.addEventListener("error", function (e) {
    if (e.target.tagName !== "SOURCE") return;
    var v = e.target.parentNode; v.style.display = "none"; v.parentNode.classList.add("empty");
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
  setTimeout(tick, reduce ? 0 : 1200);

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

  // Animation layer: split name into letters
  var h1 = document.querySelector(".hero h1"), li = 0;
  h1.setAttribute("aria-label", h1.textContent);
  (function walk(n) {
    Array.prototype.slice.call(n.childNodes).forEach(function (ch) {
      if (ch.nodeType === 3) {
        var f = document.createDocumentFragment();
        ch.textContent.split("").forEach(function (t) {
          if (t === " ") { f.appendChild(document.createTextNode(" ")); return; }
          var s = document.createElement("span"); s.className = "ch"; s.setAttribute("aria-hidden", "true");
          s.textContent = t; s.style.setProperty("--i", li++); f.appendChild(s);
        });
        n.replaceChild(f, ch);
      } else if (ch.nodeType === 1) walk(ch);
    });
  })(h1);

  // Staggered entrance for cards, timeline items and stats
  [".cards", ".tl", ".stats"].forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (box) {
      Array.prototype.slice.call(box.children).forEach(function (el, i) {
        el.classList.add("rv"); el.style.setProperty("--d", (i * 0.12) + "s");
      });
    });
  });

  // Scroll progress bar and timeline fill
  var bar = $("progress"), tl = document.querySelector(".tl");
  function onScroll() {
    var max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, scrollY / max) : 0) + ")";
    var r = tl.getBoundingClientRect();
    tl.style.setProperty("--p", Math.max(0, Math.min(1, (innerHeight * 0.65 - r.top) / r.height)));
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // Count-up numbers
  function count(el) {
    var end = +el.getAttribute("data-count"), t0 = null;
    if (reduce) { el.textContent = end; return; }
    function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { count(en.target); co.unobserve(en.target); } }); }, { threshold: .6 });
    document.querySelectorAll("[data-count]").forEach(function (el) { co.observe(el); });
  } else document.querySelectorAll("[data-count]").forEach(count);

  // Cursor glow and 3D tilt (mouse only)
  if (matchMedia("(pointer: fine)").matches && !reduce) {
    var glow = $("glow");
    addEventListener("pointermove", function (e) { glow.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px)"; document.body.classList.add("glow-on"); });
    document.addEventListener("mouseleave", function () { document.body.classList.remove("glow-on"); });
    document.querySelectorAll(".card, .cert").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.transform = "perspective(700px) rotateX(" + (-y * 10) + "deg) rotateY(" + (x * 12) + "deg) translateY(-6px)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
  }

  // Scroll reveal + nav highlight
  var links = document.querySelectorAll("nav a[href^='#']"), map = {};
  links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
  if ("IntersectionObserver" in window) {
    var rv = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); rv.unobserve(en.target); } }); }, { threshold: .12 });
    document.querySelectorAll(".reveal, .rv").forEach(function (el) { rv.observe(el); });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting && map[en.target.id]) { links.forEach(function (l) { l.classList.remove("active"); }); map[en.target.id].classList.add("active"); } });
    }, { rootMargin: "-40% 0px -55% 0px" });
    Object.keys(map).forEach(function (id) { var s = $(id); if (s) io.observe(s); });
  } else document.querySelectorAll(".reveal, .rv").forEach(function (el) { el.classList.add("in"); });

  // Confetti in prayer-flag colours
  var frame = $("frame"), cols = ["#2F7FD0", "#F4F4F0", "#D8392B", "#2E9B5E", "#F5C022"];
  function burst() {
    if (reduce) return;
    var r = frame.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (var i = 0; i < 44; i++) {
      var p = document.createElement("span"); p.className = "confetti"; p.style.background = cols[i % 5];
      document.body.appendChild(p);
      var a = Math.random() * 6.283, d = 90 + Math.random() * 190;
      p.animate([
        { transform: "translate(" + cx + "px," + cy + "px) rotate(0)", opacity: 1 },
        { transform: "translate(" + (cx + Math.cos(a) * d) + "px," + (cy + Math.sin(a) * d - 60) + "px) rotate(" + (Math.random() * 540) + "deg)", opacity: 1, offset: .55 },
        { transform: "translate(" + (cx + Math.cos(a) * d * 1.1) + "px," + (cy + Math.sin(a) * d + 260) + "px) rotate(720deg)", opacity: 0 }
      ], { duration: 1500 + Math.random() * 700, easing: "ease-out" }).onfinish = (function (el) { return function () { el.remove(); }; })(p);
    }
  }
  frame.addEventListener("click", burst);
  frame.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); burst(); } });

  // Mini terminal
  var out = $("out"), cmd = $("cmd");
  var CMDS = {
    help: "Try: about, skills, education, certificates, languages, contact, clear",
    about: "Nima Yoezer, student leader at Jigme Namgyel Engineering College.\nFrom Gomphu, Zhemgang, Bhutan.",
    skills: "Leading teams | talking with people | hard work\nLearning: Linux server admin, Python Tkinter, Laravel and PHP",
    education: "2020  Class X, Yebilaptsa Central School\n2024  Class XII Commerce, Desi High School\n2025-2027  Diploma in Computer System and Networking, JNEC",
    certificates: "1. Becoming a Linux Server Admin\n2. Python Tkinter: Design, Build and Integrate GUIs\n3. Full-Stack Web Development with Laravel and PHP",
    languages: "English: very good\nDzongkha: excellent",
    contact: "05250181.jnec@rub.edu.bt",
    sudo: "Nice try. This portfolio is read-only."
  };
  function print(t, cls) { var d = document.createElement("div"); if (cls) d.className = cls; d.textContent = t; out.appendChild(d); out.scrollTop = out.scrollHeight; }
  print("Welcome! Type help and press Enter.");
  cmd.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;
    var v = cmd.value.trim().toLowerCase(); cmd.value = "";
    if (!v) return;
    print("$ " + v, "you");
    if (v === "clear") out.textContent = "";
    else print(CMDS[v.split(" ")[0]] || "Command not found: " + v + ". Type help.");
  });

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
