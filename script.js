"use strict";
(function () {
  var root = document.documentElement;
  // To add certificates: put the image in the certificates folder and add a line here.
  var CERTS = [
    { title: "Leadership Training", by: "CUS-Lead, Bhutan", date: "13\u201317 July 2026", img: "" }
  ];

  var btn = document.getElementById("themeBtn"), saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  if (saved) root.setAttribute("data-theme", saved);
  function isDark() { var t = root.getAttribute("data-theme"); return t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches; }
  function label() { btn.textContent = isDark() ? "Light mode" : "Dark mode"; }
  btn.addEventListener("click", function () {
    var n = isDark() ? "light" : "dark"; root.setAttribute("data-theme", n);
    try { localStorage.setItem("theme", n); } catch (e) {} label();
  });
  label();

  // Photo: show initials if photo.jpg is missing
  var photo = document.getElementById("photo");
  photo.addEventListener("error", function () { photo.remove(); });

  // Certificates
  var list = document.getElementById("certs"), dlg = document.getElementById("dlg");
  CERTS.forEach(function (c) {
    var li = document.createElement("li");
    var el = document.createElement(c.img ? "button" : "div");
    el.className = "cert";
    var th = document.createElement("div"); th.className = "thumb";
    if (c.img) { var im = document.createElement("img"); im.src = c.img; im.alt = c.title + " certificate"; th.appendChild(im); }
    else th.textContent = "Certificate image coming soon";
    var m = document.createElement("div"); m.className = "meta";
    var h = document.createElement("h3"); h.textContent = c.title;
    var p = document.createElement("p"); p.textContent = c.by + " \u00b7 " + c.date;
    m.appendChild(h); m.appendChild(p); el.appendChild(th); el.appendChild(m);
    if (c.img) el.addEventListener("click", function () {
      document.getElementById("dlgImg").src = c.img; document.getElementById("dlgImg").alt = c.title;
      document.getElementById("dlgCap").textContent = c.title; dlg.showModal();
    });
    li.appendChild(el); list.appendChild(li);
  });
  document.getElementById("dlgClose").addEventListener("click", function () { dlg.close(); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });

  // Nav highlight
  var links = document.querySelectorAll("nav a[href^='#']"), map = {};
  links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          links.forEach(function (l) { l.classList.remove("active"); });
          map[en.target.id].classList.add("active");
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  // Copy email
  var toast = document.getElementById("toast"), copy = document.getElementById("copyBtn");
  copy.addEventListener("click", function () {
    function done(m) { toast.textContent = m; toast.classList.add("show"); setTimeout(function () { toast.classList.remove("show"); }, 2000); }
    if (navigator.clipboard && navigator.clipboard.writeText)
      navigator.clipboard.writeText(copy.getAttribute("data-email")).then(function () { done("Email copied"); }, function () { done("Copy failed. Select the address instead."); });
    else done("Copy failed. Select the address instead.");
  });
  document.getElementById("year").textContent = new Date().getFullYear();
})();
