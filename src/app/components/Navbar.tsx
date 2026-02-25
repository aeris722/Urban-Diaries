import { format } from "date-fns";
import { User, Menu, LogOut } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";

type NavbarProps = {
  onMenuClick?: () => void;
};

export function Navbar({ onMenuClick }: NavbarProps) {
  const currentDate = format(new Date(), "MMMM do");
  const { user, logOut } = useAuth();

  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full bg-[#fcfcfc]/80 backdrop-blur-md border-b border-[#e7e5e4]/50 shadow-sm"
    >
      <div className="w-full max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Left Side: App Name */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 rounded-full hover:bg-[#f5f5f4] transition-colors text-[#78716c]"
            aria-label="Toggle sessions panel"
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#44403c] tracking-tight font-serif italic">
            Urban Diaries
          </h1>
        </div>

        {/* Center: Date (hidden on mobile) */}
        <div className="hidden md:block text-[#a8a29e] font-sans text-xs uppercase tracking-[0.2em] font-medium opacity-80">
          {currentDate}
        </div>

        {/* Right Side: Profile */}
        <div className="flex items-center gap-4">
          <span className="hidden sm:block text-xs text-[#78716c]">{user?.email}</span>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="h-9 w-9 rounded-full bg-[#f5f5f4] border border-[#e7e5e4] flex items-center justify-center text-[#78716c] hover:bg-[#e7e5e4] transition-all"
            title={user?.email ?? "Profile"}
          >
            <User size={16} strokeWidth={1.5} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => logOut()}
            className="h-9 w-9 rounded-full bg-[#f5f5f4] border border-[#e7e5e4] flex items-center justify-center text-[#78716c] hover:bg-[#e7e5e4] transition-all"
            title="Sign out"
          >
            <LogOut size={16} strokeWidth={1.5} />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
