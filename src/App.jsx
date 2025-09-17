import { useState, useEffect } from "react";
import BootScreen from "./components/BootScreen";
import Taskbar from "./components/Taskbar";
import IntroTerminal from "./components/IntroTerminal";
import DesktopIcons from "./components/DesktopIcons";
import FolderWindow from "./components/FolderWindow";
import TerminalWindow from "./components/TerminalWindow";
import { projects } from "./data/projectsData";

export default function App() {
  const [booting, setBooting] = useState(true);
  const [desktop, setDesktop] = useState(false);
  const [openFolders, setOpenFolders] = useState([]);
  const [terminalOpen, setTerminalOpen] = useState(false); // single terminal
  const [zCounter, setZCounter] = useState(30);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBooting(false);
      setDesktop(true);
    }, 9000);
    return () => clearTimeout(timer);
  }, []);

  const bringToFront = (instanceId, type = "folder") => {
    setZCounter((prev) => {
      const newZ = prev + 1;
      if (type === "folder") {
        setOpenFolders((prevFolders) =>
          prevFolders.map((f) =>
            f.instanceId === instanceId ? { ...f, zIndex: newZ } : f
          )
        );
      }
      return newZ;
    });
  };

  const openFolder = (folder) => {
    const existing = openFolders.find((f) => f.id === folder.id);
    if (existing) {
      bringToFront(existing.instanceId, "folder");
      return;
    }
    const instanceId = Date.now();
    setOpenFolders((prev) => [
      ...prev,
      { ...folder, instanceId, zIndex: zCounter + 1 },
    ]);
    setZCounter((prev) => prev + 1);
  };

  const closeFolder = (instanceId) => {
    setOpenFolders((prev) => prev.filter((f) => f.instanceId !== instanceId));
  };

  // Only one terminal
  const openTerminal = () => {
    if (!terminalOpen) setTerminalOpen(true);
  };
  const closeTerminal = () => setTerminalOpen(false);

  // Open folder by terminal command
  const openFolderByName = (name) => {
    const folder = projects.find(
      (f) => f.name.toLowerCase() === name.toLowerCase()
    );
    if (folder) openFolder(folder);
    return !!folder;
  };

  return (
    <div className="w-full h-screen bg-black text-green-400 relative overflow-hidden">
      {booting && <BootScreen />}

      {desktop && (
        <div className="w-full h-full bg-black relative pb-12">
          <Taskbar openTerminal={openTerminal} />
          <DesktopIcons projects={projects} setOpenApp={openFolder} />

          {/* Folder Windows */}
          {openFolders.map((folder) => (
            <FolderWindow
              key={folder.instanceId}
              folder={folder}
              zIndex={folder.zIndex}
              onClose={() => closeFolder(folder.instanceId)}
              bringToFront={() => bringToFront(folder.instanceId, "folder")}
            />
          ))}

          {/* Terminal Window (single) */}
          {terminalOpen && (
            <TerminalWindow
              zIndex={zCounter + 1}
              onClose={closeTerminal}
              openFolder={openFolderByName}
            />
          )}

          {/* Show intro terminal only if no folders and terminal is closed */}
          {openFolders.length === 0 && !terminalOpen && <IntroTerminal />}
        </div>
      )}
    </div>
  );
}
