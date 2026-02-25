import { motion } from "motion/react";
import { Cloud, Globe, Lock, Smile, Smartphone, Type, Instagram, Mail, Github, UserRound, ShieldCheck, FileText, Compass, Coffee } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";

export default function Landing() {
  const navigate = useNavigate();
  const { user, logInWithGoogle, logInWithEmailPassword, authError, clearAuthError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handlePasswordLogin = async () => {
    clearAuthError();
    setLocalError(null);
    setIsSubmitting(true);
    try {
      await logInWithEmailPassword(email, password);
      navigate("/dashboard");
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "Email login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#faf9f6] text-[#44403c] font-sans selection:bg-[#fde68a]/50 selection:text-[#451a03] overflow-x-hidden">
      <nav className="fixed top-0 w-full z-50 bg-[#faf9f6]/80 backdrop-blur-md border-b border-[#e7e5e4]/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#44403c] flex items-center justify-center text-[#faf9f6]">
              <span className="font-serif italic font-bold text-lg">U</span>
            </div>
            <span className="font-serif italic font-semibold text-xl tracking-tight">Urban Diaries.</span>
          </div>

          <Button
            onClick={() => (user ? navigate("/dashboard") : handleGoogleAuth())}
            className="bg-[#44403c] hover:bg-[#292524] text-[#faf9f6] rounded-full px-6"
            disabled={isSubmitting}
          >
            {user ? "Dashboard" : "Continue with Google"}
          </Button>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 md:pt-44 md:pb-24 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#fcd34d]/10 rounded-full blur-[100px] mix-blend-multiply" />
          <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-[#fdba74]/10 rounded-full blur-[100px] mix-blend-multiply" />
        </div>

        <div className="max-w-5xl mx-auto grid gap-8 md:grid-cols-[1.2fr_0.8fr] items-start">
          <div className="space-y-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-5xl md:text-7xl font-serif italic font-medium text-[#292524] leading-[1.1] tracking-tight"
            >
              Your life, <br /> documented beautifully.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-lg md:text-xl text-[#78716c] max-w-xl leading-relaxed"
            >
              Rich journaling, multi-session writing, and cloud sync built for fast daily use.
            </motion.p>
          </div>

          {!user ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="rounded-3xl border border-[#e7e5e4] bg-white/80 p-5 backdrop-blur"
            >
              <h3 className="font-serif italic text-xl text-[#292524]">Login</h3>
              <p className="mt-1 text-xs text-[#78716c]">
                Signup is Google-only. Email login requires a verified email.
              </p>

              <div className="mt-4 space-y-3">
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="yourname@gmail.com"
                  className="rounded-xl border-[#d6d3d1]"
                />
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password"
                  className="rounded-xl border-[#d6d3d1]"
                />
              </div>

              <div className="mt-4 grid gap-2">
                <Button
                  onClick={handlePasswordLogin}
                  disabled={isSubmitting || !email || !password}
                  className="w-full rounded-xl bg-[#44403c] text-[#faf9f6] hover:bg-[#292524]"
                >
                  Login
                </Button>
                <Button
                  variant="outline"
                  onClick={handleGoogleAuth}
                  disabled={isSubmitting}
                  className="w-full rounded-xl"
                >
                  Sign up / Login with Google
                </Button>
              </div>

              {localError || authError ? <p className="mt-3 text-xs text-red-600">{localError ?? authError}</p> : null}
            </motion.div>
          ) : null}
        </div>
      </section>

      <section id="features" className="py-24 bg-[#1e293b] text-[#f8fafc] relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-serif italic text-[#f1f5f9]">More than just words.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard icon={<Type className="w-6 h-6 text-amber-200" />} title="Rich Text" description="Format and embed images without losing writing flow." />
            <FeatureCard icon={<Globe className="w-6 h-6 text-emerald-300" />} title="Live Context" description="Location-aware weather metadata and activity tracking." />
            <FeatureCard icon={<Cloud className="w-6 h-6 text-sky-300" />} title="Autosave" description="Debounced autosave and quick session switching." />
            <FeatureCard icon={<Lock className="w-6 h-6 text-indigo-300" />} title="Secure Auth" description="Google signup and restricted Gmail login." />
            <FeatureCard icon={<Smartphone className="w-6 h-6 text-rose-300" />} title="Responsive" description="Built to feel smooth on phones and low-end devices." />
            <FeatureCard icon={<Smile className="w-6 h-6 text-orange-300" />} title="Mood Tracking" description="Track mood and activity with each writing session." />
          </div>
        </div>
      </section>

      <footer className="bg-[#faf9f6]/80 text-[#44403c] backdrop-blur-md border-t border-[#e7e5e4]/50">
        <div className="max-w-6xl mx-auto px-6 py-12 grid gap-10 md:grid-cols-5">
          <div>
            <h4 className="text-lg font-semibold text-[#292524]">Contact Developer</h4>
            <div className="mt-4 space-y-3 text-sm">
              <a
                href="https://www.instagram.com/aasiiishh"
                className="inline-flex items-center gap-2 hover:text-[#292524] transition-colors"
                aria-label="Instagram profile"
              >
                <Instagram size={16} />
                <span>aasiiishh</span>
              </a>
              {/* TODO: Replace "#" with your Instagram profile URL */}

              <a
                href="mailto:swapnajitef3@gmail.com"
                className="flex items-center gap-2 hover:text-[#292524] transition-colors"
                aria-label="Primary Gmail contact"
              >
                <Mail size={16} />
                <span>swapnajitef3@gmail.com</span>
              </a>
              {/* TODO: Replace "#" and email text with your primary Gmail */}

              <a
                href="https://github.com/aeris722/Urban-Diaries"
                className="flex items-center gap-2 hover:text-[#292524] transition-colors"
                aria-label="Secondary Gmail contact"
                >
              </a>
              {/* TODO: Replace "#" and email text with your secondary Gmail */}
            </div>
          </div>

          <div>
            <h4 className="text-base font-semibold text-[#292524]">Resources</h4>
            <div className="mt-4 text-sm space-y-3">
              <a href="https://github.com/aeris722/Urban-Diaries" className="inline-flex items-center gap-2 hover:text-[#292524] transition-colors">
                <Github size={16} />
                <span>Github</span>
              </a>
              {/* TODO: Replace "#" with your GitHub repo URL */}
            </div>
          </div>

          <div>
            <h4 className="text-base font-semibold text-[#292524]">About me</h4>
            <div className="mt-4 text-sm space-y-3">
              <a href="#" className="inline-flex items-center gap-2 hover:text-[#292524] transition-colors">
                <UserRound size={16} />
                <span>About me.</span>
              </a>
              {/* TODO: Replace "#" with your about page/profile URL */}
            </div>
          </div>

          <div>
            <h4 className="text-base font-semibold text-[#292524]">Terms & privacy</h4>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              <a href="#" className="flex items-center gap-2 hover:text-[#292524] transition-colors">
                <FileText size={16} />
                <span>Terms</span>
              </a>
              {/* TODO: Replace "#" with your Terms link */}

              <a href="#" className="flex items-center gap-2 hover:text-[#292524] transition-colors">
                <ShieldCheck size={16} />
                <span>Privacy</span>
              </a>
              {/* TODO: Replace "#" with your Policy link */}
            </div>
          </div>

          <div>
            <h4 className="text-base font-semibold text-[#292524]">Explore more</h4>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              <a href="urban-notes.onrender.com/" className="inline-flex items-center gap-2 hover:text-[#292524] transition-colors">
                <Compass size={16} />
                <span>Urban Notes</span>
              </a>
              {/* TODO: Replace "#" with your Explore More link */}

              <a
                href="upi://pay?pa=8249688737@fam&pn=Urban%20Diaries"
                className="inline-flex items-center gap-2 hover:text-[#292524] transition-colors"
              >
                <Coffee size={16} />
                <span>Buy me a coffee</span>
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-6 border-t border-[#e7e5e4]/70 text-sm text-center">
          <p>&copy; 2026 Urban Diaries, Inc.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-[#0f172a]/40 border border-[#334155]/50 hover:border-[#475569] hover:bg-[#1e293b]/60 transition-all duration-300 group">
      <div className="mb-6 p-4 bg-[#1e293b] w-fit rounded-2xl group-hover:bg-[#334155] transition-colors ring-1 ring-white/5">{icon}</div>
      <h3 className="text-xl font-medium mb-3 text-[#f1f5f9] tracking-tight">{title}</h3>
      <p className="text-[#94a3b8] leading-relaxed text-sm font-light">{description}</p>
    </div>
  );
}



