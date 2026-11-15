import { useEffect, useState } from "react";
import {
  FaGithub, FaLinkedin, FaEnvelope, FaArrowRight, FaArrowUp, FaBars, FaTimes, FaCode, FaShieldAlt, FaTerminal,
} from "react-icons/fa";
import { profile } from "../data/projectsData";
import ProjectsSection from "./sections/ProjectsSection";
import { SkillsSection, ExperienceSection, ContactSection } from "./sections/Sections";
import { Reveal, Typewriter, SkillMarquee, ScrollProgress, SectionDots } from "./ui";
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

const ROLES = profile.role.split("|").map((s) => s.trim());
const [FIRST, ...REST] = profile.name.split(" ");

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

// A full-screen section. `side` is where the 3D object sits; the text goes on the other side.
// On phones the 3D object sits at the top, so the text starts lower.
function Section({ id, side, eyebrow, title, intro, children }) {
  const textRight = side === "left";
  return (
    <section id={id} className="relative z-10 min-h-screen flex items-center scroll-mt-16">
      <div className="w-full max-w-6xl mx-auto px-5 sm:px-8 pt-[44vh] md:pt-24 pb-24 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className={`min-w-0 ${textRight ? "md:col-start-2" : ""}`}>
          <div className="rounded-3xl md:rounded-none bg-white/80 md:bg-transparent backdrop-blur-md md:backdrop-blur-none p-5 md:p-0 -mx-1 md:mx-0 shadow-sm md:shadow-none">
            {eyebrow && (
              <Reveal>
                <p className="inline-flex items-center gap-2 font-mono text-xs text-emerald-600 mb-4">
                  <span className="w-6 h-px bg-emerald-500" /> {eyebrow}
                </p>
              </Reveal>
            )}
            {title && (
              <Reveal delay={80}>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-stone-900 leading-[1.1]">{title}</h2>
              </Reveal>
            )}
            {intro && (
              <Reveal delay={160}>
                <p className="mt-4 text-stone-500 text-base sm:text-lg leading-relaxed max-w-xl">{intro}</p>
              </Reveal>
            )}
            {children && (
              <Reveal delay={240} className="mt-8">
                {children}
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Hero() {
  return (
    <section id="hero" className="relative z-10 min-h-screen flex flex-col">
      <div className="flex-1 flex items-center">
        <div className="w-full max-w-6xl mx-auto px-5 sm:px-8 pt-[50vh] md:pt-16 pb-10 grid grid-cols-1 md:grid-cols-2">
          <div className="min-w-0 rounded-3xl md:rounded-none bg-white/80 md:bg-transparent backdrop-blur-md md:backdrop-blur-none p-5 md:p-0 shadow-sm md:shadow-none">
            <Reveal>
              <p className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-white border border-stone-200 text-sm text-stone-600 mb-6 shadow-sm">
                <span className="grid place-items-center w-5 h-5 rounded-full bg-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </span>
                Hello there 👋
              </p>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-stone-900 leading-[1.02]">
                I'm {FIRST}
                <br />
                <span className="text-gradient">{REST.join(" ") || FIRST}</span>
                <span className="text-emerald-500">.</span>
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-6 text-xl sm:text-2xl text-stone-500 leading-snug min-h-[2em]">
                <Typewriter words={ROLES} className="text-stone-800 font-medium" />
              </p>
            </Reveal>
            <Reveal delay={280}>
              {/* TODO: personalise */}
              <p className="mt-3 text-stone-500 max-w-md leading-relaxed">
                I build web apps and explore security — breaking things to learn how to protect them.
              </p>
            </Reveal>
            <Reveal delay={360}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a href="#projects" className="group inline-flex items-center gap-2 h-12 px-6 rounded-full bg-stone-900 text-white font-medium hover:bg-stone-700 shadow-[0_10px_30px_-10px_rgba(28,25,23,0.6)] transition">
                  View projects <FaArrowRight className="text-sm group-hover:translate-x-0.5 transition" />
                </a>
                <a href="#contact" className="inline-flex items-center h-12 px-6 rounded-full bg-white border border-stone-300 text-stone-800 font-medium hover:border-stone-900 transition">
                  Get in touch
                </a>
                <span className="flex items-center gap-1 ml-1">
                  {SOCIALS.map(({ href, label, Icon }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}
                      className="grid place-items-center w-10 h-10 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-900/5 transition">
                      <Icon />
                    </a>
                  ))}
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
      <div className="relative border-y border-stone-200/70 bg-white/50 backdrop-blur-sm">
        <SkillMarquee />
      </div>
    </section>
  );
}

const WHAT_I_DO = [
  { icon: FaShieldAlt, title: "Security", text: "Cybersecurity is my main focus." },
  { icon: FaCode, title: "Web development", text: "React, Node.js and Tailwind." },
  { icon: FaTerminal, title: "Programming", text: "Python, C and C++." },
];

function Footer() {
  return (
    <footer className="relative z-10 border-t border-stone-200 bg-white/70 backdrop-blur">
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
        <Hero />

        <Section
          id="about"
          side="left"
          eyebrow="01 — About"
          title="Breaking things to learn how to protect them."
          // TODO: personalise this intro
          intro="I'm a developer with a soft spot for security. I like understanding how systems work — and how they fail."
        >
          <div className="grid sm:grid-cols-3 gap-3">
            {WHAT_I_DO.map(({ icon: Icon, title, text }) => (
              <div key={title} className="spot p-4 rounded-2xl bg-white border border-stone-200 hover:-translate-y-1 hover:shadow-lg transition">
                <span className="grid place-items-center w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 mb-3">
                  <Icon />
                </span>
                <p className="font-medium text-stone-900 text-sm">{title}</p>
                <p className="text-stone-500 text-sm mt-1">{text}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="skills" side="right" eyebrow="02 — Skills" title="My toolkit." intro="The languages and tools I build with.">
          <SkillsSection />
        </Section>

        <Section id="projects" side="left" eyebrow="03 — Projects" title="Things I've built." intro="Pulled live from my GitHub — newest first.">
          <ProjectsSection />
        </Section>

        <Section id="experience" side="right" eyebrow="04 — Experience" title="The journey so far.">
          <ExperienceSection />
        </Section>

        <Section id="contact" side="left" eyebrow="05 — Contact" title={<>Let's build something <span className="text-gradient">together.</span></>}>
          <ContactSection />
        </Section>
      </main>
      <Footer />
    </div>
  );
}
