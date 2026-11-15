import * as THREE from "three";

const cache = {};

function make(key, w, h, draw) {
  if (cache[key]) return cache[key];
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.anisotropy = 4;
  return (cache[key] = tex);
}

// Light sage checked shirt (like the avatar)
export const shirtTexture = () =>
  make("shirt", 64, 64, (g, w, h) => {
    g.fillStyle = "#dfe8e2";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(110,140,125,0.55)";
    for (let i = 0; i < w; i += 16) {
      g.fillRect(i, 0, 6, h);
      g.fillRect(0, i, w, 6);
    }
  });

// Office facade: grid of windows, most lit
export const officeTexture = () =>
  make("office", 128, 192, (g, w, h) => {
    g.fillStyle = "#3a4a6b";
    g.fillRect(0, 0, w, h);
    let seed = 3;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let y = 8; y < h - 8; y += 22) {
      for (let x = 8; x < w - 8; x += 30) {
        g.fillStyle = rnd() > 0.3 ? "#ffd98a" : "#1d2740";
        g.fillRect(x, y, 22, 14);
      }
    }
  });
