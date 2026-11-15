import { useEffect, useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { FESTIVALS, useTheme } from "./theme";

// Festival effects drawn on a 2D canvas above the 3D world and below the cards.
// They turn on by date (theme.js). Click / tap anywhere for an extra burst.

const PALETTES = {
  fireworks: ["#fde68a", "#f472b6", "#60a5fa", "#34d399", "#f87171", "#c084fc"],
  diwali: ["#fbbf24", "#f59e0b", "#fb923c", "#fde68a", "#f43f5e", "#facc15"],
  tricolor: ["#ff9933", "#ffffff", "#138808"],
  holi: ["#ec4899", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#ef4444", "#facc15"],
  snow: ["#ffffff"],
};

// phones: fewer particles and lower resolution so scrolling stays smooth
const LITE = typeof window !== "undefined" && window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
const MAX_PARTS = LITE ? 350 : 900;

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function makeEngine(kind, dark) {
  const colors = PALETTES[kind];
  const parts = [];
  let spawnT = 0;
  let w = 0;
  let h = 0;

  const burst = (x, y, n = LITE ? 40 : 70) => {
    const c = pick(colors);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rand(-0.05, 0.05);
      const v = rand(1.6, 4.2);
      parts.push({ t: "spark", x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, decay: rand(0.008, 0.016), c: Math.random() < 0.25 ? pick(colors) : c, s: rand(1.4, 2.6) });
    }
  };
  const rocket = () =>
    parts.push({ t: "rocket", x: rand(w * 0.15, w * 0.85), y: h + 10, vx: rand(-0.6, 0.6), vy: rand(-10.5, -8), c: pick(colors), life: 1 });
  const confetti = (x = rand(0, w), y = -12, vy = rand(0.8, 1.8)) =>
    parts.push({ t: "confetti", x, y, vx: rand(-0.6, 0.6), vy, r: rand(0, 6.28), vr: rand(-0.12, 0.12), c: pick(colors), s: rand(5, 9), life: 1, sway: rand(0, 6.28) });
  const flake = () => parts.push({ t: "flake", x: rand(0, w), y: -10, vy: rand(0.4, 1.3), s: rand(1.2, 3.4), sway: rand(0, 6.28), life: 1 });
  const puff = (x = rand(0, w), y = rand(h * 0.2, h), big = false) =>
    parts.push({ t: "puff", x, y, vx: rand(-0.4, 0.4), vy: rand(-0.6, -0.1), c: pick(colors), s: big ? rand(40, 80) : rand(18, 46), grow: rand(0.2, 0.6), life: 1, decay: rand(0.004, 0.008) });

  const ambient = {
    fireworks: { every: 1.4, fn: rocket },
    diwali: { every: 1.8, fn: rocket },
    tricolor: { every: 0.12, fn: () => confetti() },
    snow: { every: 0.05, fn: flake },
    holi: { every: 0.35, fn: () => puff() },
  }[kind];
  if (LITE) ambient.every *= 1.6; // calmer on phones

  return {
    resize(W, H) {
      w = W;
      h = H;
    },
    click(x, y) {
      if (kind === "fireworks" || kind === "diwali") burst(x, y, 80);
      else if (kind === "tricolor") for (let i = 0; i < 40; i++) confetti(x + rand(-20, 20), y + rand(-20, 20), rand(-3, 1));
      else if (kind === "holi") for (let i = 0; i < 6; i++) puff(x + rand(-30, 30), y + rand(-30, 30), true);
      else if (kind === "snow") for (let i = 0; i < 12; i++) parts.push({ t: "flake", x: x + rand(-40, 40), y: y + rand(-40, 40), vy: rand(0.4, 1.3), s: rand(1.5, 3.5), sway: rand(0, 6.28), life: 1 });
    },
    frame(g, dt) {
      spawnT += dt;
      while (spawnT > ambient.every) {
        spawnT -= ambient.every;
        if (parts.length < MAX_PARTS) ambient.fn();
      }
      const step = dt * 60;
      g.clearRect(0, 0, w, h);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        if (p.t === "rocket") {
          p.x += p.vx * step;
          p.y += p.vy * step;
          p.vy += 0.16 * step;
          g.fillStyle = p.c;
          g.globalAlpha = 0.9;
          g.fillRect(p.x - 1, p.y, 2, 7);
          if (p.vy > -1.5 || p.y < h * 0.12) {
            burst(p.x, p.y);
            parts.splice(i, 1);
          }
        } else if (p.t === "spark") {
          p.x += p.vx * step;
          p.y += p.vy * step;
          p.vx *= 0.985;
          p.vy = p.vy * 0.985 + 0.045 * step;
          p.life -= p.decay * step;
          g.globalAlpha = Math.max(0, p.life);
          g.fillStyle = p.c;
          g.beginPath();
          g.arc(p.x, p.y, p.s, 0, 6.28);
          g.fill();
        } else if (p.t === "confetti") {
          p.sway += 0.05 * step;
          p.x += (p.vx + Math.sin(p.sway) * 0.6) * step;
          p.y += p.vy * step;
          p.vy = Math.min(p.vy + 0.03 * step, 2.2);
          p.r += p.vr * step;
          if (p.y > h + 20) p.life = 0;
          g.globalAlpha = 0.9;
          g.save();
          g.translate(p.x, p.y);
          g.rotate(p.r);
          g.scale(1, Math.cos(p.sway * 1.3)); // flip like paper
          g.fillStyle = p.c === "#ffffff" && !dark ? "#e7e5e4" : p.c;
          g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
          g.restore();
        } else if (p.t === "flake") {
          p.sway += 0.02 * step;
          p.x += Math.sin(p.sway) * 0.5 * step;
          p.y += p.vy * step;
          if (p.y > h + 10) p.life = 0;
          g.globalAlpha = dark ? 0.85 : 0.95;
          g.fillStyle = dark ? "#ffffff" : "#cbd5e1";
          g.beginPath();
          g.arc(p.x, p.y, p.s, 0, 6.28);
          g.fill();
        } else if (p.t === "puff") {
          p.x += p.vx * step;
          p.y += p.vy * step;
          p.s += p.grow * step;
          p.life -= p.decay * step;
          const grad = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.s);
          grad.addColorStop(0, p.c);
          grad.addColorStop(1, "transparent");
          g.globalAlpha = Math.max(0, p.life) * (dark ? 0.35 : 0.28);
          g.fillStyle = grad;
          g.beginPath();
          g.arc(p.x, p.y, p.s, 0, 6.28);
          g.fill();
        }
        if (p.life <= 0) parts.splice(i, 1);
      }
      g.globalAlpha = 1;
    },
  };
}

