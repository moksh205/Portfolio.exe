export default function IntroTerminal() {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-10">
      <div className="w-[90%] max-w-md sm:max-w-lg md:max-w-xl bg-black border-2 border-green-500 rounded-md shadow-[0_0_15px_#00ff00] font-mono text-green-400 text-sm sm:text-base">
        
        {/* Title bar */}
        <div className="flex justify-between items-center bg-black border-b-2 border-green-500 px-3 py-1 select-none">
          <span className="font-bold">Intro.exe</span>
          <button className="text-green-400 font-bold hover:text-red-500">❌</button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-2">
          <p>&gt; Hi, I’m Moksh Gupta</p>
          <p>&gt; Cybersecurity Enthusiast | Developer</p>
          <p>&gt; Skills: React, Tailwind, Node, Security Labs</p>
          <p className="mt-2">&gt; Select an icon to explore projects</p>
        </div>
      </div>
    </div>
  );
}
