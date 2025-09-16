import { useState, useEffect } from "react";

export default function IntroTerminal() {
  const lines = [
    "> Hi, I’m Moksh Gupta",
    "> Cybersecurity Enthusiast | Developer",
    "> Skills: React, Tailwind, Node, Security Labs",
    "> Select an icon to explore projects",
  ];

  const [displayedLines, setDisplayedLines] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  useEffect(() => {
    if (currentLineIndex < lines.length) {
      const timeout = setTimeout(() => {
        const newText = displayedLines[currentLineIndex] || "";
        const updatedLine = newText + lines[currentLineIndex][currentCharIndex];

        const updatedLines = [...displayedLines];
        updatedLines[currentLineIndex] = updatedLine;
        setDisplayedLines(updatedLines);

        if (currentCharIndex < lines[currentLineIndex].length - 1) {
          setCurrentCharIndex(currentCharIndex + 1);
        } else {
          setCurrentLineIndex(currentLineIndex + 1);
          setCurrentCharIndex(0);
        }
      }, 50); // typing speed

      return () => clearTimeout(timeout);
    }
  }, [currentCharIndex, currentLineIndex, displayedLines, lines]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-10 px-2">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-black border border-black rounded-md shadow-[0_0_20px_rgba(0,255,0,0.06)]">
        {/* Title bar */}
        <div className="flex items-center justify-between px-2 sm:px-3 py-1 sm:py-2 bg-black rounded-t-md border-b border-neutral-900">
          <span className="font-mono font-semibold text-xs sm:text-sm text-green-300 select-none">
            Intro.app
          </span>
          <div className="flex items-center gap-1 sm:gap-2">
            <button className="w-6 h-6 sm:w-8 sm:h-8 bg-neutral-900 rounded text-green-300 text-[10px] sm:text-xs shadow-inner hover:bg-neutral-800">
              ―
            </button>
            <button className="w-6 h-6 sm:w-8 sm:h-8 bg-neutral-900 rounded text-green-300 text-[10px] sm:text-xs shadow-inner hover:bg-neutral-800">
              ◻
            </button>
            <button className="w-6 h-6 sm:w-8 sm:h-8 bg-neutral-900 rounded text-green-300 text-[10px] sm:text-xs shadow-inner hover:bg-neutral-800">
              ✕
            </button>
          </div>
        </div>

        {/* Inner content with typing effect */}
        <div className="p-3 sm:p-6 bg-black rounded-b-md">
          <div className="space-y-1 sm:space-y-2 font-mono text-green-300 text-xs sm:text-sm">
            {displayedLines.map((line, idx) => (
  <p key={idx}>{line}</p>
))}

{/* Cursor on next line */}
{currentLineIndex <= lines.length && (
  <p className="font-bold text-green-300 animate-fade">|</p>
)}

          </div>
        </div>
      </div>

      {/* CSS for fading cursor */}
      <style jsx>{`
      @keyframes fade {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}
.animate-fade {
  display: inline-block;
  animation: fade 1s infinite;
}
      `}</style>
    </div>
  );
}
