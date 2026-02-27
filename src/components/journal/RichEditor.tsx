import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import { Bold, Heading1, Heading2, Image as ImageIcon, Italic, Strikethrough, Underline as UnderlineIcon } from "lucide-react";
import { createPortal } from "react-dom";
import { ImageNode } from "./ImageNodeView";
import "../../styles/image-editor.css";

type RichEditorProps = {
  initialContent?: string;
  onContentChange?: (content: string) => void;
};

async function compressImage(file: File): Promise<string> {
  const imageBitmap = await createImageBitmap(file);
  try {
    const maxWidth = 1400;
    const scale = Math.min(1, maxWidth / imageBitmap.width);
    const width = Math.max(1, Math.round(imageBitmap.width * scale));
    const height = Math.max(1, Math.round(imageBitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.drawImage(imageBitmap, 0, 0, width, height);

    return canvas.toDataURL("image/jpeg", 0.8);
  } finally {
    imageBitmap.close();
  }
}

export const RichEditor = memo(function RichEditor({ initialContent, onContentChange }: RichEditorProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Handle resize events for local blur effect (handled in ImageNodeView now)
  useEffect(() => {
    const handleResizeStart = () => setIsResizing(true);
    const handleResizeEnd = () => setIsResizing(false);

    document.addEventListener("image-resize-start", handleResizeStart);
    document.addEventListener("image-resize-end", handleResizeEnd);

    return () => {
      document.removeEventListener("image-resize-start", handleResizeStart);
      document.removeEventListener("image-resize-end", handleResizeEnd);
    };
  }, []);

  const extensions = useMemo(
    () => [
      StarterKit,
      Strike,
      Underline,
      ImageNode.configure({
        inline: false,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder: "Today was...",
      }),
    ],
    [],
  );

  const editor = useEditor({
    extensions,
    content: initialContent || "",
    editorProps: {
      attributes: {
        class:
          "min-h-[60vh] w-full max-w-[72ch] mx-auto outline-none text-[#4a3b32] text-[1.06rem] sm:text-[1.12rem] font-serif leading-[1.72] tiptap",
      },
      handleDrop: (_view, event, _slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith("image/")) {
            event.preventDefault();
            handleImageFile(file);
            return true;
          }
        }
        return false;
      },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (const item of items) {
            if (item.type.startsWith("image/")) {
              const file = item.getAsFile();
              if (file) {
                event.preventDefault();
                handleImageFile(file);
                return true;
              }
            }
          }
        }
        return false;
      },
    },
    onUpdate({ editor: currentEditor }) {
      onContentChange?.(currentEditor.getHTML());
    },
    immediatelyRender: false,
  });

  // Handle image file insertion
  const handleImageFile = async (file: File) => {
    if (!editor) return;

    try {
      const compressed = await compressImage(file);

      editor.chain()
        .focus()
        .insertContent({
          type: "image",
          attrs: {
            src: compressed,
            alt: "Journal image",
            alignment: "center",
            width: 420,
            x: 0,
            y: 0,
          },
        })
        .run();
    } catch {
      // Ignore image insertion failures to keep editor responsive.
    }
  };

  useEffect(() => {
    if (!editor) return;
    const nextContent = initialContent || "";
    if (editor.getHTML() !== nextContent) {
      editor.commands.setContent(nextContent, { emitUpdate: false });
    }
  }, [editor, initialContent]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    try {
      const compressed = await compressImage(file);
      editor.chain().focus().setImage({
        src: compressed,
        alt: "Journal image",
        width: 420,
        x: 0,
        y: 0,
      }).run();
    } finally {
      event.target.value = "";
    }
  };

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDraggingOver(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(false);

      const files = e.dataTransfer.files;
      if (files && files[0] && files[0].type.startsWith("image/")) {
        const file = files[0];
        if (!editor) return;

        try {
          const compressed = await compressImage(file);
          editor
            .chain()
            .focus()
            .insertContent({
              type: "image",
              attrs: {
                src: compressed,
                alt: "Journal image",
                alignment: "center",
                width: 420,
                x: 0,
                y: 0,
              },
            })
            .run();
        } catch {
          // Ignore image insertion failures to keep editor responsive.
        }
      }
    },
    [editor],
  );

  if (!editor) return null;

  return (
    <div className="relative flex flex-col gap-4">
      <div className="sticky top-3 z-40 mx-auto w-fit rounded-xl border border-[#745f56] bg-[#5d4037]/90 px-3 py-2 text-[#f5f5f5] shadow-lg backdrop-blur">
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className="cursor-pointer rounded-md p-1.5 hover:bg-white/10"
          >
            <Heading1 size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className="cursor-pointer rounded-md p-1.5 hover:bg-white/10"
          >
            <Heading2 size={16} />
          </button>
          <button onClick={() => editor.chain().focus().toggleBold().run()} className="cursor-pointer rounded-md p-1.5 hover:bg-white/10">
            <Bold size={16} />
          </button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} className="cursor-pointer rounded-md p-1.5 hover:bg-white/10">
            <Italic size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className="cursor-pointer rounded-md p-1.5 hover:bg-white/10"
          >
            <UnderlineIcon size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className="cursor-pointer rounded-md p-1.5 hover:bg-white/10"
          >
            <Strikethrough size={16} />
          </button>
          <label className="cursor-pointer rounded-md p-1.5 hover:bg-white/10">
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <ImageIcon size={16} />
          </label>
        </div>
      </div>

      <div
        className={`tiptap-editor-container relative rounded-xl transition-all duration-300 ${isResizing ? "resize-active is-resizing" : ""
          } ${isDraggingOver ? "image-drop-zone drag-over" : ""}`}
        style={isDraggingOver ? { outline: "2px solid var(--accent-ui)", outlineOffset: 2 } : undefined}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <EditorContent editor={editor} />

        {/* Drag and drop hint */}
        {isDraggingOver && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-amber-400/20">
            <div className="rounded-lg bg-[#3d2e26] px-6 py-4 text-white shadow-xl">
              <ImageIcon className="mx-auto mb-2" size={32} />
              <p className="text-lg font-medium">Drop image here</p>
            </div>
          </div>
        )}
      </div>

      {/* Global subtle blur overlay during image resize/drag - makes image stand out */}
      {isResizing && typeof document !== "undefined"
        ? createPortal(<div className="editor-global-blur-overlay" />, document.body)
        : null}
    </div>
  );
});
