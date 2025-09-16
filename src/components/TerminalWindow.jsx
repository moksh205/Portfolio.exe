export default function TerminalWindow({ openApp, setOpenApp }) {
  return (
    <div className="absolute top-20 left-20 w-[500px] bg-black border border-green-500 rounded-lg shadow-lg">
      <div className="flex justify-between items-center bg-gray-800 px-2 py-1 text-green-400">
        <span>{openApp.name}.exe</span>
        <button onClick={() => setOpenApp(null)}>❌</button>
      </div>
      <div className="p-4 text-green-400 font-mono">
        <p>&gt; Opening {openApp.name}...</p>
        <p className="mt-2">{openApp.desc}</p>
        <a
          href="#"
          className="block mt-4 underline hover:text-green-200"
        >
          Visit Project
        </a>
      </div>
    </div>
  );
}
