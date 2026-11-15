import { useState } from "react";
import { FaGithub, FaLinkedin, FaEnvelope, FaCopy, FaCheck, FaArrowRight } from "react-icons/fa";
import MokshImg from "../../assets/moksh.png";
import { profile, skills, experience } from "../../data/projectsData";

const SectionLabel = ({ children }) => (
  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-2.5">{children}</p>
);

// ---------------- About ----------------
export function AboutSection({ onGo }) {
  return (
    <div className="p-5 sm:p-7 space-y-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
        <img
          src={MokshImg}
          alt={profile.name}
          className="w-28 h-28 rounded-3xl object-cover bg-gradient-to-br from-emerald-100 to-sky-100 ring-4 ring-white shadow-lg shrink-0"
        />
        <div className="space-y-2">
          <h3 className="font-mono text-2xl font-bold text-slate-900">{profile.name}</h3>
          <p className="inline-flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> {profile.role}
          </p>
          {/* TODO: personalise this bio */}
          <p className="text-slate-600 leading-relaxed text-[15px]">
            I build web apps and explore security — breaking things to learn how to protect them.
          </p>
        </div>
      </div>

      <div>
        <SectionLabel>Stack</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <span key={s.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-sm text-slate-700">
              <s.icon style={{ color: s.color }} /> {s.name}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <a href={profile.github} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 h-11 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 transition">
          <FaGithub /> GitHub
        </a>
        <button onClick={() => onGo("projects")}
          className="flex items-center justify-center gap-2 h-11 rounded-xl bg-slate-100 text-slate-800 text-sm font-semibold hover:bg-slate-200 transition">
          See projects <FaArrowRight className="text-xs" />
        </button>
        <button onClick={() => onGo("contact")}
          className="flex items-center justify-center gap-2 h-11 rounded-xl bg-slate-100 text-slate-800 text-sm font-semibold hover:bg-slate-200 transition">
          Contact me <FaArrowRight className="text-xs" />
        </button>
      </div>
    </div>
  );
}

// ---------------- Skills ----------------
const GROUP_ORDER = ["Frontend", "Backend", "Languages", "Security"];

export function SkillsSection() {
  const groups = GROUP_ORDER.map((g) => [g, skills.filter((s) => s.group === g)]).filter(([, list]) => list.length);
  return (
    <div className="p-5 sm:p-7 space-y-6">
      {groups.map(([group, list]) => (
        <div key={group}>
          <SectionLabel>{group}</SectionLabel>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {list.map((s) => (
              <div
                key={s.id}
                className="group flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-md transition"
              >
                <span className="grid place-items-center w-10 h-10 rounded-xl text-xl shrink-0" style={{ background: `${s.color}1f`, color: s.color }}>
                  <s.icon />
                </span>
                <span className="text-sm font-semibold text-slate-800 min-w-0 break-words">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------- Experience ----------------
export function ExperienceSection() {
  const items = experience;
  return (
    <div className="p-5 sm:p-7">
      <ol className="relative border-l-2 border-dashed border-amber-200 ml-3 space-y-5">
        {items.map((e, i) => (
          <li key={e.id} className="pl-6 relative">
            <span className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-amber-400 ring-4 ring-amber-100 grid place-items-center text-[10px] font-bold text-white">
              {i + 1}
            </span>
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
              <h4 className="font-semibold text-slate-900">{e.name}</h4>
              {e.desc && <p className="text-sm text-slate-600 mt-1">{e.desc}</p>}
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-sm text-slate-500 flex items-center gap-2">
        <span className="text-lg">🚧</span> This floor is still under construction — more coming soon.
      </p>
    </div>
  );
}

// ---------------- Contact ----------------
export function ContactSection() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };
  const links = [
    { label: "Email", value: profile.email, href: `mailto:${profile.email}`, icon: FaEnvelope, color: "#ea580c" },
    { label: "LinkedIn", value: "Moksh Gupta", href: profile.linkedin, icon: FaLinkedin, color: "#0a66c2" },
    { label: "GitHub", value: `@${profile.githubUser}`, href: profile.github, icon: FaGithub, color: "#0f172a" },
  ];
  return (
    <div className="p-5 sm:p-7 space-y-3">
      <p className="text-slate-600 text-[15px] mb-4">Got an idea, an internship or just want to say hi? Pick any channel — I reply fast.</p>
      {links.map(({ label, value, href, icon: Icon, color }) => (
        <a
          key={label}
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel="noopener noreferrer"
          className="group flex items-center gap-4 p-3.5 rounded-2xl border border-slate-200 bg-white hover:shadow-md hover:-translate-y-0.5 transition"
        >
          <span className="grid place-items-center w-11 h-11 rounded-xl text-white text-lg shrink-0" style={{ background: color }}>
            <Icon />
          </span>
          <span className="min-w-0">
            <span className="block text-xs text-slate-400">{label}</span>
            <span className="block font-semibold text-slate-800 truncate">{value}</span>
          </span>
          <FaArrowRight className="ml-auto text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition" />
        </a>
      ))}
      <button
        onClick={copy}
        className="w-full h-12 mt-2 flex items-center justify-center gap-2 rounded-2xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
      >
        {copied ? <FaCheck /> : <FaCopy />} {copied ? "Email copied!" : "Copy email address"}
      </button>
    </div>
  );
}
