/**
 * SnakeGameOverlay.jsx
 *
 * Shows on every new session (sessionStorage).
 * After logout or closing the browser → sessionStorage is cleared → game shows again.
 *
 * Usage:
 *   import SnakeGameOverlay from "./SnakeGameOverlay";
 *   <SnakeGameOverlay />   ← place it at the top of App.jsx or main Layout
 */

import { useEffect, useRef, useState, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
//  CSS
// ─────────────────────────────────────────────────────────────────────────────
const GAME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

@keyframes chr-cardIn {
  from { opacity:0; transform:translateY(36px) scale(0.95) }
  to   { opacity:1; transform:translateY(0)    scale(1)    }
}
@keyframes chr-fadeIn  { from{opacity:0} to{opacity:1} }
@keyframes chr-pulse {
  0%,100% { box-shadow:0 0 0 0    rgba(0,168,107,0.55) }
  50%     { box-shadow:0 0 0 12px rgba(0,168,107,0)    }
}
@keyframes chr-float {
  0%,100% { transform:translateY(0px)  }
  50%     { transform:translateY(-4px) }
}

.chr-overlay {
  position:fixed; inset:0; z-index:9999;
  display:flex; align-items:center; justify-content:center;
  animation:chr-fadeIn 0.4s ease both;
  font-family:'DM Sans',sans-serif;
}
.chr-overlay.chr-hiding {
  opacity:0; pointer-events:none;
  transition:opacity 0.65s ease;
}
.chr-backdrop {
  position:absolute; inset:0;
  background:rgba(4,22,12,0.88);
  backdrop-filter:blur(6px);
  -webkit-backdrop-filter:blur(6px);
}
/* Egyptian-green shimmer strip across the top of the backdrop */
.chr-backdrop::after {
  content:'';
  position:absolute; top:0; left:0; right:0; height:3px;
  background:linear-gradient(90deg,transparent 0%,#00a86b 30%,#00c87a 50%,#00a86b 70%,transparent 100%);
  opacity:0.65;
}
.chr-card {
  position:relative; z-index:1;
  width:min(500px,94vw);
  background:linear-gradient(160deg,rgba(0,168,107,0.11) 0%,rgba(255,255,255,0.05) 60%);
  backdrop-filter:blur(28px);
  -webkit-backdrop-filter:blur(28px);
  border-top:  1.5px solid rgba(0,200,122,0.80);
  border-left: 1.5px solid rgba(0,200,122,0.80);
  border-bottom:1.5px solid rgba(0,140,80,0.50);
  border-right: 1.5px solid rgba(0,140,80,0.50);
  border-radius:24px;
  padding:22px 22px 18px;
  display:flex; flex-direction:column; align-items:center; gap:11px;
  box-shadow:0 28px 72px rgba(0,0,0,0.40),
             0 0 0 1px rgba(0,168,107,0.12),
             inset 0 0 40px rgba(0,168,107,0.06);
  animation:chr-cardIn 0.65s cubic-bezier(0.34,1.56,0.64,1) both;
}
/* glowing corner accent — Egyptian green */
.chr-card::before {
  content:'';
  position:absolute; top:-1px; left:-1px;
  width:60px; height:60px;
  background:radial-gradient(circle at top left,rgba(0,200,122,0.35),transparent 70%);
  border-radius:24px 0 0 0; pointer-events:none;
}
.chr-title {
  font-family:'Syne',sans-serif;
  font-size:21px; font-weight:800;
  background:linear-gradient(90deg,#00c87a,#4ade80,#00a86b);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent;
  background-clip:text;
  letter-spacing:-0.4px;
}
.chr-subtitle {
  font-size:12px; color:rgba(180,220,195,0.65);
  text-align:center; line-height:1.55; margin-top:-5px;
}
.chr-hud { display:flex; gap:18px; font-size:12px; color:rgba(180,220,195,0.55); }
.chr-hud b { color:#e0f2e9; font-weight:600; }

.chr-bar-outer {
  width:100%; height:5px;
  background:rgba(255,255,255,0.08);
  border-radius:4px; overflow:hidden;
}
.chr-bar-inner {
  height:100%; border-radius:4px;
  transition:width 0.3s ease, background 0.3s ease;
}
.chr-bar-labels {
  display:flex; justify-content:space-between; width:100%;
  font-size:10px; color:rgba(180,220,195,0.35);
}
.chr-canvas {
  display:block; border-radius:14px;
  background:rgba(255,255,255,0.03);
  border:0.5px solid rgba(168,224,44,0.15);
}
.chr-msg {
  font-size:13px; font-weight:500;
  color:rgba(210,240,220,0.85);
  min-height:19px; text-align:center;
}
.chr-btns { display:flex; gap:8px; }
.chr-game-btn {
  background:rgba(255,255,255,0.07);
  border:1px solid rgba(168,224,44,0.30);
  border-radius:10px; padding:7px 20px;
  font-size:12.5px; font-weight:600;
  color:#c8ecd4; cursor:pointer;
  font-family:'DM Sans',sans-serif; letter-spacing:0.3px;
  transition:background 0.2s,transform 0.15s,box-shadow 0.2s;
}
.chr-game-btn:hover {
  background:rgba(61,155,115,0.22);
  box-shadow:0 4px 16px rgba(61,155,115,0.22);
  transform:translateY(-1px);
}
.chr-enter-btn {
  margin-top:2px;
  background:linear-gradient(135deg,#00c87a,#007a47);
  color:#fff; border:none; border-radius:999px;
  padding:13px 36px; font-size:15px; font-weight:700;
  font-family:'Syne',sans-serif; letter-spacing:0.3px;
  cursor:pointer;
  box-shadow:0 6px 28px rgba(0,168,107,0.50),inset 0 1px 0 rgba(255,255,255,0.15);
  display:flex; align-items:center; gap:10px;
  animation:chr-pulse 2.2s ease-in-out infinite,chr-float 3s ease-in-out infinite;
  transition:background 0.22s,box-shadow 0.22s,transform 0.18s;
}
.chr-enter-btn:hover {
  background:linear-gradient(135deg,#00b06c,#006038);
  box-shadow:0 10px 36px rgba(0,168,107,0.60);
  animation:none; transform:translateY(-2px);
}
.chr-legend {
  display:flex; gap:14px; flex-wrap:wrap; justify-content:center;
  font-size:10.5px; color:rgba(180,220,195,0.45);
}
.chr-legend span { display:flex; align-items:center; gap:4px; }
.chr-dot { width:8px; height:8px; border-radius:2px; display:inline-block; flex-shrink:0; }
`;

// ─────────────────────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────────────────────
const CELL = 18, COLS = 24, ROWS = 20;
const WIN_LEN = 1, LOSE_LEN = 20, SPEED = 155;
const HEALTHY_E = ["🥦", "🍎", "🥕", "🫐", "🥑", "🍇", "🍓", "🥝", "🌽"];
const BAD_E = ["🍕", "🍔", "🍟", "🍩", "🌭"];
const DANGER_E = ["🎂", "🍰", "🧁", "🍫", "🍬"];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─────────────────────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────────────────────
export default function SnakeGameOverlay() {
  const [shouldShow] = useState(() => !sessionStorage.getItem("game_visited"));
  const [visible, setVisible] = useState(true);
  const [hiding, setHiding] = useState(false);
  const [showStart, setShowStart] = useState(true);
  const [showRestart, setShowRestart] = useState(false);
  const [msg, setMsg] = useState("Press Start or any arrow key to begin");
  const [hud, setHud] = useState({ score: 0, length: 3, health: 100 });
  const canvasRef = useRef(null);
  const stRef = useRef(null);
  const loopRef = useRef(null);

  // inject CSS once
  useEffect(() => {
    if (document.getElementById("chr-snake-css")) return;
    const s = document.createElement("style");
    s.id = "chr-snake-css"; s.textContent = GAME_CSS;
    document.head.appendChild(s);
  }, []);

  // ── helpers ──────────────────────────────────────────────────────────
  const spawnFood = useCallback((st) => {
    if (st.foods.length >= 7) return;
    let pos, tries = 0;
    do {
      pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
      tries++;
    } while (tries < 200 && (
      st.snake.some(s => s.x === pos.x && s.y === pos.y) ||
      st.foods.some(f => f.x === pos.x && f.y === pos.y)
    ));
    const r = Math.random();
    const type = r < 0.50 ? "healthy" : r < 0.82 ? "bad" : "danger";
    const emoji = type === "healthy" ? pick(HEALTHY_E) : type === "bad" ? pick(BAD_E) : pick(DANGER_E);
    st.foods.push({ x: pos.x, y: pos.y, type, emoji, pulse: Math.random() * Math.PI * 2 });
  }, []);

  const addParticles = (st, px, py, type) => {
    const pal = { healthy: ["#4ade80", "#16a34a"], bad: ["#fca5a5", "#ef4444"], danger: ["#fde047", "#ca8a04"] };
    const cols = pal[type];
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2, spd = 2 + Math.random() * 4;
      st.particles.push({ x: px, y: py, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, r: 2 + Math.random() * 3, life: 1, color: pick(cols) });
    }
  };

  // ── draw ─────────────────────────────────────────────────────────────
  const draw = useCallback((st) => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    ctx.clearRect(0, 0, cv.width, cv.height);

    ctx.strokeStyle = "rgba(168,224,44,0.055)"; ctx.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, ROWS * CELL); ctx.stroke(); }
    for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(COLS * CELL, y * CELL); ctx.stroke(); }

    st.foods.forEach(f => {
      f.pulse += 0.07;
      ctx.save();
      ctx.translate(f.x * CELL + CELL / 2, f.y * CELL + CELL / 2);
      ctx.scale(1 + Math.sin(f.pulse) * 0.1, 1 + Math.sin(f.pulse) * 0.1);
      ctx.shadowColor = f.type === "danger" ? "rgba(202,138,4,0.55)" : f.type === "bad" ? "rgba(239,68,68,0.45)" : "rgba(61,155,115,0.50)";
      ctx.shadowBlur = 10;
      ctx.font = `${CELL - 2}px serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(f.emoji, 0, 0); ctx.shadowBlur = 0; ctx.restore();
    });

    st.particles = st.particles.filter(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.life -= 0.06; if (p.life <= 0) return false;
      ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; return true;
    });

    if (st.snake.length >= LOSE_LEN - 3 && Math.floor(Date.now() / 250) % 2 === 0) {
      ctx.fillStyle = "rgba(239,68,68,0.06)"; ctx.fillRect(0, 0, cv.width, cv.height);
    }

    const h = st.health;
    const c1 = h > 60 ? [61, 155, 115] : h > 30 ? [234, 179, 8] : [239, 68, 68];
    const c2 = h > 60 ? [26, 107, 79] : h > 30 ? [161, 98, 7] : [185, 28, 28];
    st.snake.forEach((seg, i) => {
      const t = i / Math.max(1, st.snake.length - 1), r = Math.max(3, CELL * 0.42 - i * 0.04);
      const cr = Math.round(c1[0] + (c2[0] - c1[0]) * t), cg = Math.round(c1[1] + (c2[1] - c1[1]) * t), cb = Math.round(c1[2] + (c2[2] - c1[2]) * t);
      ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
      if (i === 0) { ctx.shadowColor = `rgba(${cr},${cg},${cb},0.6)`; ctx.shadowBlur = 12; }
      const rx = seg.x * CELL + CELL / 2, ry = seg.y * CELL + CELL / 2;
      ctx.beginPath(); ctx.roundRect(rx - r, ry - r, r * 2, r * 2, 4); ctx.fill(); ctx.shadowBlur = 0;
      if (i === 0) {
        const { x: dx, y: dy } = st.dir, ex = -dy, ey = dx;
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(rx + ex * 3.2 + dx * 4, ry + ey * 3.2 + dy * 4, 2.1, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(rx - ex * 3.2 + dx * 4, ry - ey * 3.2 + dy * 4, 2.1, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#0b2d1a";
        ctx.beginPath(); ctx.arc(rx + ex * 3.2 + dx * 5, ry + ey * 3.2 + dy * 5, 1.1, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(rx - ex * 3.2 + dx * 5, ry - ey * 3.2 + dy * 5, 1.1, 0, Math.PI * 2); ctx.fill();
      }
    });
  }, []);

  const syncHUD = useCallback((st) => {
    setHud({ score: st.score, length: st.snake.length, health: Math.max(0, Math.round(st.health)) });
  }, []);

  // ── lose ──────────────────────────────────────────────────────────────
  const doLose = useCallback((st) => {
    st.alive = false; clearInterval(loopRef.current);
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    const cx = st.snake[0].x * CELL + CELL / 2, cy = st.snake[0].y * CELL + CELL / 2;
    const frags = st.snake.map(s => ({ x: s.x * CELL + CELL / 2, y: s.y * CELL + CELL / 2, vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10 - 3, r: CELL * 0.38, life: 1, rot: Math.random() * Math.PI * 2, rv: (Math.random() - 0.5) * 0.35 }));
    let frame = 0;
    const boom = setInterval(() => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      const prog = Math.min(1, frame / 16);
      ctx.strokeStyle = `rgba(239,68,68,${(1 - prog) * 0.65})`; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(cx, cy, prog * 200, 0, Math.PI * 2); ctx.stroke();
      frags.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.4; p.life -= 0.022; p.rot += p.rv; if (p.life <= 0) return; ctx.globalAlpha = p.life; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = `rgba(239,68,68,${p.life})`; ctx.beginPath(); ctx.roundRect(-p.r, -p.r, p.r * 2, p.r * 2, 3); ctx.fill(); ctx.restore(); ctx.globalAlpha = 1; });
      for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2, d = prog * 90; ctx.globalAlpha = Math.max(0, 1 - prog * 1.6); ctx.font = "15px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(["💥", "🔥", "✨", "💢"][i % 4], cx + Math.cos(a) * d, cy + Math.sin(a) * d); }
      ctx.globalAlpha = 1; frame++;
      if (frame > 55) {
        clearInterval(boom);
        ctx.fillStyle = "rgba(6,18,12,0.85)"; ctx.fillRect(0, 0, cv.width, cv.height);
        ctx.font = "50px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("💀", cv.width / 2, cv.height / 2 - 38);
        ctx.font = "800 30px 'Syne',sans-serif"; ctx.fillStyle = "#f87171"; ctx.fillText("GAME OVER", cv.width / 2, cv.height / 2 + 12);
        ctx.font = "500 12.5px 'DM Sans',sans-serif"; ctx.fillStyle = "rgba(180,220,195,0.55)"; ctx.fillText("Score: " + st.score, cv.width / 2, cv.height / 2 + 44);
        setMsg("You ate too much junk! Try again 💪"); setShowRestart(true);
      }
    }, 38);
  }, []);

  // ── win ───────────────────────────────────────────────────────────────
  const doWin = useCallback((st) => {
    st.alive = false; clearInterval(loopRef.current);
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    const flies = Array.from({ length: 14 }, () => ({ x: 40 + Math.random() * (cv.width - 80), y: 40 + Math.random() * (cv.height - 80), vx: (Math.random() - 0.5) * 2.5, vy: (Math.random() - 0.5) * 2.5, sz: 14 + Math.random() * 10, ph: Math.random() * Math.PI * 2 }));
    let frame = 0, bigS = 0;
    const wi = setInterval(() => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      const g = ctx.createRadialGradient(cv.width / 2, cv.height / 2, 0, cv.width / 2, cv.height / 2, 220);
      g.addColorStop(0, `rgba(61,155,115,${0.18 + Math.sin(frame * 0.04) * 0.06})`); g.addColorStop(1, "rgba(6,18,12,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, cv.width, cv.height);
      flies.forEach(b => { b.x += b.vx + Math.sin(frame * 0.06 + b.ph) * 1.2; b.y += b.vy + Math.cos(frame * 0.05 + b.ph); if (b.x < 20) b.vx = Math.abs(b.vx); if (b.x > cv.width - 20) b.vx = -Math.abs(b.vx); if (b.y < 20) b.vy = Math.abs(b.vy); if (b.y > cv.height - 20) b.vy = -Math.abs(b.vy); ctx.globalAlpha = 0.65; ctx.font = b.sz + "px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("🦋", b.x, b.y); });
      ctx.globalAlpha = 1; bigS = Math.min(1, bigS + 0.022);
      const ease = bigS < 0.5 ? 2 * bigS * bigS : 1 - Math.pow(-2 * bigS + 2, 2) / 2;
      ctx.save(); ctx.translate(cv.width / 2, cv.height / 2 - 14); ctx.scale(ease * 5, ease * 5); ctx.font = "22px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("🦋", 0, 0); ctx.restore();
      if (bigS >= 0.85) { const a = Math.min(1, (bigS - 0.85) * 7); ctx.globalAlpha = a; ctx.font = "800 32px 'Syne',sans-serif"; ctx.textAlign = "center"; ctx.fillStyle = "#4ade80"; ctx.fillText("You Win! 🎉", cv.width / 2, cv.height / 2 + 72); ctx.font = "500 12px 'DM Sans',sans-serif"; ctx.fillStyle = "rgba(180,220,195,0.6)"; ctx.fillText("Score: " + st.score, cv.width / 2, cv.height / 2 + 104); ctx.globalAlpha = 1; }
      frame++; if (frame > 220) clearInterval(wi);
    }, 33);
    setTimeout(() => { setMsg("🦋 You transformed into a butterfly! Amazing!"); setShowRestart(true); }, 3200);
  }, []);

  // ── step ──────────────────────────────────────────────────────────────
  const step = useCallback(() => {
    const st = stRef.current; if (!st?.alive) return;
    st.dir = st.nextDir;
    const head = { x: (st.snake[0].x + st.dir.x + COLS) % COLS, y: (st.snake[0].y + st.dir.y + ROWS) % ROWS };
    if (st.snake.length > 3 && st.snake.some(s => s.x === head.x && s.y === head.y)) { doLose(st); return; }
    st.snake.unshift(head);
    let ate = false;
    for (let i = st.foods.length - 1; i >= 0; i--) {
      const f = st.foods[i]; if (f.x !== head.x || f.y !== head.y) continue;
      ate = true; addParticles(st, f.x * CELL + CELL / 2, f.y * CELL + CELL / 2, f.type);
      if (f.type === "healthy") { st.score += 10; st.health = Math.min(100, st.health + 8); if (st.snake.length > 1) st.snake.pop(); if (st.snake.length > 1) st.snake.pop(); st.foods.splice(i, 1); spawnFood(st); syncHUD(st); if (st.snake.length <= WIN_LEN) { doWin(st); return; } }
      else if (f.type === "bad") { st.health = Math.max(0, st.health - 15); st.snake.push({ ...st.snake[st.snake.length - 1] }); st.foods.splice(i, 1); spawnFood(st); syncHUD(st); if (st.health <= 0 || st.snake.length >= LOSE_LEN) { doLose(st); return; } }
      else { st.health = Math.max(0, st.health - 25); for (let k = 0; k < 3; k++)st.snake.push({ ...st.snake[st.snake.length - 1] }); st.foods.splice(i, 1); spawnFood(st); syncHUD(st); if (st.health <= 0 || st.snake.length >= LOSE_LEN) { doLose(st); return; } }
      break;
    }
    if (!ate) st.snake.pop();
    syncHUD(st); draw(st);
  }, [draw, syncHUD, spawnFood, doLose, doWin]);

  // ── init ──────────────────────────────────────────────────────────────
  const initGame = useCallback(() => {
    const st = { snake: [{ x: 12, y: 10 }, { x: 11, y: 10 }, { x: 10, y: 10 }], dir: { x: 1, y: 0 }, nextDir: { x: 1, y: 0 }, foods: [], score: 0, health: 100, alive: false, particles: [] };
    for (let i = 0; i < 5; i++)spawnFood(st);
    stRef.current = st; syncHUD(st); draw(st);
    setMsg("Press Start or any arrow key to begin"); setShowStart(true); setShowRestart(false);
  }, [draw, syncHUD, spawnFood]);

  useEffect(() => { if (shouldShow) initGame(); }, [shouldShow, initGame]);

  // ── start ─────────────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    const st = stRef.current; if (!st || st.alive) return;
    st.alive = true; setShowStart(false); setShowRestart(false); setMsg("");
    clearInterval(loopRef.current); loopRef.current = setInterval(step, SPEED);
    canvasRef.current?.focus();
  }, [step]);

  // ── keyboard ──────────────────────────────────────────────────────────
  const DMAP = { ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 } };
  const tryDir = useCallback((d) => {
    const st = stRef.current; if (!st || !d) return;
    if (d.x === -st.dir.x && d.y === -st.dir.y) return;
    st.nextDir = d; if (!st.alive) startGame();
  }, [startGame]);

  useEffect(() => {
    if (!shouldShow) return;
    const fn = (e) => { const d = DMAP[e.key]; if (d) { e.preventDefault(); tryDir(d); return; } if (e.key === "Enter" || e.key === " ") { e.preventDefault(); startGame(); } };
    window.addEventListener("keydown", fn); return () => window.removeEventListener("keydown", fn);
  }, [shouldShow, tryDir, startGame]);

  const t0 = useRef({ x: 0, y: 0 });
  const onTouchStart = (e) => { t0.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - t0.current.x, dy = e.changedTouches[0].clientY - t0.current.y;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
    tryDir(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? DMAP.ArrowRight : DMAP.ArrowLeft) : (dy > 0 ? DMAP.ArrowDown : DMAP.ArrowUp));
  };

  useEffect(() => () => clearInterval(loopRef.current), []);

  // ── dismiss overlay ───────────────────────────────────────────────────
  const dismissOverlay = () => {
    sessionStorage.setItem("game_visited", "1");
    clearInterval(loopRef.current);
    setHiding(true);
    setTimeout(() => setVisible(false), 650);
  };

  if (!shouldShow || !visible) return null;

  const { score, length, health } = hud;
  const hColor = health > 60 ? "#3d9b73" : health > 30 ? "#eab308" : "#ef4444";
  const sPct = Math.min(100, ((length - 1) / (LOSE_LEN - 1)) * 100);
  const sColor = sPct < 40 ? "#3d9b73" : sPct < 70 ? "#eab308" : "#ef4444";

  return (
    <div className={`chr-overlay${hiding ? " chr-hiding" : ""}`}>
      <div className="chr-backdrop" />
      <div className="chr-card">

        <div className="chr-title">🐛 Healthy Snake</div>
        <div className="chr-subtitle">
          Eat healthy to shrink and transform into a 🦋 — or eat junk and explode 💥<br />
          Keyboard arrows · Swipe on mobile
        </div>

        <div className="chr-hud">
          <span>Score: <b>{score}</b></span>
          <span>Length: <b>{length}</b>/20</span>
          <span>Health: <b>{health}%</b></span>
        </div>

        <div className="chr-bar-outer">
          <div className="chr-bar-inner" style={{ width: `${health}%`, background: hColor }} />
        </div>
        <div className="chr-bar-labels"><span>Health</span><span>Size — Win at 1 · Lose at 20</span></div>
        <div className="chr-bar-outer">
          <div className="chr-bar-inner" style={{ width: `${sPct}%`, background: sColor }} />
        </div>

        <canvas
          ref={canvasRef} className="chr-canvas"
          width={COLS * CELL} height={ROWS * CELL}
          tabIndex={0}
          onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
        />

        <div className="chr-msg">{msg}</div>

        <div className="chr-btns">
          {showStart && <button className="chr-game-btn" onClick={startGame}>▶ Start</button>}
          {showRestart && <button className="chr-game-btn" onClick={() => { clearInterval(loopRef.current); initGame(); }}>↺ Restart</button>}
        </div>

        <div className="chr-legend">
          <span><span className="chr-dot" style={{ background: "#3d9b73" }} /> Healthy — shrinks you</span>
          <span><span className="chr-dot" style={{ background: "#ef4444" }} /> Junk — grows you</span>
          <span><span className="chr-dot" style={{ background: "#eab308" }} /> Danger!</span>
        </div>

        {/* ─ Enter button ─ */}
        <button className="chr-enter-btn" onClick={dismissOverlay}>
          🦋 Begin Your Health Journey
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>

      </div>
    </div>
  );
}