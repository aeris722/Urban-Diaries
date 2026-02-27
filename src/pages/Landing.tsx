import { useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Coffee, Compass, FileText, Github, Instagram, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useNavigate } from "react-router";
import { Hero } from "../components/landing/Hero";
import { CardGrid } from "../components/landing/CardGrid";
import { FeaturesSection } from "../components/landing/FeaturesSection";
import { useAuth } from "../hooks/useAuth";
import { UrbanDiariesLogo } from "../components/brand/UrbanDiariesLogo";

export default function Landing() {
  const navigate = useNavigate();
  const { user, logInWithGoogle, authError, clearAuthError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleGoogleAuth = async () => {
    clearAuthError();
    setLocalError(null);
    setIsSubmitting(true);
    try {
      await logInWithGoogle();
      navigate("/dashboard");
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "Google sign-in failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="page-fade-in min-h-screen w-full overflow-x-hidden"
      style={{
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: "var(--font-body)",
      }}
    >
      <nav
        className="fixed top-0 w-full z-50 glass-pop"
        style={{
          background: "rgba(252,249,246,0.82)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--glass-border)",
          boxShadow: "0 1px 0 rgba(181,138,96,0.06)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <UrbanDiariesLogo
            size={34}
            name="Urban Diaries."
            className="flex items-center gap-2.5"
            textClassName="text-xl font-semibold tracking-tight italic"
          />

          <button
            onClick={() => (user ? navigate("/dashboard") : handleGoogleAuth())}
            disabled={isSubmitting}
            className="cursor-pointer ui-pop ui-glow-breathe inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:brightness-110 hover:shadow-md focus-visible:outline-none disabled:opacity-60"
            style={{
              background: "var(--accent-coffee)",
              color: "#fef9f6",
              boxShadow: "0 2px 10px rgba(181,138,96,0.28)",
            }}
          >
            {user ? "Dashboard" : isSubmitting ? "..." : "Get Started"}
            <ArrowUpRight size={14} />
          </button>
        </div>
      </nav>

      <Hero
        user={user}
        isSubmitting={isSubmitting}
        localError={localError}
        authError={authError}
        onGoogleAuth={handleGoogleAuth}
        onNavigateToDashboard={() => navigate("/dashboard")}
      />

      <CardGrid />
      <FeaturesSection />

      <section className="py-24 px-6 text-center overflow-hidden relative" style={{ background: "var(--accent-pastel-2)" }}>
        <div className="ui-ambient-orb w-[220px] h-[220px] -top-10 left-10" style={{ background: "rgba(208,170,118,0.18)" }} />
        <div className="ui-ambient-orb w-[180px] h-[180px] -bottom-8 right-8" style={{ background: "rgba(181,138,96,0.2)", animationDelay: "1s" }} />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(181,138,96,0.12) 0%, transparent 70%)" }}
        />
        <motion.div
          className="max-w-3xl mx-auto relative z-10 ui-soft-light rounded-3xl px-6 py-8 glass-pop"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ background: "rgba(255,255,255,0.36)", border: "1px solid rgba(181,138,96,0.2)" }}
        >
          <div className="text-5xl leading-none mb-6 select-none" style={{ color: "var(--accent-coffee)", fontFamily: "var(--font-display)", opacity: 0.5 }}>
            "
          </div>
          <blockquote className="text-3xl md:text-4xl font-medium leading-snug mb-6" style={{ fontFamily: "var(--font-display)", color: "var(--text)", fontStyle: "italic" }}>
            A cup of coffee, a blank page, your life.
          </blockquote>
          <p className="text-sm" style={{ color: "var(--landing-muted)" }}>
            Urban Diaries - Daily journaling reimagined
          </p>

          {!user && (
            <button
              onClick={handleGoogleAuth}
              disabled={isSubmitting}
              className="cursor-pointer ui-pop mt-10 inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold text-white transition-all duration-200 hover:brightness-110 hover:shadow-lg disabled:opacity-60"
              style={{
                background: "var(--accent-mocha)",
                boxShadow: "0 4px 20px rgba(107,79,58,0.28)",
              }}
            >
              Start your diary today
              <ArrowUpRight size={16} />
            </button>
          )}
        </motion.div>
      </section>

      <footer
        style={{
          background: "rgba(252,249,246,0.9)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid var(--glass-border)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-14 grid gap-10 md:grid-cols-5">
          <div className="md:col-span-1">
            <UrbanDiariesLogo
              size={28}
              className="mb-4 flex items-center gap-2"
              textClassName="font-semibold tracking-tight italic"
            />
            <p className="text-xs leading-relaxed" style={{ color: "var(--landing-muted-strong)" }}>
              Daily writing, beautifully kept.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: "var(--text)" }}>
              Contact
            </h4>
            <div className="space-y-3 text-sm">
              <a href="https://www.instagram.com/aasiiishh" className="flex items-center gap-2 transition-colors hover:opacity-80" style={{ color: "var(--landing-muted-strong)" }} aria-label="Instagram">
                <Instagram size={15} />
                aasiiishh
              </a>
              <a href="mailto:swapnajitef3@gmail.com" className="flex items-center gap-2 transition-colors hover:opacity-80" style={{ color: "var(--landing-muted-strong)" }} aria-label="Email">
                <Mail size={15} />
                swapnajitef3@gmail.com
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: "var(--text)" }}>
              Resources
            </h4>
            <div className="space-y-3 text-sm">
              <a href="https://github.com/aeris722/Urban-Diaries" className="flex items-center gap-2 transition-colors hover:opacity-80" style={{ color: "var(--landing-muted-strong)" }}>
                <Github size={15} />
                Github
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: "var(--text)" }}>
              About
            </h4>
            <div className="space-y-3 text-sm">
              <a href="#" className="flex items-center gap-2 transition-colors hover:opacity-80" style={{ color: "var(--landing-muted-strong)" }}>
                <UserRound size={15} />
                About me
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: "var(--text)" }}>
              Legal and more
            </h4>
            <div className="space-y-3 text-sm">
              <a href="#" className="flex items-center gap-2 transition-colors hover:opacity-80" style={{ color: "var(--landing-muted-strong)" }}>
                <FileText size={15} />
                Terms
              </a>
              <a href="#" className="flex items-center gap-2 transition-colors hover:opacity-80" style={{ color: "var(--landing-muted-strong)" }}>
                <ShieldCheck size={15} />
                Privacy
              </a>
              <a href="https://urban-notes.onrender.com/" className="flex items-center gap-2 transition-colors hover:opacity-80" style={{ color: "var(--landing-muted-strong)" }}>
                <Compass size={15} />
                Urban Notes
              </a>
              <a href="upi://pay?pa=8249688737@fam&pn=Urban%20Diaries" className="flex items-center gap-2 transition-colors hover:opacity-80" style={{ color: "var(--accent-coffee)" }}>
                <Coffee size={15} />
                Buy me a coffee
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-5 text-xs text-center" style={{ borderTop: "1px solid var(--glass-border)", color: "var(--landing-muted-strong)" }}>
          (c) 2026 Urban Diaries, Inc. - Made with care and love.
        </div>
      </footer>
    </div>
  );
}


