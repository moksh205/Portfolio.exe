import { useState, useEffect } from "react";
import BootScreen from "./components/BootScreen";
import Taskbar from "./components/Taskbar";
import DesktopIcons from "./components/DesktopIcons";
import TerminalWindow from "./components/TerminalWindow";
import IntroTerminal from "./components/IntroTerminal";

export default function App() {
  const [booting, setBooting] = useState(true);
  const [desktop, setDesktop] = useState(false);
  const [openApp, setOpenApp] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setBooting(false);
      setDesktop(true);
    }, 9000); // fake boot time
  }, []);

  const projects = [
    { id: 1, name: "Project One", desc: "Cool app built with React." },
    { id: 2, name: "Project Two", desc: "Cybersecurity tool demo." },
    { id: 3, name: "Project Three", desc: "Data viz dashboard." },
  ];

  return (
    <div className="w-full h-screen bg-black text-hackerGreen">
      {booting && <BootScreen />}

      {desktop && (
        <div className="w-full h-full bg-retroBlack relative">
          <Taskbar />
          <DesktopIcons projects={projects} setOpenApp={setOpenApp} />
          {openApp ? (
            <TerminalWindow openApp={openApp} setOpenApp={setOpenApp} />
          ) : (
            <IntroTerminal />
          )}
        </div>
      )}
    </div>
  );
}
