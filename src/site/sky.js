import * as THREE from "three";

// How the 3D world looks at each time of day (see PHASES in theme.js).
// sky = fog colour (matches the page background), sun = sunlight / moonlight.
const LOOKS = {
  morning: { sky: "#fdf3e4", sun: "#ffd9a8", power: 1.5, ambient: 0.5, hemiSky: "#ffffff", hemiGround: "#e7e5e4", hemi: 0.7, ground: "#efe9df", path: "#ffffff" },
  day: { sky: "#f4f8f6", sun: "#ffffff", power: 1.8, ambient: 0.5, hemiSky: "#ffffff", hemiGround: "#e7e5e4", hemi: 0.7, ground: "#ece9e2", path: "#ffffff" },
  evening: { sky: "#fbe8d6", sun: "#ffb36b", power: 1.5, ambient: 0.42, hemiSky: "#ffe6cc", hemiGround: "#d9c7b8", hemi: 0.6, ground: "#eadfd2", path: "#fff6ec" },
  night: { sky: "#0d1322", sun: "#9db4ff", power: 0.6, ambient: 0.2, hemiSky: "#4a5d99", hemiGround: "#10141f", hemi: 0.5, ground: "#1b2131", path: "#394159" },
};

const COLOR_KEYS = ["sky", "sun", "hemiSky", "hemiGround", "ground", "path"];
const NUM_KEYS = ["power", "ambient", "hemi"];

const TARGETS = Object.fromEntries(
  Object.entries(LOOKS).map(([k, v]) => [k, { ...v, ...Object.fromEntries(COLOR_KEYS.map((c) => [c, new THREE.Color(v[c])])) }])
);

export function makeLook(phase) {
  const t = TARGETS[phase];
  return { ...t, ...Object.fromEntries(COLOR_KEYS.map((c) => [c, t[c].clone()])) };
}

// ease `look` towards the phase's look (k = 0..1 per frame) so changes fade in smoothly
export function stepLook(look, phase, k) {
  const t = TARGETS[phase];
  COLOR_KEYS.forEach((c) => look[c].lerp(t[c], k));
  NUM_KEYS.forEach((n) => (look[n] += (t[n] - look[n]) * k));
  return look;
}
