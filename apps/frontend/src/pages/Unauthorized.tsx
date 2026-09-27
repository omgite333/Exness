import { Link } from "react-router-dom";
import { ShieldOff, LogIn, Home } from "lucide-react";
import Logo from "@/components/Logo";

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-ink text-white flex flex-col items-center justify-center px-6 relative overflow-hidden">

      {/* Subtle grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Glow - red tint for auth error */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] bg-red-500/6 rounded-full blur-3xl" />

      <div className="relative z-10 text-center max-w-sm">

        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Logo iconClassName="w-10 h-10" textClassName="text-xl" />
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/15 flex items-center justify-center">
            <ShieldOff className="text-red-400" size={28} />
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted text-sm mb-8 leading-relaxed">
          You don't have permission to view this page. Please sign in with an authorized account.
        </p>

        <div className="flex justify-center gap-3">
          <Link
            to="/login"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand text-black font-bold text-sm hover:bg-brand-deep transition-all"
          >
            <LogIn size={14} /> Sign In
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-all"
          >
            <Home size={14} /> Home
          </Link>
        </div>

        <p className="mt-10 text-[10px] text-muted/50 tabular-nums">ERROR_CODE: 401_UNAUTHORIZED</p>
      </div>
    </div>
  );
}
