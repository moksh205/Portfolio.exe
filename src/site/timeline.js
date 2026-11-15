import { SECTION_IDS } from "./sections";

// Plain scroll maths (no three.js here, so the page itself stays light).
// Scrolling = walking a path. Each section is a "stop" where mini-Moksh pauses (HOLD)
// and its card shows; between stops he walks (WALK). Units are arbitrary scroll lengths.
export const HOLD = 1.2;
export const WALK = 1;
export const STOPS = SECTION_IDS.length;
export const TOTAL = STOPS * HOLD + (STOPS - 1) * WALK;
export const VH_PER_UNIT = 65; // page height per unit (vh)
export const STOP_U = SECTION_IDS.map((_, i) => i / (STOPS - 1)); // evenly spaced along the path

// Where in the page (vh from the top of the journey) each stop's anchor sits
export const anchorVh = (i) => (i * (HOLD + WALK) + (i === 0 ? 0 : 0.25)) * VH_PER_UNIT;

const smooth = (x) => x * x * (3 - 2 * x);

// scroll progress 0..1 → { u: position along the path, stop: index while paused (or -1), next: index walking towards }
export function journeyAt(s) {
  const x = Math.min(TOTAL, Math.max(0, s * TOTAL));
  for (let i = 0; i < STOPS; i++) {
    const holdStart = i * (HOLD + WALK);
    const holdEnd = holdStart + HOLD;
    if (x <= holdEnd) {
      if (x >= holdStart) return { u: STOP_U[i], stop: i, next: i };
      // walking from i-1 to i
      const f = smooth((x - (holdStart - WALK)) / WALK);
      return { u: STOP_U[i - 1] + (STOP_U[i] - STOP_U[i - 1]) * f, stop: -1, next: i };
    }
  }
  return { u: 1, stop: STOPS - 1, next: STOPS - 1 };
}

// Shared, updated on scroll; the 3D loop reads it every frame without re-rendering React
// `arrived`: the stop he is standing at (-1 while walking), or null until the 3D world has loaded
export const journey = { s: 0, arrived: null };

// Drop a rigged model of yourself here (with idle / walk / wave clips) and it replaces the chibi mini-me
export const AVATAR_URL = "/models/avatar.glb";
