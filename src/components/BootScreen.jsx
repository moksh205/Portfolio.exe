import { useEffect, useState } from "react";

export default function BootScreen() {
  const lines = [
    "> Booting Moksh OS v1.0 ...",
    "> Checking system integrity ...",
    "> Starting portfolio environment ...",
    "> Loading moksh_portfolio.exe ...",
    "> Launching desktop ...",
  ];

  const [currentLine, setCurrentLine] = useState(0);
  const [text, setText] = useState("");
  const [displayedLines, setDisplayedLines] = useState([]);

  useEffect(() => {
    if (currentLine < lines.length) {
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < lines[currentLine].length) {
          setText((prev) => prev + lines[currentLine][i]);
          i++;
        } else {
          clearInterval(typingInterval);
          setDisplayedLines((prev) => [...prev, lines[currentLine]]);
          setText("");
          setCurrentLine((prev) => prev + 1);
        }
      }, 50); // typing speed
      return () => clearInterval(typingInterval);
    }
  }, [currentLine]);

  return (
    <div className="flex items-center justify-center h-screen w-full bg-black">
      <div className="flex flex-col items-start max-w-full px-4 sm:px-8 md:px-16 lg:px-32 text-green-400 font-mono text-base sm:text-lg md:text-xl lg:text-2xl">
        
        {displayedLines.map((line, idx) => (
          <p key={idx} className="break-words">{line}</p>
        ))}

        {/* typing line */}
        {text && (
          <p>
            {text}
            <span className="inline-block w-2 h-5 bg-green-400 animate-pulse ml-1"></span>
          </p>
        )}

        {/* blinking cursor when finished */}
        {currentLine >= lines.length && (
          <span className="mt-2 inline-block w-2 h-5 bg-green-400 animate-ping"></span>
        )}
      </div>
    </div>
  );
}
