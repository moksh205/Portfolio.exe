import * as THREE from "three";

const cache = {};

function make(key, w, h, draw, nearest = false) {
  if (cache[key]) return cache[key];
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  if (nearest) tex.magFilter = THREE.NearestFilter;
  tex.anisotropy = 4;
  return (cache[key] = tex);
}

// Light sage checked shirt (like the avatar)
export const shirtTexture = () =>
  make(
    "shirt",
    64,
    64,
    (g, w, h) => {
      g.fillStyle = "#dfe8e2";
      g.fillRect(0, 0, w, h);
      g.fillStyle = "rgba(110,140,125,0.55)";
      for (let i = 0; i < w; i += 16) {
        g.fillRect(i, 0, 6, h);
        g.fillRect(0, i, w, 6);
      }
    },
    true
  );

// Laptop screen: an editor with coloured code lines
export const codeTexture = () =>
  make("code", 512, 320, (g, w, h) => {
    g.fillStyle = "#0f172a";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#1e293b";
    g.fillRect(0, 0, w, 26);
    ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
      g.fillStyle = c;
      g.beginPath();
      g.arc(16 + i * 18, 13, 5, 0, Math.PI * 2);
      g.fill();
    });
    const colors = ["#34d399", "#93c5fd", "#f9a8d4", "#fcd34d", "#cbd5e1"];
    let seed = 7;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let y = 46; y < h - 10; y += 20) {
      let x = 20 + Math.floor(rnd() * 3) * 24;
      const parts = 1 + Math.floor(rnd() * 4);
      for (let p = 0; p < parts && x < w - 40; p++) {
        const len = 30 + rnd() * 110;
        g.fillStyle = colors[Math.floor(rnd() * colors.length)];
        g.globalAlpha = 0.9;
        g.fillRect(x, y, len, 8);
        x += len + 12;
      }
    }
    g.globalAlpha = 1;
  });

// Soft round shadow drawn under floating objects
export const shadowTexture = () =>
  make("shadow", 128, 128, (g, w) => {
    const grd = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    grd.addColorStop(0, "rgba(15,23,42,0.35)");
    grd.addColorStop(1, "rgba(15,23,42,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, w, w);
  });
