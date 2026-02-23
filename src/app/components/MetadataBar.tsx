import { MapPin, Sun, Calendar, Activity, Tag, BarChart2 } from "lucide-react";
import { motion } from "motion/react";

export function MetadataBar() {
  const currentDate = new Date().toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' });
  const currentTime = new Date().toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 rounded-2xl bg-[#faf9f6]/40 border border-[#e7e5e4]/50 backdrop-blur-md shadow-sm"
    >
      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#78716c] uppercase tracking-wider">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/60 shadow-sm border border-white/40 hover:bg-white/80 transition-colors cursor-pointer" title="Location">
          <MapPin size={14} className="text-[#d97706]" />
          <span>San Francisco, CA</span>
        </div>
        
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/60 shadow-sm border border-white/40 hover:bg-white/80 transition-colors cursor-pointer" title="Weather">
          <Sun size={14} className="text-[#f59e0b]" />
          <span>72°F Sunny</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/60 shadow-sm border border-white/40 hover:bg-white/80 transition-colors cursor-pointer" title="Activity">
          <Activity size={14} className="text-[#10b981]" />
          <span>Writing</span>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-[#a8a29e] font-serif italic">
        <span className="flex items-center gap-1"><Calendar size={12} /> {currentDate}</span>
        <span className="w-1 h-1 rounded-full bg-[#d6d3d1]" />
        <span>{currentTime}</span>
      </div>
    </motion.div>
  );
}
