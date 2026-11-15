import { useSyncExternalStore } from "react";
import { getTheme } from "./theme";

// All sound is made live with the Web Audio API (no audio files):
//  - jungle bed: rustling leaves + soft wind
//  - critters: birds (incl. a koel) by day, crickets + an owl at night (follows theme.js)
//  - footsteps: soft crunchy steps, triggered by the walker in World.jsx
// Browsers only allow audio after a click/tap, so it starts from the 🔊 button.

const PREF_KEY = "sound";
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

let ctx = null;
let master, ambBus, critterBus, stepBus, noise;
let on = false;
let critterTimer = 0;
let cricketTimer = 0;
const subs = new Set();
const emit = () => subs.forEach((f) => f());

function readPref() {
  try {
    return localStorage.getItem(PREF_KEY) === "on";
  } catch {
    return false;
  }
}
function savePref(v) {
  try {
    localStorage.setItem(PREF_KEY, v ? "on" : "off");
  } catch {
    /* ignore */
  }
}

// ---------- building blocks ----------
function makeNoise(seconds = 3) {
  const len = ctx.sampleRate * seconds;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  // pink-ish noise (Paul Kellet's filter): softer and more natural than white noise
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179;
    b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.969 * b2 + w * 0.153852;
    b3 = 0.8665 * b3 + w * 0.3104856;
    b4 = 0.55 * b4 + w * 0.5329522;
    b5 = -0.7616 * b5 - w * 0.016898;
    d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
    b6 = w * 0.115926;
  }
  return buf;
}

const gainNode = (v, to) => {
  const g = ctx.createGain();
  g.gain.value = v;
  if (to) g.connect(to);
  return g;
};
const panNode = (p, to) => {
  const n = ctx.createStereoPanner();
  n.pan.value = p;
  n.connect(to);
  return n;
};

// a looping noise layer, filtered, with a slow "breathing" swell
function noiseLayer({ type, freq, q = 0.7, level, swell, rate }) {
  const src = ctx.createBufferSource();
  src.buffer = noise;
  src.loop = true;
  src.loopStart = rand(0, 1);
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = gainNode(level, ambBus);
  const lfo = ctx.createOscillator();
  lfo.frequency.value = rate;
  const depth = gainNode(swell);
  lfo.connect(depth).connect(g.gain);
  src.connect(f).connect(g);
  src.start(0, rand(0, 2));
  lfo.start();
}

// ---------- critters ----------
function tone(t, { f0, f1, dur, vol, type = "sine", pan = 0, vib = 0, vibRate = 0 }) {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  if (vib) {
    const l = ctx.createOscillator();
    l.frequency.value = vibRate;
    const d = gainNode(vib);
    l.connect(d).connect(o.frequency);
    l.start(t);
    l.stop(t + dur + 0.05);
  }
  const g = gainNode(0);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.02, dur * 0.3));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(panNode(pan, critterBus));
  o.start(t);
  o.stop(t + dur + 0.05);
}

const BIRDS = {
  // quick falling tweets
  tweet(t, pan) {
    const n = Math.floor(rand(3, 7));
    const base = rand(3000, 4600);
    for (let i = 0; i < n; i++) tone(t + i * rand(0.09, 0.13), { f0: base * rand(1, 1.1), f1: base * 0.7, dur: 0.07, vol: 0.05, pan });
  },
  // slow two-note whistle
  whistle(t, pan) {
    const f = rand(1700, 2300);
    tone(t, { f0: f, f1: f * 1.35, dur: 0.32, vol: 0.045, pan });
    tone(t + 0.42, { f0: f * 1.2, f1: f * 0.95, dur: 0.38, vol: 0.04, pan });
  },
  // fluttery trill
  trill(t, pan) {
    tone(t, { f0: rand(3200, 3800), f1: rand(2800, 3300), dur: rand(0.4, 0.8), vol: 0.03, pan, vib: 380, vibRate: rand(24, 34) });
  },
  // koel: rising "ku-oo" repeated, each one higher
  koel(t, pan) {
    const n = Math.floor(rand(3, 6));
    for (let i = 0; i < n; i++) {
      const f = 620 * (1 + i * 0.07);
      tone(t + i * 0.62, { f0: f * 0.85, f1: f * 1.25, dur: 0.38, vol: 0.05, pan, type: "triangle" });
    }
  },
};

function owl(t) {
  const pan = rand(-0.7, 0.7);
  tone(t, { f0: 390, f1: 350, dur: 0.38, vol: 0.06, pan, vib: 6, vibRate: 7 });
  tone(t + 0.55, { f0: 380, f1: 330, dur: 0.6, vol: 0.05, pan, vib: 6, vibRate: 7 });
}

// a cricket chirp = 3 tiny pulses
function cricket(t, f, pan) {
  for (let i = 0; i < 3; i++) tone(t + i * 0.045, { f0: f, f1: f * 0.98, dur: 0.028, vol: 0.018, pan });
}

