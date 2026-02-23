import { Navbar } from "../components/Navbar";
import { RichEditor } from "../components/RichEditor";
import { MoodSelector } from "../components/MoodSelector";
import { MetadataBar } from "../components/MetadataBar";
import { motion } from "motion/react";

export default function Dashboard() {
  return (
    <div className="min-h-screen w-full bg-[#fdfbf7] text-[#44403c] font-sans selection:bg-[#fde68a]/50 selection:text-[#451a03] overflow-x-hidden relative">
      
      {/* Ambient Background Blobs - Coffee/Warm Tones */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-[#fcd34d]/20 blur-[150px] mix-blend-multiply opacity-50" // Amber-200
        />
        <motion.div 
          animate={{ 
            scale: [1.1, 1, 1.1],
            x: [0, -40, 0],
            y: [0, 40, 0],
            opacity: [0.2, 0.4, 0.2] 
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[10%] -right-[15%] w-[50vw] h-[50vw] rounded-full bg-[#fdba74]/20 blur-[120px] mix-blend-multiply opacity-40" // Orange-200
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 20, 0],
            opacity: [0.1, 0.2, 0.1] 
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          className="absolute bottom-[-10%] left-[20%] w-[70vw] h-[70vw] rounded-full bg-[#d6d3d1]/30 blur-[180px] mix-blend-multiply opacity-30" // Stone-300
        />
        
        {/* Grain overlay for paper texture */}
        <div className="absolute inset-0 opacity-[0.5] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-105 contrast-[1.1] pointer-events-none" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-8 md:gap-12">
          
          {/* Greeting Section */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-center space-y-3 pt-4 md:pt-8"
          >
            <h2 className="text-3xl md:text-5xl font-medium font-serif italic text-[#292524] tracking-tight leading-snug">
              Every day is a story.
            </h2>
            <p className="text-[#78716c] text-sm md:text-base font-light tracking-wide max-w-md mx-auto leading-relaxed opacity-90">
              Where will yours take you today?
            </p>
          </motion.div>

          {/* Mood Selector (Pill) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full flex justify-center"
          >
            <MoodSelector />
          </motion.div>

          {/* Metadata & Editor Container */}
          <div className="flex-1 flex flex-col gap-6">
            <MetadataBar />
            
            <div className="relative p-8 md:p-12 rounded-[2.5rem] bg-[#fcfcfc]/50 backdrop-blur-2xl border border-[#e7e5e4]/60 shadow-xl shadow-[#a8a29e]/5 ring-1 ring-white/60">
               <RichEditor />
            </div>
          </div>

          {/* Footer */}
          <motion.footer 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="mt-auto py-12 text-center border-t border-[#e7e5e4]/30"
          >
            <p className="text-[#a8a29e] text-xs font-serif italic tracking-wider">
              One Day &copy; {new Date().getFullYear()} — capture the moment
            </p>
          </motion.footer>

        </main>
      </div>
    </div>
  );
}
