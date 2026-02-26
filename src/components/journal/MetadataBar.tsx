import { memo, useMemo } from "react";
import { Calendar, Clock, MapPin } from "lucide-react";
import { MoodSelectorControl } from "../MoodSelector";
import { resolveIcon } from "../../utils/icons";

type MetadataBarProps = {
  locationName: string;
  temperature: number | null;
  weatherIconName: string;
  location: string;
  onLocationChange: (location: string) => void;
  temperatureValue: number | null;
  onTemperatureChange: (temperature: number | null) => void;
  mood: string;
  onMoodSelect: (mood: string) => void;
};

export const MetadataBar = memo(function MetadataBar({
  locationName,
  temperature,
  weatherIconName,
  location,
  onLocationChange,
  temperatureValue,
  onTemperatureChange,
  mood,
  onMoodSelect,
}: MetadataBarProps) {
  const now = useMemo(() => new Date(), []);
  const WeatherIcon = resolveIcon(weatherIconName);

  return (
    <div className="flex items-center gap-4 flex-wrap rounded-2xl border border-[#e7e5e4]/70 bg-[#fbfaf8]/70 backdrop-blur px-4 py-3">
      <span className="inline-flex h-12 items-center gap-2 rounded-xl border border-[#ece8e1] bg-white px-3 text-sm text-[#57534e]">
        <MapPin size={18} className="text-[#b45309]" />
        <input
          value={location}
          onChange={(event) => onLocationChange(event.target.value)}
          placeholder={locationName}
          className="w-[170px] border-0 bg-transparent p-0 text-sm outline-none"
          aria-label="Entry location"
        />
      </span>

      <span className="inline-flex h-12 items-center gap-2 rounded-xl border border-[#ece8e1] bg-white px-3 text-sm text-[#57534e]">
        <WeatherIcon size={18} className="text-[#f59e0b]" />
        <input
          type="number"
          value={temperatureValue ?? ""}
          onChange={(event) => {
            const next = event.target.value.trim();
            onTemperatureChange(next === "" ? null : Number(next));
          }}
          placeholder={temperature === null ? "--" : String(Math.round(temperature))}
          className="w-[80px] border-0 bg-transparent p-0 text-sm outline-none"
          aria-label="Entry temperature in Fahrenheit"
        />
        <span>F</span>
      </span>

      <MoodSelectorControl value={mood} onChange={onMoodSelect} size="compact" />

      <div className="ml-auto hidden items-center gap-3 text-base text-[#a8a29e] font-serif italic md:flex">
        <span className="inline-flex items-center gap-1.5"><Calendar size={16} /> {now.toLocaleDateString()}</span>
        <span className="inline-flex items-center gap-1.5"><Clock size={16} /> {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
      </div>
    </div>
  );
});
