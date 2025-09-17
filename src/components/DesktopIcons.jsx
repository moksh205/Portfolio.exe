export default function DesktopIcons({ projects, setOpenApp }) {
  return (
    <div className="absolute top-0 left-0 bottom-12 w-full sm:w-auto h-28 sm:h-auto flex flex-row sm:flex-col items-center sm:justify-start gap-4 sm:gap-8 px-2 py-2 sm:py-6 z-50 pointer-events-auto overflow-auto">
      {projects.map((p) => (
        <div
          key={p.id}
          className="flex flex-col items-center cursor-pointer group"
          onClick={() => setOpenApp(p)}
        >
          <div className="text-green-400 text-3xl group-hover:text-white transition drop-shadow-[0_0_6px_#00ff00]">
            <p.icon />
          </div>
          <span className="mt-1 text-xs text-green-400 group-hover:text-white text-center leading-tight">
            {p.name}
          </span>
        </div>
      ))}
    </div>
  );
}
