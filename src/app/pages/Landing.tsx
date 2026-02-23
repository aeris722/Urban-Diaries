import { motion } from "motion/react";
import { Link, useNavigate } from "react-router"; 
import { 
  ArrowRight, Lock, Smartphone, Shield, Github, 
  Bold, Italic, Underline, MapPin, Cloud, Globe, 
  Image as ImageIcon, Sun, Smile, Type, Zap, Meh, Heart, Frown
} from "lucide-react";
import { Button } from "../components/ui/button";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#faf9f6] text-[#44403c] font-sans selection:bg-[#fde68a]/50 selection:text-[#451a03] overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#faf9f6]/80 backdrop-blur-md border-b border-[#e7e5e4]/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-[#44403c] flex items-center justify-center text-[#faf9f6]">
               <span className="font-serif italic font-bold text-lg">O</span>
             </div>
             <span className="font-serif italic font-semibold text-xl tracking-tight">One Day.</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#78716c]">
            <a href="#features" className="hover:text-[#44403c] transition-colors">Features</a>
            <a href="#" className="hover:text-[#44403c] transition-colors">Github</a>
            <a href="#" className="hover:text-[#44403c] transition-colors">Docs</a>
            <a href="#" className="hover:text-[#44403c] transition-colors">About</a>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-[#78716c] hover:text-[#44403c] transition-colors hidden sm:block">
              Log in
            </button>
            <Button 
              onClick={() => navigate("/dashboard")}
              className="bg-[#44403c] hover:bg-[#292524] text-[#faf9f6] rounded-full px-6 transition-transform active:scale-95"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
         {/* Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#fcd34d]/10 rounded-full blur-[100px] mix-blend-multiply" />
          <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-[#fdba74]/10 rounded-full blur-[100px] mix-blend-multiply" />
          <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-[#d6d3d1]/10 rounded-full blur-[120px] mix-blend-multiply" />
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-serif italic font-medium text-[#292524] leading-[1.1] tracking-tight"
          >
            Your life, <br/> documented beautifully.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-[#78716c] max-w-xl mx-auto leading-relaxed"
          >
            Capture moments with rich text, location tags, and mood tracking. 
            Securely synced to your personal cloud.
          </motion.p>

          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
             className="flex items-center justify-center gap-4 pt-4"
          >
            <Button 
              onClick={() => navigate("/dashboard")}
              size="lg"
              className="bg-[#44403c] hover:bg-[#292524] text-[#faf9f6] rounded-full px-8 h-12 text-base shadow-lg shadow-[#44403c]/20"
            >
              Start Journaling
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="border-[#e7e5e4] text-[#78716c] hover:bg-[#f5f5f4] rounded-full px-8 h-12 text-base bg-white/50 backdrop-blur-sm"
            >
              See Features
            </Button>
          </motion.div>
        </div>

        {/* Dashboard Preview / Example Entry */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          className="mt-20 md:mt-32 max-w-4xl mx-auto relative"
        >
          <div className="relative rounded-[2rem] overflow-hidden border border-[#e7e5e4] shadow-2xl shadow-[#a8a29e]/15 bg-[#fcfcfc]">
            {/* Window Controls & Toolbar */}
            <div className="bg-[#faf9f6] border-b border-[#e7e5e4] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#e7e5e4]" />
                <div className="w-3 h-3 rounded-full bg-[#e7e5e4]" />
                <div className="w-3 h-3 rounded-full bg-[#e7e5e4]" />
              </div>
              
              {/* Toolbar Simulation */}
              <div className="hidden sm:flex items-center gap-4 text-[#a8a29e]">
                 <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-[#e7e5e4] shadow-sm">
                   <Bold size={14} className="text-[#44403c]" />
                   <Italic size={14} />
                   <Underline size={14} />
                 </div>
                 <div className="w-px h-4 bg-[#e7e5e4]" />
                 <div className="flex items-center gap-3">
                    <ImageIcon size={16} />
                    <MapPin size={16} />
                    <Smile size={16} />
                 </div>
              </div>

              <div className="text-xs font-mono text-[#a8a29e]">Saved</div>
            </div>
            
            {/* Real Example Content */}
            <div className="p-8 md:p-16 space-y-6 bg-[#fcfcfc] min-h-[400px]">
               {/* Metadata Chips */}
               <div className="flex flex-wrap gap-3 mb-8">
                 <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fffbeb] text-[#b45309] text-xs font-medium border border-[#fde68a]/50">
                    <Sun size={12} /> <span>Sunny 72°F</span>
                 </div>
                 <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ecfdf5] text-[#047857] text-xs font-medium border border-[#a7f3d0]/50">
                    <MapPin size={12} /> <span>The Daily Grind Cafe</span>
                 </div>
                 
                 {/* Sentiment Selector */}
                 <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-white border border-[#e7e5e4] shadow-sm">
                    <Smile size={14} className="text-[#a8a29e] hover:text-[#44403c] transition-colors cursor-pointer" />
                    <Zap size={14} className="text-[#a8a29e] hover:text-[#fbbf24] transition-colors cursor-pointer" />
                    <Meh size={14} className="text-[#a8a29e] hover:text-[#78716c] transition-colors cursor-pointer" />
                    <Heart size={14} className="text-[#a8a29e] hover:text-[#f43f5e] transition-colors cursor-pointer" />
                    <Frown size={14} className="text-[#a8a29e] hover:text-[#44403c] transition-colors cursor-pointer" />
                 </div>
               </div>

               <h2 className="text-3xl font-serif italic text-[#292524]">
                 October 24th.
               </h2>
               
               <div className="text-lg leading-loose text-[#44403c] font-serif space-y-6">
                 <p>
                   Today I'm very grateful because of <span className="font-semibold text-[#b45309] bg-[#fff7ed]">Emma</span>. We went to that small coffee shop on the corner—the one with the velvet armchairs and the smell of roasted hazelnuts.
                 </p>
                 <p>
                   The rain was pouring outside, tapping against the glass like a soft rhythm, but it felt so warm inside. 
                   <span className="italic text-[#78716c]"> She told me about her new project...</span>
                 </p>
               </div>
            </div>

            {/* Gradient Overlay for Fade Effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#fcfcfc] via-transparent to-transparent opacity-10 pointer-events-none" />
          </div>
          
          {/* Feature Badge: Google Drive */}
          <motion.div 
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-6 md:-right-12 top-1/3 bg-white p-4 rounded-2xl shadow-xl shadow-stone-200 border border-stone-100 rotate-6 hidden md:block"
          >
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                 <Cloud size={20} />
               </div>
               <div>
                 <div className="text-xs text-stone-500 font-medium uppercase tracking-wider">Backup</div>
                 <div className="text-sm font-semibold text-stone-700">Saved to Drive</div>
               </div>
             </div>
          </motion.div>

          {/* Feature Badge: Location/Atlas */}
          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -left-6 md:-left-12 bottom-1/3 bg-white p-4 rounded-2xl shadow-xl shadow-stone-200 border border-stone-100 -rotate-3 hidden md:block"
          >
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                 <Globe size={20} />
               </div>
               <div>
                 <div className="text-xs text-stone-500 font-medium uppercase tracking-wider">Atlas</div>
                 <div className="text-sm font-semibold text-stone-700">Location Tagged</div>
               </div>
             </div>
          </motion.div>

        </motion.div>
      </section>

      {/* Features Section - Deep Blue */}
      <section id="features" className="py-24 bg-[#1e293b] text-[#f8fafc] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#334155] rounded-full blur-[120px] opacity-20 pointer-events-none translate-x-1/3 -translate-y-1/3" />
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-serif italic text-[#f1f5f9]">More than just words.</h2>
            <p className="text-[#94a3b8] max-w-2xl mx-auto text-lg font-light">
              One Day gives your memories the context they deserve with modern tools.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard 
              icon={<Type className="w-6 h-6 text-amber-200" />}
              title="Rich Text Formatting"
              description="Express yourself fully with bold, italics, lists, and headers. Your journal should look as good as it feels."
            />
            <FeatureCard 
              icon={<Globe className="w-6 h-6 text-emerald-300" />}
              title="Atlas & Location"
              description="Remember exactly where you were. Automatically tag entries with location and view them on your personal atlas."
            />
            <FeatureCard 
              icon={<Cloud className="w-6 h-6 text-sky-300" />}
              title="Google Drive Backup"
              description="Never lose a memory. Your entries are automatically encrypted and backed up to your personal Google Drive."
            />
            <FeatureCard 
              icon={<Lock className="w-6 h-6 text-indigo-300" />}
              title="Private & Secure"
              description="Your data is yours alone. We use industry-standard encryption to ensure your thoughts stay private."
            />
            <FeatureCard 
              icon={<Smartphone className="w-6 h-6 text-rose-300" />}
              title="Cross-Device Sync"
              description="Start on your phone during your commute, finish on your desktop at home. Seamless synchronization."
            />
            <FeatureCard 
              icon={<Smile className="w-6 h-6 text-orange-300" />}
              title="Mood Tracking"
              description="Track your emotional journey over time with our beautiful, intuitive mood selector."
            />
          </div>
        </div>
      </section>

      <footer className="bg-[#faf9f6] py-12 border-t border-[#e7e5e4]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
             <span className="font-serif italic font-bold text-[#44403c] text-xl">One Day.</span>
          </div>
          <div className="text-sm text-[#a8a29e] font-medium">
            &copy; {new Date().getFullYear()} One Day Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-[#0f172a]/40 border border-[#334155]/50 hover:border-[#475569] hover:bg-[#1e293b]/60 transition-all duration-300 group">
      <div className="mb-6 p-4 bg-[#1e293b] w-fit rounded-2xl group-hover:bg-[#334155] transition-colors ring-1 ring-white/5">
        {icon}
      </div>
      <h3 className="text-xl font-medium mb-3 text-[#f1f5f9] tracking-tight">{title}</h3>
      <p className="text-[#94a3b8] leading-relaxed text-sm font-light">
        {description}
      </p>
    </div>
  );
}
