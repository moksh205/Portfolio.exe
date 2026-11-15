import { FaShieldAlt } from "react-icons/fa";
import { DiReact, DiNodejsSmall, DiPython, DiHtml5, DiJavascript1 } from "react-icons/di";
import { SiC, SiCplusplus, SiTailwindcss } from "react-icons/si";

export const profile = {
  name: "Moksh Gupta",
  role: "Cybersecurity Enthusiast | Developer",
  github: "https://github.com/moksh205",
  githubUser: "moksh205",
  linkedin: "https://in.linkedin.com/in/moksh-guptaa-9aa579287",
  email: "mokshgupta810@gmail.com",
};

// Shown in the Skills workshop, grouped by `group`
export const skills = [
  { id: "s1", name: "React", icon: DiReact, group: "Frontend", color: "#61dafb" },
  { id: "s2", name: "Node.js", icon: DiNodejsSmall, group: "Backend", color: "#68a063" },
  { id: "s3", name: "Cybersecurity", icon: FaShieldAlt, group: "Security", color: "#ef4444" },
  { id: "s4", name: "Python", icon: DiPython, group: "Languages", color: "#3776ab" },
  { id: "s5", name: "JavaScript", icon: DiJavascript1, group: "Frontend", color: "#e5b800" },
  { id: "s6", name: "HTML", icon: DiHtml5, group: "Frontend", color: "#e34c26" },
  { id: "s7", name: "C", icon: SiC, group: "Languages", color: "#5c6bc0" },
  { id: "s8", name: "C++", icon: SiCplusplus, group: "Languages", color: "#00599c" },
  { id: "s9", name: "Tailwind", icon: SiTailwindcss, group: "Frontend", color: "#38bdf8" },
];

// Shown as a timeline in the Experience office
// TODO: replace with real entries (CTFs, certifications, labs, college projects)
export const experience = [
  { id: "e1", name: "Internship", desc: "Oops… still in progress 😅" },
  { id: "e2", name: "Future Experience", desc: "Coming soon… if the universe allows 🚀" },
  { id: "e3", name: "Pro Tips", desc: "Hire me first, experience follows 😉" },
];
