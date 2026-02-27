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

const toneAsset: Record<LogoTone, string> = {
  color: "/brand/urban-diaries-logo-sepia.svg",
  monochrome: "/brand/urban-diaries-logo-sepia.svg",
  inverse: "/brand/urban-diaries-logo-sepia.svg",
};

export function UrbanDiariesMark({ size = 32, tone = "color", className, title = "Urban Diaries logo mark" }: UrbanDiariesMarkProps) {
  return (
    <img
      src={toneAsset[tone]}
      alt={title}
      width={size}
      height={size}
      className={className}
      loading="eager"
      decoding="async"
    />
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

