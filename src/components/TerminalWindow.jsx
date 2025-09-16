export default function TerminalWindow({ openApp, setOpenApp }) {
  if (!openApp) return null;

  return (
    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md sm:max-w-lg md:max-w-xl bg-black border-2 border-green-500 rounded-md shadow-[0_0_10px_#00ff00]">
      
      {/* Title bar */}
      <div className="flex justify-between items-center bg-black border-b-2 border-green-500 px-3 py-1 text-green-400 font-mono select-none">
        <span className="font-bold">{openApp.name}.exe</span>
        <button
          onClick={() => setOpenApp(null)}
          className="text-green-400 hover:text-red-500 font-bold"
        >
          ❌
        </button>
      </div>

      {/* Terminal content */}
      <div className="p-4 text-green-400 font-mono text-sm sm:text-base">
        <p>&gt; Opening <span className="font-bold">{openApp.name}</span>...</p>
        <p className="mt-2">{openApp.desc}</p>
        {openApp.link && (
          <a
            href={openApp.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-4 underline hover:text-green-200"
          >
            Visit Project
          </a>
        )}
      </div>
    </div>
  );
}
