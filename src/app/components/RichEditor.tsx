import { useState, useRef, useEffect } from "react";
import { 
  Bold, Italic, Underline, Strikethrough, 
  Heading1, Heading2, Heading3, 
  Image as ImageIcon, AlignLeft, AlignCenter, AlignRight,
  Type
} from "lucide-react";
import { motion } from "motion/react";

type RichEditorProps = {
  initialContent?: string;
  onContentChange?: (content: string) => void;
};

export function RichEditor({ initialContent, onContentChange }: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Execute command helper
  const execCmd = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    syncContent();
  };

  const syncContent = () => {
    if (editorRef.current) {
      const nextContent = editorRef.current.innerHTML;
      setContent(nextContent);
      onContentChange?.(nextContent);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        execCmd("insertImage", e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    // Set initial content if needed
    if (editorRef.current && !editorRef.current.innerHTML) {
      const seedContent = initialContent || "<p>Today was...</p>";
      editorRef.current.innerHTML = seedContent;
      setContent(seedContent);
    }
  }, [initialContent]);

  return (
    <div className="flex flex-col gap-4 w-full h-full relative">
      {/* Floating Toolbar */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-4 z-40 mx-auto"
      >
        <div className="flex items-center gap-1 sm:gap-2 px-3 py-2 rounded-xl bg-[#5d4037]/90 backdrop-blur-xl border border-[#ffffff]/10 shadow-lg shadow-[#5d4037]/20 text-[#f5f5f5]">
          <ToolbarButton onClick={() => execCmd("formatBlock", "H1")} icon={Heading1} />
          <ToolbarButton onClick={() => execCmd("formatBlock", "H2")} icon={Heading2} />
          <ToolbarButton onClick={() => execCmd("formatBlock", "H3")} icon={Heading3} />
          <div className="w-px h-5 bg-white/20 mx-1" />
          <ToolbarButton onClick={() => execCmd("bold")} icon={Bold} />
          <ToolbarButton onClick={() => execCmd("italic")} icon={Italic} />
          <ToolbarButton onClick={() => execCmd("underline")} icon={Underline} />
          <ToolbarButton onClick={() => execCmd("strikeThrough")} icon={Strikethrough} />
          <div className="w-px h-5 bg-white/20 mx-1" />
          <label className="p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors flex items-center justify-center text-white/90 hover:text-white">
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <ImageIcon size={18} />
          </label>
        </div>
      </motion.div>

      {/* Editor Area */}
      <div className="flex-1 relative group">
        <div 
          ref={editorRef}
          contentEditable
          onInput={syncContent}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="min-h-[60vh] w-full outline-none text-[#4a3b32] text-lg sm:text-xl font-serif leading-loose prose prose-stone max-w-none prose-p:my-2 prose-headings:font-serif prose-headings:font-medium prose-headings:text-[#3e2b26] prose-img:rounded-xl prose-img:shadow-md"
          style={{ 
            fontFamily: '"Source Serif 4", serif',
            textShadow: "0 0 1px rgba(74, 59, 50, 0.05)"
          }}
        />
        
        {!content && !isFocused && (
          <div className="absolute top-0 left-0 text-[#8d7b6f]/50 text-xl font-serif italic pointer-events-none">
            Start writing your story...
          </div>
        )}
      </div>
    </div>
  );
}

function ToolbarButton({ onClick, icon: Icon }: { onClick: () => void, icon: any }) {
  return (
    <button 
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/90 hover:text-white"
    >
      <Icon size={18} />
    </button>
  );
}
