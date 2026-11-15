import { useEffect, useRef, useState } from "react";
import { FaArrowRight, FaCode, FaShieldAlt, FaTerminal, FaGithub, FaLinkedin, FaEnvelope, FaWalking } from "react-icons/fa";
import { profile } from "../data/projectsData";
import ProjectsSection from "./sections/ProjectsSection";
import { SkillsSection, ExperienceSection, ContactSection } from "./sections/Sections";
import { Typewriter, SkillMarquee } from "./ui";
import { SECTION_IDS } from "./sections";
import { journey, journeyAt, anchorVh, TOTAL, VH_PER_UNIT } from "./timeline";

const ROLES = profile.role.split("|").map((s) => s.trim());
const [FIRST, ...REST] = profile.name.split(" ");
const TITLES = { hero: "Home", about: "About", skills: "Skills", projects: "Projects", experience: "Experience", contact: "Contact" };

const SOCIALS = [
  { href: profile.github, label: "GitHub", Icon: FaGithub },
  { href: profile.linkedin, label: "LinkedIn", Icon: FaLinkedin },
  { href: `mailto:${profile.email}`, label: "Email", Icon: FaEnvelope },
];

const WHAT_I_DO = [
  { icon: FaShieldAlt, title: "Security", text: "Cybersecurity is my main focus." },
  { icon: FaCode, title: "Web development", text: "React, Node.js and Tailwind." },
  { icon: FaTerminal, title: "Programming", text: "Python, C and C++." },
];

function Heading({ eyebrow, title, intro }) {
  return (
    <>
      <p className="inline-flex items-center gap-2 font-mono text-xs text-emerald-600 mb-3">
        <span className="w-6 h-px bg-emerald-500" /> {eyebrow}
      </p>
      <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900 leading-[1.1]">{title}</h2>
      {intro && <p className="mt-3 text-stone-500 leading-relaxed">{intro}</p>}
    </>
  );
}

function HeroCard() {
  return (
    <div>
      <p className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-white border border-stone-200 text-sm text-stone-600 mb-5 shadow-sm">
        <span className="grid place-items-center w-5 h-5 rounded-full bg-emerald-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </span>
        Hello there 👋
      </p>
      <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-stone-900 leading-[1.02]">
        I'm {FIRST}
        <br />
        <span className="text-gradient">{REST.join(" ") || FIRST}</span>
        <span className="text-emerald-500">.</span>
      </h1>
      <p className="mt-5 text-xl sm:text-2xl leading-snug min-h-[2em]">
        <Typewriter words={ROLES} className="text-stone-800 font-medium" />
      </p>
      {/* TODO: personalise */}
      <p className="mt-2 text-stone-500 max-w-md leading-relaxed">
        I build web apps and explore security — breaking things to learn how to protect them.
      </p>
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <a href="#about" className="group inline-flex items-center gap-2 h-12 px-6 rounded-full bg-stone-900 text-white font-medium hover:bg-stone-700 shadow-[0_10px_30px_-10px_rgba(28,25,23,0.6)] transition">
          Start the walk <FaArrowRight className="text-sm group-hover:translate-x-0.5 transition" />
        </a>
        <span className="flex items-center gap-1">
          {SOCIALS.map(({ href, label, Icon }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}
              className="grid place-items-center w-10 h-10 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-900/5 transition">
              <Icon />
            </a>
          ))}
        </span>
      </div>
      <p className="hidden md:flex items-center gap-1.5 mt-5 text-sm text-stone-500">
        <kbd className="grid place-items-center min-w-7 h-7 px-1.5 rounded-md border border-stone-300 border-b-2 bg-white font-mono text-xs text-stone-700">←</kbd>
        <kbd className="grid place-items-center min-w-7 h-7 px-1.5 rounded-md border border-stone-300 border-b-2 bg-white font-mono text-xs text-stone-700">→</kbd>
        <span className="ml-1">or scroll to walk</span>
      </p>
      <div className="mt-6 max-w-md rounded-2xl border border-stone-200/70 bg-white/60">
        <SkillMarquee />
      </div>
    </div>
  );
}

