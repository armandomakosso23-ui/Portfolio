/* ==================================================
   MINI-JEU "SURVIE" (inspiré de l'univers survival)
   Des infectés foncent vers toi : clique-les avant
   qu'ils t'atteignent. 3 vies, difficulté croissante.
   100% JavaScript maison (canvas).
   ==================================================*/

(function () {
  "use strict";

  const overlay = document.getElementById("game-overlay");
  const openBtn = document.getElementById("open-game");
  if (!overlay || !openBtn) return;

  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const startBtn = document.getElementById("game-start");
  const closeBtn = document.getElementById("game-close");
  const scoreEl = document.getElementById("game-score");
  const hpEl = document.getElementById("game-hp");

  const W = canvas.width;
  const H = canvas.height;
  const player = { x: W / 2, y: H / 2, r: 24 };

  let infected = [];
  let score = 0;
  let hp = 3;
  let running = false;
  let over = false;
  let spawnEvery = 1100;
  let lastSpawn = 0;
  let started = 0;
  let rafId = null;

  function updateHUD() {
    scoreEl.textContent = "Score : " + score;
    hpEl.textContent = hp > 0 ? "❤️".repeat(hp) : "💀";
  }

  function reset() {
    infected = [];
    score = 0;
    hp = 3;
    spawnEvery = 1100;
    lastSpawn = 0;
    started = 0;
    over = false;
    updateHUD();
  }

  function spawn() {
    const edge = Math.floor(Math.random() * 4);
    let x, y;
    if (edge === 0) { x = Math.random() * W; y = -20; }
    else if (edge === 1) { x = W + 20; y = Math.random() * H; }
    else if (edge === 2) { x = Math.random() * W; y = H + 20; }
    else { x = -20; y = Math.random() * H; }
    const speed = 0.7 + Math.random() * 0.6 + score * 0.015;
    infected.push({ x: x, y: y, r: 16, speed: speed });
  }

  function drawBackground() {
    ctx.fillStyle = "#070b16";
    ctx.fillRect(0, 0, W, H);
    // grille discrète
    ctx.strokeStyle = "rgba(56,189,248,0.06)";
    ctx.lineWidth = 1;
    for (let gx = 0; gx < W; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
    }
    for (let gy = 0; gy < H; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
    }
  }

  function drawPlayer() {
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.r + 6, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(56,189,248,0.15)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
    ctx.fillStyle = "#0b1120";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#38bdf8";
    ctx.stroke();
    ctx.font = "26px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🧑", player.x, player.y + 1);
  }

  function drawInfected(inf) {
    ctx.beginPath();
    ctx.arc(inf.x, inf.y, inf.r + 4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(239,68,68,0.18)";
    ctx.fill();
    ctx.font = "28px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🧟", inf.x, inf.y + 1);
  }

  function gameOver() {
    running = false;
    over = true;
    if (rafId) cancelAnimationFrame(rafId);
    ctx.fillStyle = "rgba(2,6,23,0.8)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#f87171";
    ctx.font = "700 34px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("GAME OVER", W / 2, H / 2 - 18);
    ctx.fillStyle = "#e5e7eb";
    ctx.font = "18px system-ui, sans-serif";
    ctx.fillText("Score final : " + score, W / 2, H / 2 + 20);
    startBtn.textContent = "Rejouer";
  }

  function loop(ts) {
    if (!running) return;
    if (!started) { started = ts; lastSpawn = ts; }

    drawBackground();

    if (ts - lastSpawn > spawnEvery) {
      spawn();
      lastSpawn = ts;
      spawnEvery = Math.max(420, spawnEvery - 14);
    }

    for (let i = infected.length - 1; i >= 0; i--) {
      const inf = infected[i];
      const dx = player.x - inf.x;
      const dy = player.y - inf.y;
      const dist = Math.hypot(dx, dy) || 1;
      inf.x += (dx / dist) * inf.speed;
      inf.y += (dy / dist) * inf.speed;

      if (dist < player.r + inf.r) {
        infected.splice(i, 1);
        hp--;
        updateHUD();
        if (hp <= 0) { gameOver(); return; }
        continue;
      }
      drawInfected(inf);
    }

    drawPlayer();
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    reset();
    running = true;
    startBtn.textContent = "Recommencer";
    rafId = requestAnimationFrame(loop);
  }

  // Clic sur un infecté = élimination
  canvas.addEventListener("click", function (e) {
    if (!running) return;
    const rect = canvas.getBoundingClientRect();
    const cx = (e.clientX - rect.left) * (W / rect.width);
    const cy = (e.clientY - rect.top) * (H / rect.height);
    for (let i = infected.length - 1; i >= 0; i--) {
      const inf = infected[i];
      if (Math.hypot(cx - inf.x, cy - inf.y) < inf.r + 8) {
        infected.splice(i, 1);
        score++;
        updateHUD();
        break;
      }
    }
  });

  function openGame() {
    overlay.hidden = false;
    reset();
    drawBackground();
    drawPlayer();
    startBtn.textContent = "Commencer";
  }

  function closeGame() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    overlay.hidden = true;
  }

  openBtn.addEventListener("click", openGame);
  startBtn.addEventListener("click", start);
  closeBtn.addEventListener("click", closeGame);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !overlay.hidden) closeGame();
  });
})();
