import * as THREE from "three";

// Time of day along the walk: morning → midday → golden hour → dusk.
// sky = page background + fog, sun = sunlight colour, power = sunlight strength.
const KEYS = [
  { s: 0.0, sky: "#fdf5ea", sun: "#ffd9a8", power: 1.5 },
  { s: 0.35, sky: "#f5f8f6", sun: "#ffffff", power: 1.8 },
  { s: 0.7, sky: "#fbeedb", sun: "#ffc27a", power: 1.6 },
  { s: 1.0, sky: "#eee9f7", sun: "#ff9fb4", power: 1.25 },
].map((k) => ({ ...k, skyC: new THREE.Color(k.sky), sunC: new THREE.Color(k.sun) }));

export function skyAt(s, out = { sky: new THREE.Color(), sun: new THREE.Color(), power: 1.6 }) {
  let i = 0;
  while (i < KEYS.length - 2 && s > KEYS[i + 1].s) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const f = THREE.MathUtils.clamp((s - a.s) / (b.s - a.s), 0, 1);
  out.sky.copy(a.skyC).lerp(b.skyC, f);
  out.sun.copy(a.sunC).lerp(b.sunC, f);
  out.power = a.power + (b.power - a.power) * f;
  return out;
}
