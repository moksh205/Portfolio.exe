import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

export default function Taskbar() {
  return (
    <div className="fixed bottom-0 w-full h-12 bg-black border-t flex items-center justify-between px-4 sm:px-8 text-green-400 font-mono text-sm">
      {/* Left side */}
     <div className="flex items-center gap-2">
  {/* Start button */}
  <button className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3  text-green-400 text-base sm:text-lg rounded-md hover:bg-green-400 hover:text-black transition">
    ⊞ 
  </button>
</div>


      {/* Right side social icons */}
      <div className="flex gap-6 text-xl">
        <a
          href="https://github.com/yourusername"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition"
        >
          <FaGithub />
        </a>
        <a
          href="https://linkedin.com/in/yourusername"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition"
        >
          <FaLinkedin />
        </a>
        <a
          href="mailto:youremail@example.com"
          className="hover:text-white transition"
        >
          <FaEnvelope />
        </a>
      </div>
    </div>
  );
}