function FestivalCanvas({ kind, dark }) {
  const ref = useRef(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = ref.current;
    const g = canvas.getContext("2d");
    const engine = makeEngine(kind, dark);
    const dpr = LITE ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
    const size = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      engine.resize(window.innerWidth, window.innerHeight);
    };
    size();
    let raf = 0;
    let last = performance.now();
    const loop = (t) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      if (!document.hidden) engine.frame(g, dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    // "click" (not pointerdown) so starting a scroll on a phone doesn't set off a burst
    const onDown = (e) => engine.click(e.clientX, e.clientY);
    window.addEventListener("resize", size);
    window.addEventListener("click", onDown);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
      window.removeEventListener("click", onDown);
    };
  }, [kind, dark]);
  return <canvas ref={ref} aria-hidden className="fixed inset-0 z-[5] w-full h-full pointer-events-none" />;
}

function Greeting({ id }) {
  const key = `festival-hide-${id}-${new Date().getFullYear()}`;
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(key) === "1";
    } catch {
      return false;
    }
  });
  if (hidden) return null;
  const f = FESTIVALS[id];
  return (
    <div className="fixed top-[4.5rem] left-1/2 -translate-x-1/2 z-30 max-w-[calc(100vw-2rem)]">
      <div role="status" className="flex items-center gap-2 h-10 pl-4 pr-1.5 rounded-full bg-white/90 backdrop-blur border border-stone-200 shadow-lg text-sm text-stone-700">
        <span aria-hidden>{f.emoji}</span>
        <span className="font-medium text-stone-900 truncate">{f.name}!</span>
        <span className="hidden sm:inline text-stone-500">Click anywhere ✨</span>
        <span className="sm:hidden text-stone-500">Tap ✨</span>
        <button
          onClick={() => {
            setHidden(true);
            try {
              localStorage.setItem(key, "1");
            } catch {
              /* ignore */
            }
          }}
          aria-label="Hide greeting"
          className="grid place-items-center w-7 h-7 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition"
        >
          <FaTimes className="text-xs" />
        </button>
      </div>
    </div>
  );
}

export default function FestivalFX() {
  const { festival, dark } = useTheme();
  if (!festival) return null;
  return (
    <>
      <FestivalCanvas kind={FESTIVALS[festival].fx} dark={dark} />
      <Greeting key={festival} id={festival} />
    </>
  );
}
