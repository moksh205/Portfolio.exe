import { useState, useEffect } from "react";
import BootScreen from "./components/BootScreen";
import Taskbar from "./components/Taskbar";
import TerminalWindow from "./components/TerminalWindow";
import IntroTerminal from "./components/IntroTerminal";
import { FaFolder, FaLaptopCode, FaChartBar } from "react-icons/fa";

export default function App() {
  const [booting, setBooting] = useState(true);
  const [desktop, setDesktop] = useState(false);
  const [openApp, setOpenApp] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBooting(false);
      setDesktop(true);
    }, 9000); // fake boot time

    return () => clearTimeout(timer);
  }, []);

const projects = [
  { id: 1, name: "Project One", desc: "Cool app built with React.", link: "https://projectone.com", icon: FaFolder },
  { id: 2, name: "Project Two", desc: "Cybersecurity tool demo.", link: "https://projecttwo.com", icon: FaLaptopCode },
  { id: 3, name: "Project Three", desc: "Data viz dashboard.", link: "https://projectthree.com", icon: FaChartBar },
];


  return (
    <div className="w-full h-screen bg-black text-green-400 relative overflow-hidden">
      {booting && <BootScreen />}

      {desktop && (
        <div className="w-full h-full bg-black relative pb-12"> {/* padding for taskbar */}
          {/* Taskbar at the bottom */}
          <Taskbar />

          {/* Desktop icons */}
          <div className="absolute top-0 bottom-12 left-0 w-28 bg-black flex flex-col items-center py-6 gap-8">
            {projects.map((p) => {
  const Icon = p.icon;
  return (
    <div
      key={p.id}
      className="flex flex-col items-center cursor-pointer"
      onClick={() => setOpenApp(p)}
    >
      <div className="w-12 h-12 bg-black rounded flex items-center justify-center">
        <Icon className="text-green-400 text-2xl" />
      </div>
      <span className="mt-2 text-xs text-green-400 text-center px-2">
        {p.name}
      </span>
    </div>
  );
})}

          </div>

          {/* Terminal window if an app is open */}
          {openApp && (
            <TerminalWindow openApp={openApp} setOpenApp={setOpenApp} />
          )}

          {/* Intro terminal shows only when no app is open */}
          {!openApp && <IntroTerminal />}
        </div>
      )}
    </div>
  );
}
