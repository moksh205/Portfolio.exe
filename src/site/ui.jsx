import { useEffect, useState } from "react";
import { skills } from "../data/projectsData";
import { SECTION_IDS } from "./sections";
import { useActiveSection, useInView } from "./hooks";

// Fades + slides its children up the first time they scroll into view
export function Reveal({ children, delay = 0, as: Tag = "div", className = "" }) {
  const [ref, inView] = useInView();
  return (
    <Tag ref={ref} className={`reveal ${inView ? "reveal-in" : ""} ${className}`} style={{ "--d": `${delay}ms` }}>
      {children}
    </Tag>
  );
}

// Types each word, pauses, deletes it, moves to the next
export function Typewriter({ words, className = "" }) {
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[i % words.length];
    let delay = deleting ? 40 : 75;
    if (!deleting && text === word) delay = 1800;
    if (deleting && text === "") delay = 300;
    const t = setTimeout(() => {
      if (!deleting && text === word) setDeleting(true);
      else if (deleting && text === "") {
        setDeleting(false);
        setI((n) => n + 1);
      } else setText(word.slice(0, text.length + (deleting ? -1 : 1)));
    }, delay);
    return () => clearTimeout(t);
  }, [text, deleting, i, words]);

  return (
    <span className={className}>
      {text}
      <span className="caret" aria-hidden />
      <span className="sr-only">{words.join(", ")}</span>
    </span>
  );
}

// Endless strip of skill logos
export function SkillMarquee() {
  const row = [...skills, ...skills];
  return (
    <div className="marquee-mask overflow-hidden py-5" aria-label="Skills">
      <div className="marquee flex w-max gap-10 sm:gap-14">
        {row.map((s, i) => (
          <span key={i} aria-hidden={i >= skills.length} className="flex items-center gap-2.5 text-stone-400 whitespace-nowrap">
            <s.icon className="text-2xl" style={{ color: s.color }} />
            <span className="text-sm font-medium">{s.name}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// Thin emerald bar across the top showing how far down the page you are
export function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setP(max > 0 ? window.scrollY / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return (
    <div aria-hidden className="fixed top-0 inset-x-0 h-[2px] z-50">
      <div className="h-full origin-left bg-gradient-to-r from-emerald-400 to-sky-400" style={{ transform: `scaleX(${p})` }} />
    </div>
  );
}

const DOT_LABELS = { hero: "Home", about: "About", skills: "Skills", projects: "Projects", experience: "Experience", contact: "Contact" };

// Vertical dots on the right edge (desktop) — one per section
export function SectionDots() {
  const active = useActiveSection();
  return (
    <nav aria-label="Section progress" className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-30 flex-col items-end gap-3">
      {SECTION_IDS.map((id) => (
        <a key={id} href={`#${id}`} className="group flex items-center gap-3" aria-label={DOT_LABELS[id]}>
          <span className="text-xs text-stone-500 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition">
            {DOT_LABELS[id]}
          </span>
          <span
            className={`block rounded-full transition-all duration-300 ${
              active === id ? "w-2 h-6 bg-emerald-500" : "w-2 h-2 bg-stone-300 group-hover:bg-stone-500"
            }`}
          />
        </a>
      ))}
    </nav>
  );
}
