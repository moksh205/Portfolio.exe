export default function IntroTerminal() {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-10">
      {/* Outer window frame with subtle green glow */}
      <div className="w-[90%] max-w-md sm:max-w-lg md:max-w-xl bg-black border border-black rounded-md shadow-[0_0_20px_rgba(0,255,0,0.06)]">
        {/* Title bar - pure dark/black for hacker theme */}
        <div className="flex items-center justify-between px-3 py-2 bg-black rounded-t-md border-b border-neutral-900">
          <span className="font-mono font-semibold text-sm text-green-300 select-none">
            Intro.app
          </span>

          {/* Window controls - dark buttons with green icons */}
          <div className="flex items-center gap-2">
            <button
              aria-label="Minimize"
              className="w-8 h-8 flex items-center justify-center bg-neutral-900 rounded text-green-300 text-xs shadow-inner hover:bg-neutral-800"
            >
              ―
            </button>
            <button
              aria-label="Maximize"
              className="w-8 h-8 flex items-center justify-center bg-neutral-900 rounded text-green-300 text-xs shadow-inner hover:bg-neutral-800"
            >
              ◻
            </button>
            <button
              aria-label="Close"
              className="w-8 h-8 flex items-center justify-center bg-neutral-900 rounded text-green-300 text-xs shadow-inner hover:bg-neutral-800"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Inner content - black background, neon green terminal text */}
        <div className="p-6 bg-black rounded-b-md">
          <div className="space-y-2">
            <p className="font-mono text-green-300 text-sm">&gt; Hi, I’m Moksh Gupta</p>
            <p className="font-mono text-green-300 text-sm">&gt; Cybersecurity Enthusiast | Developer</p>
            <p className="font-mono text-green-300 text-sm">&gt; Skills: React, Tailwind, Node, Security Labs</p>

            <div className="mt-3">
              <p className="font-mono text-green-300 text-sm">&gt; Select an icon to explore projects</p>

              {/* blinking cursor */}
              <div className="mt-2 flex items-center">
                <span className="font-mono text-green-300 text-sm">_</span>
                <span className="inline-block ml-2 w-1 h-4 bg-green-300 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );A
}
