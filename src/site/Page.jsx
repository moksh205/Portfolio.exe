import { useEffect, useState } from "react";
import { FaGithub, FaLinkedin, FaEnvelope, FaArrowUp, FaBars, FaTimes } from "react-icons/fa";
import { profile } from "../data/projectsData";
import Journey from "./Journey";
import { ScrollProgress, SectionDots } from "./ui";
import { useActiveSection, useSpotlight } from "./hooks";

const NAV = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

const SOCIALS = [
  { href: profile.github, label: "GitHub", Icon: FaGithub },
  { href: profile.linkedin, label: "LinkedIn", Icon: FaLinkedin },
  { href: `mailto:${profile.email}`, label: "Email", Icon: FaEnvelope },
];

const FIRST = profile.name.split(" ")[0];

function Nav() {
  const active = useActiveSection();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-colors duration-300 ${
        scrolled || open ? "bg-white/75 backdrop-blur-xl border-b border-stone-200/70" : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto h-16 px-5 sm:px-8 flex items-center justify-between">
        <a href="#hero" className="group flex items-center gap-2.5 font-semibold text-stone-900 tracking-tight">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-stone-900 text-white text-sm font-bold group-hover:bg-emerald-500 transition">
            {FIRST[0]}
          </span>
          {profile.name}
        </a>
        <ul className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/60 border border-stone-200/70 backdrop-blur">
          {NAV.map((n) => (
            <li key={n.id}>
              <a
                href={`#${n.id}`}
                className={`block px-3.5 py-1.5 rounded-full text-sm transition ${
                  active === n.id ? "text-white bg-stone-900" : "text-stone-500 hover:text-stone-900"
                }`}
              >
                {n.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="#contact"
          className="hidden md:inline-flex items-center gap-2 h-9 px-4 rounded-full bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 shadow-[0_6px_20px_-6px_rgba(16,185,129,0.7)] transition"
        >
          Get in touch
        </a>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="md:hidden grid place-items-center w-10 h-10 rounded-full text-stone-700 hover:bg-stone-900/5"
        >
          {open ? <FaTimes /> : <FaBars />}
        </button>
      </nav>
      {open && (
        <ul className="md:hidden px-5 pb-4 space-y-1">
          {NAV.map((n) => (
            <li key={n.id}>
              <a
                href={`#${n.id}`}
                onClick={() => setOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base ${active === n.id ? "bg-stone-900 text-white" : "text-stone-600"}`}
              >
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="relative z-20 border-t border-stone-200 bg-white/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="text-center sm:text-left">
          <p className="font-semibold text-stone-900">{profile.name}</p>
          <p className="text-sm text-stone-500 mt-1">© {new Date().getFullYear()} · Built with React & Three.js</p>
        </div>
        <div className="flex items-center gap-2">
          {SOCIALS.map(({ href, label, Icon }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
              className="grid place-items-center w-10 h-10 rounded-full border border-stone-200 text-stone-500 hover:text-stone-900 hover:border-stone-400 transition">
              <Icon />
            </a>
          ))}
          <a href="#hero" className="ml-2 inline-flex items-center gap-2 h-10 px-4 rounded-full bg-stone-900 text-white text-sm hover:bg-stone-700 transition">
            Back to top <FaArrowUp className="text-xs" />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function Page() {
  useSpotlight();
  return (
    <div className="relative">
      <ScrollProgress />
      <Nav />
      <SectionDots />
      <main>
        <Journey />
      </main>
      <Footer />
    </div>
  );
}
