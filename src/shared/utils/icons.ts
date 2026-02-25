import {
  BookOpen,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudOff,
  CloudRain,
  CloudSnow,
  CloudSun,
  Code2,
  Dumbbell,
  GraduationCap,
  Library,
  LucideIcon,
  MapPinOff,
  Palmtree,
  Sparkles,
  Sun,
  Tag,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Sun,
  Cloud,
  CloudSun,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudOff,
  MapPinOff,
  BookOpen,
  Dumbbell,
  GraduationCap,
  Sparkles,
  Palmtree,
  Library,
  Code2,
  Tag,
};

export function resolveIcon(iconName: string): LucideIcon {
  return iconMap[iconName] ?? Cloud;
}
