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
  const [openTerminals, setOpenTerminals] = useState([]);
  const [zCounter, setZCounter] = useState(30);

  // Boot screen timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setBooting(false);
      setDesktop(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Bring folder or terminal to front
  const bringToFront = (instanceId, type = "folder") => {
    if (type === "folder") {
      setZCounter((prev) => {
        const newZ = prev + 1;
        setOpenFolders((prevFolders) =>
          prevFolders.map((f) =>
            f.instanceId === instanceId ? { ...f, zIndex: newZ } : f
          )
        );
        return newZ;
      });
    } else if (type === "terminal") {
      setZCounter((prev) => {
        const newZ = prev + 1;
        setOpenTerminals((prevTerms) =>
          prevTerms.map((t) =>
            t.instanceId === instanceId ? { ...t, zIndex: newZ } : t
          )
        );
        return newZ;
      });
    }
  };

  // Open folder
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

  // Close folder
  const closeFolder = (instanceId) => {
    setOpenFolders((prev) => prev.filter((f) => f.instanceId !== instanceId));
  };

  // Open terminal
  const openTerminal = () => {
    const instanceId = Date.now();
    setOpenTerminals((prev) => [
      ...prev,
      { instanceId, zIndex: zCounter + 1 },
    ]);
    setZCounter((prev) => prev + 1);
  };

  // Close terminal
  const closeTerminal = (instanceId) => {
    setOpenTerminals((prev) => prev.filter((t) => t.instanceId !== instanceId));
  };

  // Open folder from terminal command
  const openFolderByName = (name) => {
    const folder = projects.find(
      (f) => f.name.toLowerCase() === name.toLowerCase()
    );
    if (folder) openFolder(folder);
    return folder ? true : false;
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

          {/* Terminal Windows */}
          {openTerminals.map((term) => (
            <TerminalWindow
              key={term.instanceId}
              zIndex={term.zIndex}
              onClose={() => closeTerminal(term.instanceId)}
              bringToFront={() => bringToFront(term.instanceId, "terminal")}
              openFolder={openFolderByName} // Pass folder opener
            />
          ))}

          {/* Show intro terminal only if no folders or terminals */}
          {openFolders.length === 0 && openTerminals.length === 0 && (
            <IntroTerminal />
          )}
        </div>
      )}
    </div>
  );
}
