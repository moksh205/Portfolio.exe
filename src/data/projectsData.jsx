import { FaFolder, FaLaptopCode, FaChartBar, FaFileAlt, FaShieldAlt } from "react-icons/fa";
import { DiReact, DiNodejsSmall, DiPython, DiHtml5, DiJavascript1 } from "react-icons/di";
import { SiC, SiCplusplus, SiTailwindcss  } from "react-icons/si";
// import { FaShieldAlt } from "react-icons/fa";

export const projects = [
  {
    id: 1,
    name: "Projects",
    icon: FaFolder,
    children: [
      { id: "p1", name: "Portfolio Website", icon: FaFileAlt, desc: "Built with React & Tailwind" },
      { id: "p2", name: "Cybersecurity Lab", icon: FaFileAlt, desc: "Burp Suite & Security Tools" },
    ],
  },
  {
    id: 2,
    name: "Skills",
    icon: FaLaptopCode,
    children: [
      { id: "s1", name: "React", icon: DiReact },
      { id: "s2", name: "Node.js", icon: DiNodejsSmall },
      { id: "s3", name: "Cybersecurity", icon: FaShieldAlt },
      { id: "s4", name: "Python", icon: DiPython },
      { id: "s5", name: "JavaScript", icon: DiJavascript1 },
      { id: "s6", name: "HTML", icon: DiHtml5 },
      { id: "s7", name: "C", icon: SiC },
      { id: "s8", name: "C++", icon: SiCplusplus },
      { id: "s9", name: "Tailwind", icon: SiTailwindcss },
    ],
  },
{
  id: 3,
  name: "Experience",
  icon: FaChartBar,
  children: [
    {
      id: "e1",
      name: "Internship",
      icon: FaFileAlt,
      desc: "Oops… still in progress 😅"
    },
    {
      id: "e2",
      name: "Future Experience",
      icon: FaFileAlt,
      desc: "Coming soon… if the universe allows 🚀"
    },
    {
      id: "e3",
      name: "Pro Tips",
      icon: FaFileAlt,
      desc: "Hire me first, experience follows 😉"
    }
  ],
}
];