const CARDS = {
  hero: <HeroCard />,
  about: (
    <>
      <Heading
        eyebrow="01 — About"
        title="Breaking things to learn how to protect them."
        // TODO: personalise this intro
        intro="I'm a developer with a soft spot for security. I like understanding how systems work — and how they fail."
      />
      <div className="mt-6 grid sm:grid-cols-3 gap-2.5">
        {WHAT_I_DO.map(({ icon: Icon, title, text }) => (
          <div key={title} className="spot p-3.5 rounded-2xl bg-white border border-stone-200">
            <span className="grid place-items-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 mb-2.5">
              <Icon />
            </span>
            <p className="font-medium text-stone-900 text-sm">{title}</p>
            <p className="text-stone-500 text-xs mt-1">{text}</p>
          </div>
        ))}
      </div>
    </>
  ),
  skills: (
    <>
      <Heading eyebrow="02 — Skills" title="My toolkit." intro="The languages and tools I build with." />
      <div className="mt-6">
        <SkillsSection />
      </div>
    </>
  ),
  projects: (
    <>
      <Heading eyebrow="03 — Projects" title="Things I've built." intro="Pulled live from my GitHub — newest first." />
      <div className="mt-6">
        <ProjectsSection />
      </div>
    </>
  ),
  experience: (
    <>
      <Heading eyebrow="04 — Experience" title="The journey so far." />
      <div className="mt-6">
        <ExperienceSection />
      </div>
    </>
  ),
  contact: (
    <>
      <Heading eyebrow="05 — Contact" title={<>Let's build something <span className="text-gradient">together.</span></>} />
      <div className="mt-6">
        <ContactSection />
      </div>
    </>
  ),
};

// The page is one tall scroll area. Scrolling walks mini-me along the 3D path;
// at each stop, that section's card fades in.
export default function Journey() {
  const wrap = useRef(null);
  const [scrollState, setState] = useState({ stop: 0, next: 0, past: false });
  const [arrived, setArrived] = useState(journey.arrived);

  // the 3D world says when he has actually reached a stop
  useEffect(() => {
    const onArrive = () => setArrived(journey.arrived);
    window.addEventListener("journey-arrive", onArrive);
    return () => window.removeEventListener("journey-arrive", onArrive);
  }, []);

  // a card only shows once he's standing at its stop (or straight away if the 3D world isn't loaded)
  const waiting = arrived !== null && arrived !== scrollState.stop;
  const state = waiting
    ? { ...scrollState, stop: -1, next: scrollState.stop >= 0 ? scrollState.stop : scrollState.next }
    : scrollState;

  useEffect(() => {
    const onScroll = () => {
      const el = wrap.current;
      if (!el) return;
      const top = el.offsetTop;
      const len = el.offsetHeight - window.innerHeight;
      const s = Math.min(1, Math.max(0, (window.scrollY - top) / len));
      journey.s = s;
      const { stop, next } = journeyAt(s);
      const past = window.scrollY > top + len + window.innerHeight * 0.15; // scrolled on to the footer
      setState((prev) => (prev.stop === stop && prev.next === next && prev.past === past ? prev : { stop, next, past }));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // ← / → walk him along the path. Tap = go to the next stop; hold = keep walking.
  useEffect(() => {
    let dir = 0;
    let raf = 0;
    let last = 0;
    const SPEED = 0.6; // screen heights per second

    const stopTargets = () => {
      const top = wrap.current?.offsetTop ?? 0;
      return SECTION_IDS.map((_, i) => top + (anchorVh(i) * window.innerHeight) / 100);
    };
    const tick = (t) => {
      const dt = Math.min(50, t - (last || t));
      last = t;
      window.scrollBy({ top: dir * dt * SPEED * window.innerHeight / 1000, behavior: "instant" });
      raf = requestAnimationFrame(tick);
    };
    const release = () => {
      if (!dir) return;
      cancelAnimationFrame(raf);
      const y = window.scrollY;
      const targets = stopTargets();
      const goal = dir > 0 ? targets.find((v) => v > y + 2) : targets.findLast((v) => v < y - 2);
      dir = 0;
      if (goal !== undefined) window.scrollTo({ top: goal, behavior: "smooth" });
    };
    const typing = (el) => el?.closest?.("input, textarea, select, [contenteditable='true']");

    const onDown = (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || typing(e.target)) return;
      e.preventDefault();
      const d = e.key === "ArrowRight" ? 1 : -1;
      if (e.repeat || dir === d) return;
      cancelAnimationFrame(raf);
      dir = d;
      last = 0;
      raf = requestAnimationFrame(tick);
    };
    const onUp = (e) => {
      if ((e.key === "ArrowRight" && dir > 0) || (e.key === "ArrowLeft" && dir < 0)) release();
    };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", release);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", release);
    };
  }, []);

  return (
    <div ref={wrap} className="relative" style={{ height: `${TOTAL * VH_PER_UNIT + 100}vh` }}>
      {/* invisible anchors so the nav / dots / #links land on each stop */}
      {SECTION_IDS.map((id, i) => (
        <div key={id} id={id} aria-hidden className="absolute left-0 w-px h-px" style={{ top: `${anchorVh(i)}vh` }} />
      ))}

      {/* cards (fixed over the 3D world) */}
      <div className={`fixed inset-0 z-10 pointer-events-none transition-opacity duration-300 ${state.past ? "opacity-0 invisible" : ""}`}>
        {/* soft wash on the left so text stays readable over the world (desktop) */}
        <div
          aria-hidden
          style={{ background: "linear-gradient(90deg, var(--sky, #fafaf9) 0%, color-mix(in srgb, var(--sky, #fafaf9) 80%, transparent) 50%, transparent 100%)" }}
          className={`hidden md:block absolute inset-y-0 left-0 w-[60%] transition-opacity duration-500 ${
            state.stop >= 0 ? "opacity-100" : "opacity-0"
          }`}
        />
        {SECTION_IDS.map((id, i) => {
          const on = state.stop === i;
          return (
            <section
              key={id}
              aria-label={TITLES[id]}
              aria-hidden={!on || state.past}
              className={`absolute inset-x-0 bottom-0 md:inset-y-0 md:right-auto md:w-[min(560px,46vw)] md:left-[max(2rem,calc((100vw-72rem)/2+2rem))] flex md:items-center transition-all duration-500 ease-out ${
                on ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-6 pointer-events-none"
              }`}
            >
              <div
                className={`w-full max-h-[52vh] md:max-h-[78vh] overflow-y-auto thin-scrollbar rounded-t-3xl md:rounded-3xl p-5 sm:p-7 ${
                  id === "hero"
                    ? "bg-white/85 md:bg-transparent backdrop-blur-md md:backdrop-blur-none shadow-[0_-10px_40px_-20px_rgba(0,0,0,0.25)] md:shadow-none"
                    : "bg-white/90 backdrop-blur-md border border-stone-200/80 shadow-[0_20px_60px_-25px_rgba(28,25,23,0.35)]"
                }`}
                tabIndex={on ? 0 : -1}
              >
                {CARDS[id]}
              </div>
            </section>
          );
        })}

        {/* while walking between stops */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 bottom-8 md:bottom-10 transition-all duration-300 ${
            state.stop < 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          <span className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-white/90 backdrop-blur border border-stone-200 shadow-sm text-sm text-stone-600">
            <FaWalking className="text-emerald-500" /> Walking to <b className="text-stone-900 font-semibold">{TITLES[SECTION_IDS[state.next]]}</b>
          </span>
        </div>
      </div>
    </div>
  );
}
