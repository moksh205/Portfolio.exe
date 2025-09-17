import { useState, useEffect, useRef } from "react";
import MokshImg from "../assets/moksh.png"; // update path if needed

export default function IntroTerminal({ onClose, zIndex }) {
  const lines = [
    "whoami",
    "Hi, I'm Moksh Gupta",
    "Cybersecurity Enthusiast | Developer",
    "Select an icon to explore projects",
    "Press Any Key to Continue...",
  ];

  const [displayedLines, setDisplayedLines] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const windowRef = useRef(null);
  const initialized = useRef(false);

  // Typing effect
  useEffect(() => {
    if (currentLineIndex < lines.length) {
      const timeout = setTimeout(() => {
        const currentLine = displayedLines[currentLineIndex] || "";
        const updatedLine =
          currentLine + lines[currentLineIndex][currentCharIndex];
        const updatedLines = [...displayedLines];
        updatedLines[currentLineIndex] = updatedLine;
        setDisplayedLines(updatedLines);

        if (currentCharIndex < lines[currentLineIndex].length - 1) {
          setCurrentCharIndex(currentCharIndex + 1);
        } else {
          setCurrentLineIndex(currentLineIndex + 1);
          setCurrentCharIndex(0);
        }
      }, 40);
      return () => clearTimeout(timeout);
    }
  }, [currentCharIndex, currentLineIndex, displayedLines, lines]);

// Center the window initially with phone adjustment
useEffect(() => {
  if (!initialized.current) {
    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;
    const rect = windowRef.current?.getBoundingClientRect();
    const width = rect?.width || 600;
    const height = rect?.height || 300;

    const topPosition = winWidth < 640 // mobile breakpoint
      ? (winHeight - height) / 4   // slightly top for phone
      : (winHeight - height) / 2; // center for desktop

    setPosition({
      x: (winWidth - width) / 2,
      y: topPosition,
    });
    initialized.current = true;
  }
}, []);

  // Drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    const rect = windowRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
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

  return (
    <div
      ref={windowRef}
      style={{ top: position.y, left: position.x, zIndex }}
      className="absolute w-[90%] max-w-md sm:max-w-lg md:max-w-xl bg-black border-2 border-green-700 shadow-lg font-mono text-green-300 rounded select-none mx-auto"
    >
      {/* Title bar */}
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
            onClose && onClose();
          }}
          className="w-6 h-6 flex items-center justify-center bg-neutral-800 border border-green-700 text-green-300 hover:bg-neutral-700 rounded"
        >
          ✕
        </button>
      </div>

      {/* Terminal content */}
<div className="p-4 overflow-auto max-h-80 sm:max-h-96 flex gap-3 items-center">
  {/* Text area */}
  <div className="space-y-2 font-mono text-green-300 text-sm sm:text-base leading-relaxed flex-1">
    {displayedLines.map((line, idx) => (
      <p key={idx} className="break-words">
        {line}
      </p>
    ))}
    {/* Blinking cursor */}
    {currentLineIndex <= lines.length && (
      <span className="font-bold animate-blink">|</span>
    )}
  </div>

  {/* Right image */}
  <img
    src={MokshImg}
    alt="Moksh"
    className="w-42 h-42 sm:w-32 sm:h-32 md:w-50 md:h-50 rounded-full flex-shrink-0"
  />
</div>


      {/* Blinking cursor style */}
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
