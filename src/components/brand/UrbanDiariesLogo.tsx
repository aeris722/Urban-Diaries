type LogoTone = "color" | "monochrome" | "inverse";

type UrbanDiariesMarkProps = {
  size?: number;
  tone?: LogoTone;
  className?: string;
  title?: string;
};

type UrbanDiariesLogoProps = {
  size?: number;
  tone?: LogoTone;
  className?: string;
  textClassName?: string;
  name?: string;
};

const toneColors: Record<LogoTone, { shell: string; panel: string; fold: string; mark: string; stroke: string }> = {
  color: {
    shell: "#F4EEE6",
    panel: "#E8DCCF",
    fold: "#D2B99E",
    mark: "#72543E",
    stroke: "#B79F86",
  },
  monochrome: {
    shell: "#F7F3EE",
    panel: "#E5DED4",
    fold: "#2F2B28",
    mark: "#2F2B28",
    stroke: "#2F2B28",
  },
  inverse: {
    shell: "#2F2B28",
    panel: "#433D39",
    fold: "#5A534D",
    mark: "#F7F3EE",
    stroke: "#675F58",
  },
};

export function UrbanDiariesMark({ size = 32, tone = "color", className, title = "Urban Diaries logo mark" }: UrbanDiariesMarkProps) {
  const colors = toneColors[tone];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="4" y="4" width="56" height="56" rx="16" fill={colors.shell} stroke={colors.stroke} strokeWidth="1.5" />
      <rect x="14" y="12" width="36" height="40" rx="11" fill={colors.panel} />
      <path d="M38 12H50V24L38 12Z" fill={colors.fold} />
      <path
        d="M22 19V35.5C22 41.851 27.149 47 33.5 47C39.851 47 45 41.851 45 35.5V19"
        fill="none"
        stroke={colors.mark}
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function UrbanDiariesLogo({
  size = 34,
  tone = "color",
  className,
  textClassName,
  name = "Urban Diaries",
}: UrbanDiariesLogoProps) {
  const textColor = tone === "inverse" ? "#F7F3EE" : "#2F2B28";

  return (
    <div className={className}>
      <UrbanDiariesMark size={size} tone={tone} />
      <span className={textClassName} style={{ color: textColor, fontFamily: "var(--font-display)" }}>
        {name}
      </span>
    </div>
  );
}
