import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import { MdOutlineWindow, MdOutlineTerminal } from "react-icons/md";

export default function Taskbar({ openTerminal }) {
  return (
    <div className="fixed bottom-0 w-full h-10 bg-neutral-900 border-t border-green-700 flex items-center justify-between px-3 text-green-400 font-mono text-sm">
      {/* Left side */}
      <div className="flex items-center gap-3">
        {/* Start button */}
        <button className="flex items-center gap-1 px-2 py-1 border border-green-400 rounded-sm hover:bg-green-400 hover:text-black transition font-bold tracking-wider">
          <MdOutlineWindow className="text-lg" /> 
        </button>

        {/* Terminal icon */}
        <button
          onClick={openTerminal} // <-- call the function here
          className="px-2 py-1 border border-green-400 rounded-sm hover:bg-green-400 hover:text-black transition"
        >
          <MdOutlineTerminal className="text-lg" />
        </button>
      </div>

      {/* Right side social icons */}
      <div className="flex gap-5 text-lg">
        <a
          href="https://github.com/moksh205"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition"
        >
          <FaGithub />
        </a>
        <a
          href="https://www.linkedin.com/in/moksh-gupta-9aa579287"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition"
        >
          <FaLinkedin />
        </a>
        <a
          href="mailto:mokshgupta810@gmail.com"
          className="hover:text-white transition"
        >
          <FaEnvelope />
        </a>
      </div>
    </div>
  );
}
