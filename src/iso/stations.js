import { FaUserSecret, FaLaptopCode, FaServer, FaBriefcase, FaEnvelope } from "react-icons/fa";

// The sections of the island, in tour order.
// `tip` is what mini-Moksh says when you stand at the door,
// `tour` is what he says during the guided tour.
export const STATIONS = [
  {
    id: "about",
    title: "About Me",
    color: "#39ff88",
    icon: FaUserSecret,
    tip: "This is my place! Press E to learn who I am.",
    tour: "First stop: my home. Here's a bit about who I am.",
  },
  {
    id: "skills",
    title: "Skills",
    color: "#2ee6ff",
    icon: FaLaptopCode,
    tip: "My tool shop — everything I build with.",
    tour: "This shop holds my stack: React, Node, Python, C++ and more.",
  },
  {
    id: "projects",
    title: "Projects",
    color: "#ff3df0",
    icon: FaServer,
    tip: "My data center. All my GitHub projects live here!",
    tour: "My data center — every project I've pushed to GitHub, live.",
  },
  {
    id: "experience",
    title: "Experience",
    color: "#ffd23d",
    icon: FaBriefcase,
    tip: "The office. Still building this floor up!",
    tour: "The office — where my experience goes. Floors still being built!",
  },
  {
    id: "contact",
    title: "Contact",
    color: "#ff6b3d",
    icon: FaEnvelope,
    tip: "Want to talk? Call me from this booth!",
    tour: "Last stop: the phone booth. Reach out — I reply fast!",
  },
];
