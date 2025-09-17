import React, { useState, useEffect, useRef } from "react";
import GitHubProjects from './GitHubProjects';

export default function FolderWindow({ folder, onClose, zIndex }) {
  const [selected, setSelected] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const windowRef = useRef(null);
  const initialized = useRef(false);

  // Initialize selected and center window
  useEffect(() => {
    if (!folder) return;

    setSelected(folder?.children?.[0] ?? null);

    if (!initialized.current) {
      const winWidth = window.innerWidth;
      const winHeight = window.innerHeight;
      const rect = windowRef.current?.getBoundingClientRect();
      const width = rect?.width || 600;
      const height = rect?.height || 400;

      setPosition({
        x: (winWidth - width) / 2,
        y: (winHeight - height) / 2,
      });
      initialized.current = true;
    }
  }, [folder]);

  // Drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    const rect = windowRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  if (!folder) return null;

  return (
    <div
      ref={windowRef}
      onMouseDown={handleMouseDown} 
      style={{ top: position.y, left: position.x, zIndex }}
      className="absolute w-[90%] max-w-md sm:max-w-lg md:max-w-xl bg-neutral-900 border-2 border-green-700 shadow-lg font-mono text-green-300 rounded cursor-pointer select-none"
    >
      {/* Title bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-neutral-800 border-b border-green-700 rounded-t">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-lg sm:text-xl">
            <folder.icon />
          </div>
          <span className="font-semibold text-sm sm:text-base">{folder.name}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="w-6 h-6 flex items-center justify-center bg-neutral-800 border border-green-700 text-green-300 hover:bg-neutral-700 rounded"
        >
          ✕
        </button>
      </div>

      {/* Folder Content */}
      {folder.name === "Projects" ? (
        <div className="p-3 max-h-64 overflow-auto">
          <GitHubProjects />
        </div>
      ) : (
        <div className="p-3 grid grid-cols-2 sm:grid-cols-2 gap-3 max-h-64 overflow-auto">
          {folder.children?.map((child) => (
            <div
              key={child.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelected(child);
              }}
              className={`flex flex-col items-center p-2 cursor-pointer rounded ${
                selected?.id === child.id ? "bg-black/50" : "bg-transparent"
              }`}
            >
              <div className="text-2xl sm:text-3xl">
                <child.icon />
              </div>
              <span className="mt-1 text-xs sm:text-sm text-center">{child.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Selected details */}
      {selected?.desc && (
        <div className="p-3 border-t border-green-700 text-sm sm:text-base">
          <p>{selected.desc}</p>
        </div>
      )}
    </div>
  );
}
