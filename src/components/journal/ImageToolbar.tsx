import { memo } from "react";
import { AlignCenter, Maximize2, Trash2 } from "lucide-react";

export type ImageAlignment = "center" | "full";

interface ImageToolbarProps {
  alignment: ImageAlignment;
  onAlignmentChange: (alignment: ImageAlignment) => void;
  onDelete: () => void;
  onFullWidth: () => void;
}

export const ImageToolbar = memo(function ImageToolbar({
  alignment,
  onAlignmentChange,
  onDelete,
  onFullWidth,
}: ImageToolbarProps) {
  return (
    <div
      className="image-toolbar absolute left-1/2 top-full z-50 mt-2 flex -translate-x-1/2 items-center gap-1 rounded-lg bg-[#3d2e26] px-2 py-1.5 shadow-xl transition-all duration-200"
      onMouseDown={(event) => event.stopPropagation()}
    >
      <button
        onClick={() => onAlignmentChange("center")}
        className={`rounded p-1.5 transition-colors hover:bg-white/20 ${alignment === "center" ? "bg-white/20 text-amber-300" : "text-white/80"
          }`}
        title="Align Center"
      >
        <AlignCenter size={16} />
      </button>
      <button
        onClick={onFullWidth}
        className={`rounded p-1.5 transition-colors hover:bg-white/20 ${alignment === "full" ? "bg-white/20 text-amber-300" : "text-white/80"
          }`}
        title="Full Width"
      >
        <Maximize2 size={16} />
      </button>
      <div className="mx-1 h-4 w-px bg-white/20" />
      <button
        onClick={onDelete}
        className="rounded p-1.5 text-red-400 transition-colors hover:bg-white/20 hover:text-red-300"
        title="Delete Image"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
});
