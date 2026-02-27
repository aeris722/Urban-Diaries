import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, CircleHelp, CloudSun, MapPin, Smile, Sparkles } from "lucide-react";
import type { User } from "firebase/auth";

const ROTATING_TAGLINES = [
  "Rich journaling, multi-session writing, and cloud sync built for fast daily use.",
  "Capture thoughts, photos, and moods in a place that feels like home.",
  "Small moments, kept. Big changes, remembered.",
];

type HeroProps = {
  user: User | null;
  isSubmitting: boolean;
  localError: string | null;
  authError: string | null;
  onGoogleAuth: () => void;
  onNavigateToDashboard: () => void;
};

export function Hero({ user, isSubmitting, localError, authError, onGoogleAuth, onNavigateToDashboard }: HeroProps) {
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [taglineVisible, setTaglineVisible] = useState(true);
  const pendingTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTaglineVisible(false);
      pendingTimeoutRef.current = window.setTimeout(() => {
        setTaglineIndex((prev) => (prev + 1) % ROTATING_TAGLINES.length);
        setTaglineVisible(true);
      }, 380);
    }, 7000);

    return () => {
      clearInterval(timer);
      if (pendingTimeoutRef.current !== null) {
        clearTimeout(pendingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <section className="relative min-h-[84vh] flex items-center pt-24 pb-10 overflow-hidden" style={{ background: "var(--bg)", contentVisibility: "auto", containIntrinsicSize: "1px 780px" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute -top-32 left-1/3 w-[620px] h-[620px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(239,217,193,0.55) 0%, rgba(239,217,193,0) 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute top-16 -right-24 w-[480px] h-[480px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(208,170,118,0.2) 0%, rgba(208,170,118,0) 70%)",
            filter: "blur(72px)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[360px] h-[360px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(181,138,96,0.12) 0%, rgba(181,138,96,0) 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-6 w-full grid grid-cols-12 gap-y-12 lg:gap-x-16 xl:gap-x-20 items-center relative z-10">
        <div className="col-span-12 lg:col-span-7 space-y-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}>
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
              style={{
                background: "rgba(181,138,96,0.1)",
                border: "1px solid rgba(181,138,96,0.28)",
                color: "var(--accent-mocha)",
              }}
            >
              <Sparkles size={13} strokeWidth={2} />
              Where moments become memories
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.15, ease: "easeOut" }}
            className="max-w-3xl text-3xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] tracking-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}
          >
            Every day is a new
            story,
            <span className="block" style={{ color: "var(--accent-mocha)" }}>
              where will it take you today?
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="h-14 relative overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {taglineVisible && (
                <motion.p
                  key={taglineIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.38 }}
                  className="absolute text-lg md:text-xl max-w-xl leading-relaxed"
                  style={{ color: "var(--landing-muted)", fontFamily: "var(--font-body)" }}
                >
                  {ROTATING_TAGLINES[taglineIndex]}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            className="flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.42 }}
          >
            <button
              onClick={user ? onNavigateToDashboard : onGoogleAuth}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none"
              style={{
                background: "var(--accent-coffee)",
                boxShadow: "0 8px 18px rgba(107,79,58,0.24)",
                ["--tw-ring-color" as string]: "var(--accent-ui)",
              }}
            >
              {user ? "Open Dashboard" : isSubmitting ? "Signing in..." : "Start Writing Free"}
              <ArrowRight size={16} />
            </button>

            <a
              href="#features"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/45 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-offset-2"
              style={{
                background: "transparent",
                border: "1px solid rgba(125,113,104,0.35)",
                color: "var(--landing-muted-strong)",
                ["--tw-ring-color" as string]: "var(--accent-ui)",
              }}
            >
              <CircleHelp size={15} />
              Learn more
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.56 }}
            className="text-xs tracking-wide"
            style={{ color: "var(--landing-muted)" }}
          >
            No ads | Private | Auto-saved
          </motion.p>

          {(localError ?? authError) && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-600">
              {localError ?? authError}
            </motion.p>
          )}
        </div>

        <motion.div
          className="col-span-12 lg:col-span-5 relative"
          initial={{ opacity: 0, x: 32, y: 8 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.85, delay: 0.2, ease: "easeOut" }}
        >
          <div
            className="absolute -inset-5 rounded-[28px] pointer-events-none"
            style={{
              background: "radial-gradient(circle at 50% 35%, rgba(208,170,118,0.18), rgba(208,170,118,0) 72%)",
              filter: "blur(18px)",
            }}
            aria-hidden="true"
          />
          <div
            className="relative overflow-hidden transition-transform duration-300 hover:-translate-y-1"
            style={{
              background: "rgba(255,255,255,0.55)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid var(--glass-border)",
              borderRadius: "20px",
              boxShadow: "0 12px 28px rgba(43,38,35,0.08), inset 0 1px 0 rgba(255,255,255,0.7)",
            }}
          >
            <div className="relative h-56 overflow-hidden" style={{ borderRadius: "20px 20px 0 0" }}>
              <img
                src="https://i.pinimg.com/1200x/3c/4a/40/3c4a40143d21240f85aa1497efcde289.jpg"
                alt="Journal writing workspace with coffee and tablet"
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(to bottom, rgba(43,38,35,0) 50%, rgba(43,38,35,0.38) 100%)",
                }}
              />
              <div
                className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{
                  background: "rgba(255,255,255,0.88)",
                  backdropFilter: "blur(8px)",
                  color: "var(--accent-mocha)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <span className="sync-dot w-1.5 h-1.5 rounded-full" />
                Synced
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex items-center gap-1 text-xs" style={{ color: "var(--landing-muted)" }}>
                  <MapPin size={11} />
                  New Delhi
                </span>
                <span className="flex items-center gap-1 text-xs" style={{ color: "var(--landing-muted)" }}>
                  <Smile size={11} />
                  Happy
                </span>
                <span className="flex items-center gap-1 text-xs" style={{ color: "var(--landing-muted)" }}>
                  <CloudSun size={11} />
                  22 C - Clear
                </span>
              </div>

              <p className="text-lg font-medium mb-1 leading-snug" style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}>
                Evening reset - July 14
              </p>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--landing-muted)" }}>
                I closed the day with a short walk, warm tea, and one honest paragraph. Progress felt quiet but real,
                and I finally cleared the task that had been sitting in my head all week.
              </p>

              {!user ? (
                <button
                  onClick={onGoogleAuth}
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-105 disabled:opacity-60"
                  style={{ background: "var(--accent-mocha)", color: "#fef9f6" }}
                >
                  {isSubmitting ? "Signing in..." : "Continue with Google"}
                </button>
              ) : (
                <button
                  onClick={onNavigateToDashboard}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-105"
                  style={{ background: "var(--accent-coffee)", color: "#fef9f6" }}
                >
                  Open Dashboard
                </button>
              )}

              {(localError ?? authError) && <p className="mt-2 text-xs text-red-600 text-center">{localError ?? authError}</p>}

              <p className="text-center text-xs mt-3" style={{ color: "var(--landing-muted)" }}>
                Sign up and login are both Google-only.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[72%] h-px pointer-events-none"
        style={{ background: "linear-gradient(to right, transparent, rgba(181,138,96,0.42), transparent)" }}
        aria-hidden="true"
      />
    </section>
  );
}
