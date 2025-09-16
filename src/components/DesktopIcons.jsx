export default function DesktopIcons({ projects, setOpenApp }) {
  return (
    <div className="p-6 grid grid-cols-4 gap-8">
      {projects.map((p) => (
        <div
          key={p.id}
          className="flex flex-col items-center cursor-pointer hover:scale-110 transition"
          onClick={() => setOpenApp(p)}
        >
          <div className="w-16 h-16 bg-gray-700 rounded-md flex items-center justify-center">
            📁
          </div>
          <span className="mt-2 text-sm text-green-400">{p.name}</span>
        </div>
      ))}
    </div>
  );
}
