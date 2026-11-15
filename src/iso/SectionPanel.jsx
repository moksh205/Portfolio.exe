import { useEffect, useRef } from "react";
import { FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ProjectsSection from "./sections/ProjectsSection";
import { AboutSection, SkillsSection, ExperienceSection, ContactSection } from "./sections/Sections";
import { PLACES } from "./places";

const SUBTITLES = {
  about: "Who I am",
  skills: "Tools & languages I build with",
  projects: "Live from my GitHub",
  experience: "Where I've been working",
  contact: "Let's build something together",
};

// Header colours are the neon station colours, toned for a light card
const TINTS = {
  about: ["#34d399", "#10b981"],
  skills: ["#38bdf8", "#0ea5e9"],
  projects: ["#e879f9", "#c026d3"],
  experience: ["#fbbf24", "#f59e0b"],
  contact: ["#fb923c", "#ea580c"],
};

export default function SectionPanel({ place, onClose, onNavigate }) {
  const closeRef = useRef(null);
  const bodyRef = useRef(null);
  const idx = PLACES.findIndex((p) => p.id === place.id);
  const prev = PLACES[(idx - 1 + PLACES.length) % PLACES.length];
  const next = PLACES[(idx + 1) % PLACES.length];
  const [c1, c2] = TINTS[place.id];

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
    closeRef.current?.focus({ preventScroll: true });
  }, [place.id]);

  const content = {
    about: <AboutSection onGo={onNavigate} />,
    skills: <SkillsSection />,
    projects: <ProjectsSection />,
    experience: <ExperienceSection />,
    contact: <ContactSection />,
  }[place.id];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 bg-slate-950/40 backdrop-blur-[3px] panel-fade"
      onPointerDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={place.title}
        className="sheet-up w-full sm:max-w-3xl max-h-[90dvh] sm:max-h-[85dvh] flex flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl bg-[#fffdf9] shadow-2xl font-sans select-text"
      >
        {/* header */}
        <div className="relative overflow-hidden shrink-0 px-5 sm:px-7 pt-5 pb-5 text-white" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
          {/* grab handle on phones */}
          <span className="sm:hidden absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1.5 rounded-full bg-white/50" />
          <div aria-hidden className="absolute -right-6 -top-10 w-40 h-40 rounded-full bg-white/10" />
          <div aria-hidden className="absolute right-16 -bottom-14 w-28 h-28 rounded-full bg-white/10" />
          <div className="relative flex items-center gap-4">
            <span className="grid place-items-center w-14 h-14 rounded-2xl bg-white/95 text-2xl shadow-md shrink-0" style={{ color: c2 }}>
              <place.icon />
            </span>
            <div className="min-w-0">
              <h2 className="font-mono text-2xl sm:text-3xl font-bold leading-tight drop-shadow-sm">{place.title}</h2>
              <p className="text-sm text-white/90">{SUBTITLES[place.id]}</p>
            </div>
            <button
              ref={closeRef}
              onClick={onClose}
              aria-label="Close"
              className="ml-auto grid place-items-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/35 focus-visible:ring-2 focus-visible:ring-white transition shrink-0"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* body */}
        <div ref={bodyRef} className="flex-1 min-h-0 overflow-y-auto thin-scrollbar">
          {content}
        </div>

        {/* footer: hop to the neighbouring building */}
        <div className="shrink-0 flex items-center gap-2 px-4 sm:px-6 py-3 border-t border-slate-200/80 bg-white/70">
          <button
            onClick={() => onNavigate(prev.id)}
            className="flex items-center gap-2 h-9 px-3 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition"
          >
            <FaChevronLeft className="text-xs" /> <prev.icon /> <span className="hidden sm:inline">{prev.title}</span>
          </button>
          <span className="hidden sm:block flex-1 text-center text-[11px] text-slate-400">esc to close</span>
          <span className="sm:hidden flex-1" />
          <button
            onClick={() => onNavigate(next.id)}
            className="flex items-center gap-2 h-9 px-3 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition"
          >
            <span className="hidden sm:inline">{next.title}</span> <next.icon /> <FaChevronRight className="text-xs" />
          </button>
        </div>
      </div>
    </div>
  );
}
