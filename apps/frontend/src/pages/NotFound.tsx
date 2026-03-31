import { Link } from "react-router-dom";
import { Home, LineChart } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 relative overflow-hidden">

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/5 rounded-full blur-3xl" />

      <div className="relative z-10 text-center max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-10">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-base font-bold text-background">EX</div>
        </div>

        {/* Error code */}
        <div className="text-[120px] font-bold gradient-text leading-none mb-4">404</div>

        <h2 className="text-xl font-semibold mb-2 text-foreground">Page not found</h2>
        <p className="text-foreground-secondary text-sm mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex justify-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-background font-semibold text-sm hover:bg-primary-hover transition-all"
          >
            <Home size={14} /> Home
          </Link>
          <Link
            to="/trade"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm text-foreground-secondary hover:bg-surface hover:text-foreground transition-all"
          >
            <LineChart size={14} /> Trade
          </Link>
        </div>

        <p className="mt-10 text-xs text-foreground-muted font-mono">ERROR_CODE: 404_NOT_FOUND</p>
      </div>
    </div>
  );
}
