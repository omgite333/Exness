import { Link } from "react-router-dom";
import { ShieldOff, LogIn, Home } from "lucide-react";

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 relative overflow-hidden">

      {/* Glow - danger tint for auth error */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] bg-danger/5 rounded-full blur-3xl" />

      <div className="relative z-10 text-center max-w-sm">

        {/* Logo */}
        <div className="flex justify-center mb-10">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-base font-bold text-background">EX</div>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-danger-bg border border-danger/20 flex items-center justify-center">
            <ShieldOff className="text-danger" size={28} />
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-2 text-foreground">Access Denied</h2>
        <p className="text-foreground-secondary text-sm mb-8 leading-relaxed">
          You don&apos;t have permission to view this page. Please sign in with an authorized account.
        </p>

        <div className="flex justify-center gap-3">
          <Link
            to="/login"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-background font-semibold text-sm hover:bg-primary-hover transition-all"
          >
            <LogIn size={14} /> Sign In
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm text-foreground-secondary hover:bg-surface hover:text-foreground transition-all"
          >
            <Home size={14} /> Home
          </Link>
        </div>

        <p className="mt-10 text-xs text-foreground-muted font-mono">ERROR_CODE: 401_UNAUTHORIZED</p>
      </div>
    </div>
  );
}
