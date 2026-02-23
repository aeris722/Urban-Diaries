import { useState } from "react";
import { Smile, Frown, Meh, Heart, Zap } from "lucide-react";
import { motion } from "motion/react";

const moods = [
  { id: "happy", icon: Smile, label: "Happy", color: "text-amber-500" },
  { id: "energetic", icon: Zap, label: "Energetic", color: "text-orange-500" },
  { id: "neutral", icon: Meh, label: "Neutral", color: "text-stone-500" },
  { id: "loved", icon: Heart, label: "Loved", color: "text-rose-500" },
  { id: "down", icon: Frown, label: "Down", color: "text-indigo-500" },
];

export function MoodSelector() {
  return <MoodSelectorControl />;
}

type MoodSelectorProps = {
  value?: string | null;
  onChange?: (mood: string) => void;
};

export function MoodSelectorControl({ value, onChange }: MoodSelectorProps = {}) {
  const [internalMood, setInternalMood] = useState<string | null>(null);
  const selectedMood = value === undefined ? internalMood : value;

  const setMood = (mood: string) => {
    if (value === undefined) {
      setInternalMood(mood);
    }
    onChange?.(mood);
  };

  return (
    <div className="w-full flex justify-center py-4">
      <motion.div 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-4 sm:gap-6 px-6 py-3 rounded-full bg-white/60 backdrop-blur-xl border border-white/40 shadow-lg shadow-[#8d7b6f]/5 hover:shadow-[#8d7b6f]/10 transition-shadow duration-500"
      >
        {moods.map((mood) => {
          const isSelected = selectedMood === mood.id;
          const Icon = mood.icon;
          
          return (
            <motion.button
              key={mood.id}
              onClick={() => setMood(mood.id)}
              whileHover={{ scale: 1.2, rotate: isSelected ? 0 : 10 }}
              whileTap={{ scale: 0.9 }}
              className="relative group p-2 rounded-full transition-all duration-300"
              title={mood.label}
            >
              <Icon 
                size={24} 
                strokeWidth={isSelected ? 2.5 : 1.5}
                className={`transition-colors duration-300 ${isSelected ? mood.color : "text-[#a8a29e] group-hover:text-[#5d4037]"}`} 
              />
              
              {isSelected && (
                <motion.div
                  layoutId="active-mood"
                  className="absolute inset-0 bg-white/50 rounded-full -z-10 blur-md opacity-60"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
