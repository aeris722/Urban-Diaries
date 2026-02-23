import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Image, Plus, X, Type, Loader2 } from "lucide-react";

type Block = {
  id: string;
  type: "text" | "image";
  content: string; // Text content or Image URL
};

export function Editor() {
  const [blocks, setBlocks] = useState<Block[]>([
    { id: "1", type: "text", content: "" },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save simulation
  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    const hasContent = blocks.some(b => b.content.length > 0);
    if (hasContent) {
      setIsSaving(true);
      saveTimeoutRef.current = setTimeout(() => {
        setIsSaving(false);
        setLastSaved(new Date());
      }, 1500);
    }
  }, [blocks]);

  const addImageBlock = (url: string) => {
    const newImageBlock: Block = { id: Date.now().toString(), type: "image", content: url };
    const newTextBlock: Block = { id: (Date.now() + 1).toString(), type: "text", content: "" };
    setBlocks((prev) => [...prev, newImageBlock, newTextBlock]);
  };

  const updateBlock = (id: string, newContent: string) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, content: newContent } : b)));
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        addImageBlock(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 pb-32">
      {/* Header Info */}
      <div className="flex justify-between items-center px-4 opacity-60">
        <div className="text-stone-500 text-xs font-serif italic tracking-wide">
          {new Date().toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        <div className="flex items-center gap-2 text-stone-400 text-xs font-mono">
          {isSaving ? (
            <span className="flex items-center gap-1"><Loader2 size={10} className="animate-spin"/> Saving...</span>
          ) : lastSaved ? (
            `Saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          ) : "New Entry"}
        </div>
      </div>

      <div className="min-h-[60vh] flex flex-col gap-6">
        <AnimatePresence>
          {blocks.map((block, index) => (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="group relative"
            >
              {block.type === "text" ? (
                <div className="relative">
                  <textarea
                    value={block.content}
                    onChange={(e) => {
                      updateBlock(block.id, e.target.value);
                      // Auto-grow height
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    placeholder={index === 0 ? "Start writing..." : "Continue writing..."}
                    className="w-full bg-transparent resize-none outline-none border-none text-[#5c4d3c] text-xl font-serif leading-relaxed placeholder:text-stone-300/50 overflow-hidden min-h-[1.5em]"
                    style={{ minHeight: '60px' }}
                  />
                  {blocks.length > 1 && block.content === "" && index !== 0 && (
                    <button 
                      onClick={() => removeBlock(block.id)}
                      className="absolute -right-8 top-2 text-stone-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden shadow-lg shadow-stone-200/50 my-4 group-hover:shadow-stone-300/50 transition-all">
                   <img src={block.content} alt="Journal attachment" className="w-full h-auto object-cover max-h-[500px]" />
                   <button 
                      onClick={() => removeBlock(block.id)}
                      className="absolute top-4 right-4 bg-black/20 backdrop-blur-md p-1.5 rounded-full text-white hover:bg-red-500/80 transition-colors"
                    >
                      <X size={16} />
                    </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Toolbar */}
      <motion.div 
        className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-full bg-[#3e342a]/90 backdrop-blur-xl border border-white/10 shadow-xl shadow-stone-900/10 text-[#f5f0e6] z-50"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <label className="p-3 hover:bg-white/10 rounded-full cursor-pointer transition-colors tooltip" title="Add Image">
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          <Image size={20} />
        </label>
        
        <div className="w-px h-6 bg-white/10 mx-1" />
        
        <button 
          onClick={() => setBlocks(p => [...p, { id: Date.now().toString(), type: "text", content: "" }])}
          className="p-3 hover:bg-white/10 rounded-full transition-colors"
          title="Add Text Block"
        >
          <Type size={20} />
        </button>
      </motion.div>
    </div>
  );
}
