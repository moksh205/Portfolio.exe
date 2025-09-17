import { useState, useRef, useEffect } from "react";

export default function TerminalWindow({ onClose, zIndex, openFolder }) {
  const [lines, setLines] = useState(["Type 'help' to see available commands."]);
  const [input, setInput] = useState("");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // for transition
  const dragOffset = useRef({ x: 0, y: 0 });
  const windowRef = useRef(null);
  const initialized = useRef(false);

  const folders = ["projects", "skills", "experience"];

  // Center terminal on load
  useEffect(() => {
    if (!initialized.current) {
      const winWidth = window.innerWidth;
      const winHeight = window.innerHeight;
      const rect = windowRef.current?.getBoundingClientRect();
      const width = rect?.width || 600;
      const height = rect?.height || 400;

      setPosition({
        x: (winWidth - width) / 2,
        y: (winHeight - height) / 2,
      });
      initialized.current = true;

      // Fade-in after mounting
      setTimeout(() => setIsVisible(true), 10);
    }
  }, []);

  // Drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    const rect = windowRef.current.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    e.preventDefault();
  };
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y,
    });
  };
  const handleMouseUp = () => setIsDragging(false);
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Commands
  const handleCommand = (cmd) => {
    const cleanCmd = cmd.trim().toLowerCase();
    setLines((prev) => [...prev, `$ ${cmd}`]);

    switch (cleanCmd) {
      case "help":
        setLines((prev) => [
          ...prev,
          "Available commands: whoami, help, clear, ls, open [folder]",
        ]);
        break;
      case "whoami":
        setLines((prev) => [...prev, "Moksh Gupta"]);
        break;
      case "clear":
        setLines([]);
        break;
      case "ls":
        setLines((prev) => [...prev, folders.join("  ")]);
        break;
      default:
        if (cleanCmd.startsWith("open ")) {
          const folderName = cleanCmd.replace("open ", "").trim();
          if (folders.includes(folderName)) {
            setLines((prev) => [...prev, `Accessing folder: ${folderName}...`]);
            openFolder && openFolder(folderName);
          } else {
            setLines((prev) => [
              ...prev,
              `Folder not found or access denied: ${folderName}`,
            ]);
          }
        } else {
          setLines((prev) => [...prev, `Command not found: ${cmd}`]);
        }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleCommand(input);
      setInput("");
    }
  };

  // Close with transition
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose && onClose(), 300); // match transition duration
  };

  return (
    <div
      ref={windowRef}
      style={{ top: position.y, left: position.x, zIndex }}
      className={`absolute w-[90%] max-w-md sm:max-w-lg md:max-w-xl bg-black border-2 border-green-700 shadow-lg font-mono text-green-300 rounded select-none transform transition-all duration-300 ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
    >
      {/* Title Bar */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between px-4 py-2 bg-neutral-900 border-b border-green-700 rounded-t-lg cursor-pointer select-none"
      >
        <span className="font-mono font-semibold text-sm text-green-300">
          terminal.exe
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          className="w-6 h-6 flex items-center justify-center bg-neutral-800 border border-green-700 text-green-300 hover:bg-neutral-700 rounded"
        >
          ✕
        </button>
      </div>

      {/* Terminal Content */}
      <div className="p-4 h-64 overflow-auto flex flex-col">
        <div className="flex-1 space-y-1">
          {lines.map((line, idx) => (
            <p key={idx} className="break-words">
              {line}
            </p>
          ))}
          <span className="animate-blink font-bold">$</span>
        </div>
        <div className="flex mt-1">
          <span className="mr-2">$</span>
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-black focus:outline-none flex-1 text-green-300"
          />
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
      `}</style>
    </div>
  );
}
