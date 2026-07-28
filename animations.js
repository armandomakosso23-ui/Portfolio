/* ==================================================
   ANIMATIONS DE CODE – PORTFOLIO
   - Fond "pluie de code" (style Matrix)
   - Effet machine à écrire sur les titres
   - Apparition en fondu au défilement
   ==================================================*/

(function () {
  "use strict";

  /* --------------------------------------------------
     1. FOND ANIMÉ – PLUIE DE CODE
  ---------------------------------------------------*/
  function initCodeRain() {
    const canvas = document.createElement("canvas");
    canvas.id = "code-rain";
    document.body.prepend(canvas);
    const ctx = canvas.getContext("2d");

    const glyphs =
      "01</>{}[]();=+-*&|!?$#function const let=>if elsereturn php".split("");
    const fontSize = 16;
    let columns, drops;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = new Array(columns).fill(1);
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      // léger voile pour créer la traînée
      ctx.fillStyle = "rgba(2, 6, 23, 0.10)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = fontSize + "px monospace";

      for (let i = 0; i < drops.length; i++) {
        const text = glyphs[Math.floor(Math.random() * glyphs.length)];
        // la tête de colonne est plus claire
        ctx.fillStyle = drops[i] % 20 === 0 ? "#93c5fd" : "#3b82f6";
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    setInterval(draw, 55);
  }

  /* --------------------------------------------------
     2. EFFET MACHINE À ÉCRIRE
  ---------------------------------------------------*/
  function typewriter(el) {
    const text = el.textContent;
    el.textContent = "";
    el.classList.add("tw-caret");
    let i = 0;

    (function type() {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(type, 55);
      } else {
        // fait clignoter le curseur un instant puis l'enlève
        setTimeout(() => el.classList.remove("tw-caret"), 1200);
      }
    })();
  }

  /* --------------------------------------------------
     3. APPARITION AU DÉFILEMENT + déclenchement typewriter
  ---------------------------------------------------*/
  function initReveal() {
    const titles = document.querySelectorAll("section h3");
    const revealEls = document.querySelectorAll(
      ".card, header h1, header h2, header p, .intro-left, .intro-right"
    );

    // délai décalé pour les cartes d'un même conteneur
    document.querySelectorAll(".cards").forEach((group) => {
      group.querySelectorAll(".card").forEach((card, idx) => {
        card.style.transitionDelay = idx * 0.12 + "s";
      });
    });

    revealEls.forEach((el) => el.classList.add("reveal"));

    if (!("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("visible"));
      titles.forEach((t) => t.classList.remove("tw-pending"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;

          if (el.matches("section h3")) {
            typewriter(el);
          } else {
            el.classList.add("visible");
          }
          io.unobserve(el);
        });
      },
      { threshold: 0.15 }
    );

    revealEls.forEach((el) => io.observe(el));
    titles.forEach((t) => io.observe(t));
  }

  /* --------------------------------------------------
     PRÉFÉRENCE UTILISATEUR (accessibilité)
  ---------------------------------------------------*/
  function prefersReduced() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function getPref() {
    let stored = null;
    try {
      stored = localStorage.getItem("anim-pref");
    } catch (e) {
      /* localStorage indisponible (ex. file://) : on ignore */
    }
    if (stored === "on" || stored === "off") return stored;
    // par défaut : on suit le réglage système d'accessibilité
    return prefersReduced() ? "off" : "on";
  }

  function savePref(value) {
    try {
      localStorage.setItem("anim-pref", value);
    } catch (e) {
      /* ignore */
    }
  }

  function addToggle(active) {
    const btn = document.createElement("button");
    btn.id = "anim-toggle";
    btn.type = "button";
    btn.textContent = active ? "⏸ Animations" : "▶ Animations";
    btn.setAttribute(
      "aria-label",
      active ? "Désactiver les animations" : "Activer les animations"
    );
    btn.addEventListener("click", function () {
      savePref(active ? "off" : "on");
      location.reload();
    });
    document.body.appendChild(btn);
  }

  /* --------------------------------------------------
     THÈME CLAIR / SOMBRE
  ---------------------------------------------------*/
  function getTheme() {
    try {
      const t = localStorage.getItem("theme");
      if (t === "light" || t === "dark") return t;
    } catch (e) {}
    return "dark";
  }

  function applyTheme(theme) {
    document.body.classList.toggle("light-theme", theme === "light");
  }

  function addThemeToggle(theme) {
    const btn = document.createElement("button");
    btn.id = "theme-toggle";
    btn.type = "button";
    function setLabel(t) {
      btn.textContent = t === "light" ? "🌙 Sombre" : "☀️ Clair";
      btn.setAttribute("aria-label", t === "light" ? "Passer en thème sombre" : "Passer en thème clair");
    }
    setLabel(theme);
    btn.addEventListener("click", function () {
      const current = document.body.classList.contains("light-theme") ? "light" : "dark";
      const next = current === "light" ? "dark" : "light";
      applyTheme(next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      setLabel(next);
    });
    document.body.appendChild(btn);
  }

  /* --------------------------------------------------
     BOUTON DE LANGUE (FR / EN)
  ---------------------------------------------------*/
  function addLangToggle() {
    const path = location.pathname;
    const isEN = path.indexOf("/en/") !== -1;
    const link = document.createElement("a");
    link.id = "lang-toggle";

    if (isEN) {
      link.textContent = "🇫🇷 FR";
      link.setAttribute("aria-label", "Voir la version française");
      link.href = "../accueil.html";
    } else {
      link.textContent = "🇬🇧 EN";
      link.setAttribute("aria-label", "See the English version");
      link.href = path.indexOf("/pages/") !== -1 ? "../en/index.html" : "en/index.html";
    }
    document.body.appendChild(link);
  }

  /* --------------------------------------------------
     BOUTON RETOUR EN HAUT
  ---------------------------------------------------*/
  function addBackToTop() {
    const btn = document.createElement("button");
    btn.id = "back-to-top";
    btn.type = "button";
    btn.textContent = "↑";
    btn.setAttribute("aria-label", "Retour en haut de la page");
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    document.body.appendChild(btn);
    window.addEventListener("scroll", function () {
      btn.classList.toggle("show", window.scrollY > 300);
    });
  }

  /* --------------------------------------------------
     LANCEMENT
  ---------------------------------------------------*/
  function start() {
    // Thème et retour-en-haut : toujours actifs (indépendants des animations)
    const theme = getTheme();
    applyTheme(theme);
    addThemeToggle(theme);
    addLangToggle();
    addBackToTop();

    const active = getPref() === "on";
    if (active) {
      initCodeRain();
      initReveal();
    }
    addToggle(active);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
