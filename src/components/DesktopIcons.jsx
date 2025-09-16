export default function DesktopIcons({ projects, setOpenApp }) {
  return (
    <div className="fixed top-0 left-0 h-full w-28 bg-black border-r border-green-500 flex flex-col items-center py-6 gap-8">
      {projects.map((p) => (
        <div
          key={p.id}
          className="flex flex-col items-center cursor-pointer group"
          onClick={() => setOpenApp(p)}
        >
          {/* Icon */}
          <div className="w-12 h-12 bg-gray-900 border border-green-500 rounded flex items-center justify-center text-green-400 text-xl group-hover:bg-green-500 group-hover:text-black transition">
            {p.icon || "📁"}
          </div>

          {/* Label */}
          <span className="mt-2 text-xs text-green-400 group-hover:text-white text-center px-2">
            {p.name}
          </span>
        </div>
      ))}
    </div>
  );
}
