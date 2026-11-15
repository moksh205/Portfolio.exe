import { useEffect, useState } from "react";

const LOGO = String.raw`
 __  __  ___  _  __ ___ _  _    ___  ___
|  \/  |/ _ \| |/ // __| || |  / _ \/ __|
| |\/| | (_) | ' < \__ \ __ | | (_) \__ \
|_|  |_|\___/|_|\_\|___/_||_|  \___/|___/
`;

const LINES = [
  ["OK", "Booting Moksh OS v2.0"],
  ["OK", "Checking system integrity"],
  ["OK", "Mounting /home/moksh/projects"],
  ["OK", "Starting firewall & intrusion detection"],
  ["OK", "Loading portfolio"],
  ["OK", "Spawning mini Moksh in Moksh City"],
];

const STEP_MS = 450;

export default function BootScreen({ onDone }) {
  const [shown, setShown] = useState(0);
  const [progress, setProgress] = useState(0);

  // Reveal one line at a time, then hand over to the desktop
  useEffect(() => {
    if (shown >= LINES.length) {
      const t = setTimeout(onDone, 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setShown((s) => s + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [shown, onDone]);

  // Smooth progress bar
  useEffect(() => {
    const target = (shown / LINES.length) * 100;
    const id = setInterval(() => {
      setProgress((p) => (p < target ? Math.min(target, p + 2) : p));
    }, 16);
    return () => clearInterval(id);
  }, [shown]);

  // Any key / click / tap skips the boot
  useEffect(() => {
    const skip = () => onDone();
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [onDone]);

  return (
    <div className="flex items-center justify-center h-screen w-full bg-black px-4">
      <div className="w-full max-w-2xl font-mono text-green-400">
        <pre className="glow text-[7px] min-[400px]:text-[9px] sm:text-sm leading-tight text-green-400 mb-6">
          {LOGO}
        </pre>

        <div className="space-y-1 text-xs sm:text-sm min-h-[9rem]">
          {LINES.slice(0, shown).map(([status, text]) => (
            <p key={text}>
              <span className="text-white/60">[</span>
              <span className="text-green-300 glow"> {status} </span>
              <span className="text-white/60">]</span> {text}
            </p>
          ))}
          {shown < LINES.length && <span className="inline-block w-2 h-4 bg-green-400 animate-blink" />}
        </div>

        <div className="mt-6 h-3 w-full border border-green-600/70 rounded-sm p-[2px]">
          <div
            className="h-full bg-green-400 shadow-[0_0_10px_#22c55e] transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] sm:text-xs text-green-500/80">
          <span>{Math.round(progress)}%</span>
          <span className="animate-pulse">press any key to skip</span>
        </div>
      </div>
    </div>
  );
}
