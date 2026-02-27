import { motion } from "motion/react";
import { Type, Globe, Cloud, Lock, Smartphone, Smile } from "lucide-react";
import type { ReactNode } from "react";

type FeatureItem = {
  icon: ReactNode;
  title: string;
  description: string;
  accent: string;
};

const FEATURES: FeatureItem[] = [
  {
    icon: <Type size={22} />,
    title: "Rich Text",
    description: "Format and embed images without losing writing flow. Full toolbar, inline images, headings.",
    accent: "rgba(239,217,193,0.15)",
  },
  {
    icon: <Globe size={22} />,
    title: "Live Context",
    description: "Location-aware weather metadata and activity tracking auto-attached to every entry.",
    accent: "rgba(208,170,118,0.12)",
  },
  {
    icon: <Cloud size={22} />,
    title: "Autosave",
    description: "Debounced autosave and quick session switching - your words are never lost.",
    accent: "rgba(208,170,118,0.12)",
  },
  {
    icon: <Lock size={22} />,
    title: "Secure Auth",
    description: "Google-only login and signup. Simple, safe, and no passwords to forget.",
    accent: "rgba(181,138,96,0.12)",
  },
  {
    icon: <Smartphone size={22} />,
    title: "Responsive",
    description: "Built to feel smooth on phones and low-end devices. Fast by design.",
    accent: "rgba(181,138,96,0.12)",
  },
  {
    icon: <Smile size={22} />,
    title: "Mood Tracking",
    description: "Track mood and activity with each writing session. See patterns, know yourself.",
    accent: "rgba(239,217,193,0.15)",
  },
];

function GlassFeatureCard({ feature, index }: { feature: FeatureItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className="group relative p-7 transition-all duration-300 glass-pop ui-pop ui-soft-light"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "var(--card-radius)",
      }}
      whileHover={{
        background: "rgba(255,255,255,0.08)",
        borderColor: "rgba(255,255,255,0.18)",
        y: -3,
      }}
    >
      <div
        className="mb-6 w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 ui-glow-ring"
        style={{
          background: feature.accent,
          border: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.85)",
        }}
      >
        {feature.icon}
      </div>

      <h3 className="text-lg font-semibold mb-2" style={{ color: "rgba(255,255,255,0.9)", fontFamily: "var(--font-display)" }}>
        {feature.title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.56)" }}>
        {feature.description}
      </p>

      <div
        className="absolute bottom-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "linear-gradient(to right, transparent, var(--accent-coffee), transparent)" }}
      />
    </motion.div>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-20 md:py-28 overflow-hidden" style={{ background: "#120e0b", contentVisibility: "auto", containIntrinsicSize: "1px 900px" }} aria-label="Features">
      <div
        className="ui-ambient-orb absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(181,138,96,0.07) 0%, transparent 70%)",
        }}
      />
      <div
        className="ui-ambient-orb absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(208,170,118,0.08) 0%, transparent 70%)",
          animationDelay: "1.4s",
        }}
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-4 px-3 py-1 rounded-full"
            style={{
              color: "var(--accent-coffee)",
              background: "rgba(181,138,96,0.1)",
              border: "1px solid rgba(181,138,96,0.18)",
            }}
          >
            Made with love.
          </span>
          <h2 className="text-4xl md:text-5xl leading-tight" style={{ fontFamily: "var(--font-display)", color: "rgba(255,255,255,0.92)" }}>
            More than just words.
          </h2>
          <p className="mt-4 text-lg max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.46)" }}>
            Every feature is designed to keep you in the writing moment.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => (
            <GlassFeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
