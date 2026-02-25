import { useState } from "react";
import { Heart, Zap, Smile, CloudRain, Moon, Flower2, LucideIcon } from "lucide-react";

type Mood = {
  id: string;
  icon: LucideIcon;
  label: string;
  color: string;
  selectedStyle: string;
};

const moods: Mood[] = [
  { id: "love", icon: Heart, label: "Love", color: "text-rose-400", selectedStyle: "shadow-[0_0_18px_rgba(244,114,182,0.45)] ring-rose-200 bg-rose-50" },
  { id: "energetic", icon: Zap, label: "Energetic", color: "text-amber-400", selectedStyle: "shadow-[0_0_18px_rgba(251,191,36,0.45)] ring-amber-200 bg-amber-50" },
  { id: "happy", icon: Smile, label: "Happy", color: "text-orange-400", selectedStyle: "shadow-[0_0_18px_rgba(251,146,60,0.45)] ring-orange-200 bg-orange-50" },
  { id: "sad", icon: CloudRain, label: "Sad", color: "text-sky-400", selectedStyle: "shadow-[0_0_18px_rgba(56,189,248,0.45)] ring-sky-200 bg-sky-50" },
  { id: "lonely", icon: Moon, label: "Lonely", color: "text-indigo-400", selectedStyle: "shadow-[0_0_18px_rgba(129,140,248,0.45)] ring-indigo-200 bg-indigo-50" },
  { id: "calm", icon: Flower2, label: "Calm", color: "text-emerald-400", selectedStyle: "shadow-[0_0_18px_rgba(52,211,153,0.45)] ring-emerald-200 bg-emerald-50" },
];

export function MoodSelector() {
  return <MoodSelectorControl />;
}

type MoodSelectorProps = {
  value?: string | null;
  onChange?: (mood: string) => void;
  size?: "default" | "compact";
};

export function MoodSelectorControl({ value, onChange, size = "default" }: MoodSelectorProps = {}) {
  const [internalMood, setInternalMood] = useState<string | null>(null);
  const selectedMood = value === undefined ? internalMood : value;
  const compact = size === "compact";

  const setMood = (mood: string) => {
    if (value === undefined) {
      setInternalMood(mood);
    }
    onChange?.(mood);
  };

  return (
    <div className={`flex items-center ${compact ? "gap-2" : "gap-3"}`}>
      {!compact ? <span className="text-sm text-[#78716c]">Mood</span> : null}
      <div className="flex items-center gap-1 rounded-full border border-[#ece8e1] bg-white/90 px-2 py-1">
        {moods.map((mood) => {
          const isSelected = selectedMood === mood.id;
          const Icon = mood.icon;
          return (
            <button
              key={mood.id}
              onClick={() => setMood(mood.id)}
              className={`grid h-10 w-10 place-items-center rounded-full ring-1 ring-transparent transition-transform duration-150 hover:scale-110 ${
                isSelected ? mood.selectedStyle : "hover:bg-[#f6f2eb]"
              }`}
              title={mood.label}
              aria-label={mood.label}
            >
              <Icon size={19} className={mood.color} strokeWidth={1.9} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
