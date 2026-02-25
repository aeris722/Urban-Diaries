import { memo, useEffect, useMemo } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import Image from "@tiptap/extension-image";
import { Bold, Heading1, Heading2, Image as ImageIcon, Italic, Strikethrough, Underline as UnderlineIcon } from "lucide-react";

type RichEditorProps = {
  initialContent?: string;
  onContentChange?: (content: string) => void;
};

async function compressImage(file: File): Promise<string> {
  const imageBitmap = await createImageBitmap(file);
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
}

export const RichEditor = memo(function RichEditor({ initialContent, onContentChange }: RichEditorProps) {
  const extensions = useMemo(
    () => [
      StarterKit,
      Strike,
      Underline,
      Image.configure({ inline: false, allowBase64: true }),
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
          "min-h-[60vh] w-full outline-none text-[#4a3b32] text-lg sm:text-xl font-serif leading-loose tiptap",
      },
    },
    onUpdate({ editor: currentEditor }) {
      onContentChange?.(currentEditor.getHTML());
    },
    immediatelyRender: false,
  });

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
      editor.chain().focus().setImage({ src: compressed, alt: "Journal image", loading: "lazy" }).run();
    } finally {
      event.target.value = "";
    }
  };

  if (!editor) return null;

  return (
    <div className="relative flex flex-col gap-4">
      <div className="sticky top-3 z-40 mx-auto w-fit rounded-xl border border-[#745f56] bg-[#5d4037]/90 px-3 py-2 text-[#f5f5f5] shadow-lg backdrop-blur">
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="rounded-md p-1.5 hover:bg-white/10"><Heading1 size={16} /></button>
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="rounded-md p-1.5 hover:bg-white/10"><Heading2 size={16} /></button>
          <button onClick={() => editor.chain().focus().toggleBold().run()} className="rounded-md p-1.5 hover:bg-white/10"><Bold size={16} /></button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} className="rounded-md p-1.5 hover:bg-white/10"><Italic size={16} /></button>
          <button onClick={() => editor.chain().focus().toggleUnderline().run()} className="rounded-md p-1.5 hover:bg-white/10"><UnderlineIcon size={16} /></button>
          <button onClick={() => editor.chain().focus().toggleStrike().run()} className="rounded-md p-1.5 hover:bg-white/10"><Strikethrough size={16} /></button>
          <label className="cursor-pointer rounded-md p-1.5 hover:bg-white/10">
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <ImageIcon size={16} />
          </label>
        </div>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
});
