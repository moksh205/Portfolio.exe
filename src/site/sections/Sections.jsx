import { useState } from "react";
import { FaGithub, FaLinkedin, FaEnvelope, FaCopy, FaCheck, FaArrowRight } from "react-icons/fa";
import { profile, skills, experience } from "../../data/projectsData";

const SectionLabel = ({ children }) => (
  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-2.5">{children}</p>
);

// ---------------- Skills ----------------
const GROUP_ORDER = ["Frontend", "Backend", "Languages", "Security"];

export function SkillsSection() {
  const groups = GROUP_ORDER.map((g) => [g, skills.filter((s) => s.group === g)]).filter(([, list]) => list.length);
  return (
    <div className="space-y-6">
      {groups.map(([group, list]) => (
        <div key={group}>
          <SectionLabel>{group}</SectionLabel>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {list.map((s) => (
              <div
                key={s.id}
                className="spot group flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-md transition"
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
    <div className="">
      <ol className="relative border-l-2 border-dashed border-emerald-200 ml-3 space-y-5">
        {items.map((e, i) => (
          <li key={e.id} className="pl-6 relative">
            <span className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 grid place-items-center text-[10px] font-bold text-white">
              {i + 1}
            </span>
            <div className="spot p-4 rounded-2xl bg-white border border-stone-200 hover:shadow-md transition">
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
    { label: "Email", value: profile.email, href: `mailto:${profile.email}`, icon: FaEnvelope, color: "#10b981" },
    { label: "LinkedIn", value: "Moksh Gupta", href: profile.linkedin, icon: FaLinkedin, color: "#0a66c2" },
    { label: "GitHub", value: `@${profile.githubUser}`, href: profile.github, icon: FaGithub, color: "var(--color-slate-900)" },
  ];
  return (
    <div className="space-y-3">
      <p className="text-slate-600 text-[15px] mb-4">Got an idea, an internship or just want to say hi? Pick any channel — I reply fast.</p>
      {links.map(({ label, value, href, icon: Icon, color }) => (
        <a
          key={label}
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel="noopener noreferrer"
          className="spot group flex items-center gap-4 p-3.5 rounded-2xl border border-slate-200 bg-white hover:shadow-md hover:-translate-y-0.5 transition"
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
        className="w-full h-12 mt-2 flex items-center justify-center gap-2 rounded-2xl bg-stone-900 text-white font-semibold hover:bg-stone-700 transition"
      >
        {copied ? <FaCheck /> : <FaCopy />} {copied ? "Email copied!" : "Copy email address"}
      </button>
    </div>
  );
}
