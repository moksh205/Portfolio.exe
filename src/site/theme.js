import { useSyncExternalStore } from "react";

// ---------- time of day (visitor's local clock) ----------
// morning / day / evening are light, night is dark. `sky` is the page background.
export const PHASES = {
  morning: { label: "Good morning", icon: "🌅", dark: false, sky: "#fdf3e4" },
  day: { label: "Good afternoon", icon: "☀️", dark: false, sky: "#f4f8f6" },
  evening: { label: "Good evening", icon: "🌇", dark: false, sky: "#fbe8d6" },
  night: { label: "Good night", icon: "🌙", dark: true, sky: "#0d1322" },
};

export function phaseAt(d) {
  const h = d.getHours() + d.getMinutes() / 60;
  if (h >= 5.5 && h < 11) return "morning";
  if (h >= 11 && h < 16.5) return "day";
  if (h >= 16.5 && h < 19) return "evening";
  return "night";
}

// ---------- festivals (switch on by date, automatically) ----------
// `fx` picks the effect in FestivalFX.jsx
export const FESTIVALS = {
  newyear: { name: "Happy New Year", emoji: "🎆", fx: "fireworks" },
  republic: { name: "Happy Republic Day", emoji: "🇮🇳", fx: "tricolor" },
  holi: { name: "Happy Holi", emoji: "🎨", fx: "holi" },
  independence: { name: "Happy Independence Day", emoji: "🇮🇳", fx: "tricolor" },
  diwali: { name: "Happy Diwali", emoji: "🪔", fx: "diwali" },
  christmas: { name: "Merry Christmas", emoji: "🎄", fx: "snow" },
};

// Holi and Diwali follow the lunar calendar, so their dates change every year (main day, MM-DD).
// Source: Drik Panchang. Add a line each year to keep them going past 2030.
const LUNAR = {
  holi: { 2025: "03-14", 2026: "03-04", 2027: "03-22", 2028: "03-11", 2029: "03-01", 2030: "03-20" },
  diwali: { 2025: "10-20", 2026: "11-08", 2027: "10-29", 2028: "10-17", 2029: "11-05", 2030: "10-26" },
};

export function festivalAt(d) {
  const y = d.getFullYear();
  const today = new Date(y, d.getMonth(), d.getDate()).getTime();
  const on = (m, day, before = 0, after = 0) =>
    today >= new Date(y, m - 1, day - before).getTime() && today <= new Date(y, m - 1, day + after).getTime();
  const lunar = (key, before, after) => {
    const md = LUNAR[key][y];
    if (!md) return false;
    const [m, day] = md.split("-").map(Number);
    return on(m, day, before, after);
  };

  if (on(12, 31) || on(1, 1, 0, 1)) return "newyear"; // 31 Dec – 2 Jan
  if (on(1, 26)) return "republic";
  if (lunar("holi", 1, 0)) return "holi"; // Holika Dahan + Holi
  if (on(8, 15)) return "independence";
  if (lunar("diwali", 2, 2)) return "diwali"; // Dhanteras → Bhai Dooj
  if (on(12, 24, 0, 2)) return "christmas"; // 24 – 26 Dec
  return null;
}

// ---------- shared state ----------
// Preview any look with the URL: ?theme=night  ?festival=diwali  ?festival=none
function compute() {
  const now = new Date();
  const q = new URLSearchParams(window.location.search);
  const qt = q.get("theme");
  const qf = q.get("festival");
  const phase = PHASES[qt] ? qt : phaseAt(now);
  const festival = qf === "none" ? null : FESTIVALS[qf] ? qf : festivalAt(now);
  return { phase, dark: PHASES[phase].dark, festival };
}

let state = compute();
const subs = new Set();

function apply() {
  const root = document.documentElement;
  root.dataset.theme = state.dark ? "dark" : "light";
  root.dataset.phase = state.phase;
  if (state.festival) root.dataset.festival = state.festival;
  else delete root.dataset.festival;
  root.style.setProperty("--sky", PHASES[state.phase].sky);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", PHASES[state.phase].sky);
}
apply();

// re-check every minute (and when the tab comes back) so it changes on its own
function refresh() {
  const next = compute();
  if (next.phase === state.phase && next.festival === state.festival) return;
  state = next;
  apply();
  subs.forEach((f) => f());
}
setInterval(refresh, 60 * 1000);
document.addEventListener("visibilitychange", () => !document.hidden && refresh());

export const getTheme = () => state;
const subscribe = (f) => {
  subs.add(f);
  return () => subs.delete(f);
};
export function useTheme() {
  return useSyncExternalStore(subscribe, getTheme);
}