function scheduleCritters() {
  const { phase } = getTheme();
  const t = ctx.currentTime + 0.05;
  if (phase === "night") {
    if (Math.random() < 0.18) owl(t);
  } else {
    const kinds = phase === "evening" ? ["whistle", "koel", "tweet"] : ["tweet", "tweet", "whistle", "trill", "koel"];
    BIRDS[pick(kinds)](t, rand(-0.85, 0.85));
  }
  const gap = phase === "night" ? rand(3, 7) : phase === "evening" ? rand(2, 5) : rand(1.2, 3.5);
  critterTimer = setTimeout(scheduleCritters, gap * 1000);
}

// crickets chirp steadily at evening and night
const CRICKETS = [
  { f: 4400, pan: -0.5, every: 0.62 },
  { f: 4750, pan: 0.45, every: 0.81 },
];
function scheduleCrickets() {
  const { phase } = getTheme();
  if (phase === "night" || phase === "evening") {
    const t = ctx.currentTime;
    CRICKETS.forEach((c, i) => {
      if (phase === "evening" && i > 0) return;
      for (let k = t; k < t + 1; k += c.every) cricket(k + rand(0, 0.03), c.f, c.pan);
    });
  }
  cricketTimer = setTimeout(scheduleCrickets, 1000);
}

// ---------- setup ----------
function init() {
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = gainNode(0, ctx.destination);
  ambBus = gainNode(1, master);
  critterBus = gainNode(1, master);
  stepBus = gainNode(1, master);
  noise = makeNoise();

  noiseLayer({ type: "lowpass", freq: 380, level: 0.12, swell: 0.07, rate: 0.07 }); // wind
  noiseLayer({ type: "bandpass", freq: 2600, q: 0.6, level: 0.035, swell: 0.03, rate: 0.19 }); // leaves
  noiseLayer({ type: "bandpass", freq: 5200, q: 1.2, level: 0.012, swell: 0.012, rate: 0.31 }); // far canopy hiss

  scheduleCritters();
  scheduleCrickets();

  document.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend();
    else if (on) ctx.resume();
  });
}

function setOn(v) {
  on = v;
  savePref(v);
  if (v) {
    if (!ctx) init();
    ctx.resume();
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0.8, ctx.currentTime, 0.6); // fade in
  } else if (ctx) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
    setTimeout(() => !on && ctx.suspend(), 900);
  }
  emit();
}

export const toggleSound = () => setOn(!on);

// If they turned sound on last visit, start again on their first click / key press
if (readPref()) {
  const arm = (e) => {
    if (e.target?.closest?.("[data-sound-toggle]")) return; // the button handles itself
    window.removeEventListener("click", arm);
    window.removeEventListener("keydown", arm);
    if (!on) setOn(true);
  };
  // click/keydown count as a real user action on every browser (iPhone ignores touch-start)
  window.addEventListener("click", arm);
  window.addEventListener("keydown", arm);
}

// One footstep. `side` alternates 0/1, `speed` (units/s) makes faster steps a bit louder.
export function footstep(side, speed = 2.8) {
  if (!on || !ctx || ctx.state !== "running") return;
  const t = ctx.currentTime;
  const loud = Math.min(1.3, 0.75 + speed * 0.1) * rand(0.85, 1.1);
  const out = panNode(side ? 0.12 : -0.12, stepBus);

  // body of the step: dull noise thud
  const s1 = ctx.createBufferSource();
  s1.buffer = noise;
  const f1 = ctx.createBiquadFilter();
  f1.type = "bandpass";
  f1.frequency.value = rand(380, 720) * (side ? 1.08 : 1);
  f1.Q.value = 0.9;
  const g1 = gainNode(0);
  g1.gain.setValueAtTime(0.0001, t);
  g1.gain.exponentialRampToValueAtTime(0.5 * loud, t + 0.008);
  g1.gain.exponentialRampToValueAtTime(0.0001, t + rand(0.1, 0.15));
  s1.connect(f1).connect(g1).connect(out);
  s1.start(t, rand(0, 2.5), 0.2);

  // crunch of leaves / gravel on top
  const s2 = ctx.createBufferSource();
  s2.buffer = noise;
  const f2 = ctx.createBiquadFilter();
  f2.type = "highpass";
  f2.frequency.value = rand(2200, 3400);
  const g2 = gainNode(0);
  g2.gain.setValueAtTime(0.0001, t + 0.01);
  g2.gain.exponentialRampToValueAtTime(0.16 * loud, t + 0.02);
  g2.gain.exponentialRampToValueAtTime(0.0001, t + rand(0.06, 0.1));
  s2.connect(f2).connect(g2).connect(out);
  s2.start(t, rand(0, 2.5), 0.15);

  // low heel thump
  tone(t, { f0: 95, f1: 55, dur: 0.07, vol: 0.18 * loud });
}

// ---------- React hook for the button ----------
const subscribe = (f) => {
  subs.add(f);
  return () => subs.delete(f);
};
export const useSoundOn = () => useSyncExternalStore(subscribe, () => on);
export const soundWanted = readPref;

// stop timers on hot reload in dev
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    clearTimeout(critterTimer);
    clearTimeout(cricketTimer);
    ctx?.close();
  });
}
