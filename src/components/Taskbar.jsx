export default function Taskbar() {
  return (
    <div className="absolute bottom-0 w-full h-10 bg-gray-900 flex items-center justify-between text-sm px-4 text-green-400">
      <span>🟢 Moksh OS</span>
      <div className="flex gap-4">
        <a href="https://github.com/yourusername" target="_blank" className="hover:text-white">GitHub</a>
        <a href="https://linkedin.com/in/yourusername" target="_blank" className="hover:text-white">LinkedIn</a>
        <a href="mailto:youremail@example.com" className="hover:text-white">Email</a>
      </div>
    </div>
  );
}
