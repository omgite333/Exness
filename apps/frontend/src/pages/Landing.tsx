import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap, Shield, BarChart3, Clock, TrendingUp, TrendingDown, ChevronRight, Activity, Globe, Layers } from "lucide-react";
import { FaGithub, FaXTwitter } from "react-icons/fa6";

const TICKER_DATA = [
  { sym: "BTC/USD", price: "67,842.50", change: "+2.41%", up: true },
  { sym: "ETH/USD", price: "3,521.80", change: "+1.87%", up: true },
  { sym: "SOL/USD", price: "142.34", change: "-0.63%", up: false },
  { sym: "BTC/USD", price: "67,842.50", change: "+2.41%", up: true },
  { sym: "ETH/USD", price: "3,521.80", change: "+1.87%", up: true },
  { sym: "SOL/USD", price: "142.34", change: "-0.63%", up: false },
];

const STATS = [
  { label: "Daily Volume", value: "$2.4B+", icon: Activity },
  { label: "Active Traders", value: "180K+", icon: Globe },
  { label: "Avg Execution", value: "<1ms", icon: Zap },
  { label: "Uptime", value: "99.98%", icon: Layers },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Sub-millisecond Execution",
    desc: "In-memory matching engine processes orders in under 1ms. No queues, no delays.",
  },
  {
    icon: Shield,
    title: "Non-Custodial Security",
    desc: "Your funds stay in your wallet. JWT-based auth with zero personal data stored.",
  },
  {
    icon: BarChart3,
    title: "Professional Charts",
    desc: "Lightweight Charts with live candles, multiple timeframes, and real-time feeds.",
  },
  {
    icon: Clock,
    title: "24/7 Live Markets",
    desc: "Perpetual futures on BTC, ETH, SOL with up to 100x leverage.",
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="bg-background text-foreground font-sans overflow-x-hidden min-h-screen">

      {/* NAVBAR */}
      <nav className={`fixed w-full z-50 top-0 transition-all duration-300 ${scrolled ? "bg-background/95 backdrop-blur-xl border-b border-border" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center h-16">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-xs font-bold text-background">EX</div>
            <span className="font-semibold text-foreground tracking-tight text-lg">Exness</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-foreground-secondary">
            <button onClick={() => navigate("/docs")} className="hover:text-foreground transition-colors duration-200">Architecture</button>
            <button onClick={() => navigate("/trade")} className="hover:text-foreground transition-colors duration-200">Demo</button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/trade")}
              className="hidden sm:flex items-center gap-1.5 text-sm text-foreground-secondary hover:text-foreground transition-colors px-4 py-2 rounded-lg hover:bg-surface"
            >
              Try Demo
            </button>
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 text-sm font-medium bg-primary text-background px-5 py-2.5 rounded-lg hover:bg-primary-hover transition-colors"
            >
              Sign In <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* TICKER STRIP */}
      <div className="fixed top-16 w-full z-40 bg-background-secondary border-b border-border overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {TICKER_DATA.map((t, i) => (
            <div key={i} className="flex items-center gap-3 px-8 py-2.5 border-r border-border shrink-0">
              <span className="text-xs font-medium text-foreground-secondary">{t.sym}</span>
              <span className="text-xs font-mono text-foreground font-medium">{t.price}</span>
              <span className={`text-xs font-medium flex items-center gap-0.5 ${t.up ? "text-success" : "text-danger"}`}>
                {t.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {t.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* HERO */}
      <section className="pt-44 pb-24 max-w-6xl mx-auto px-6">
        <div className="max-w-3xl">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-soft" />
            Live markets - BTC / ETH / SOL Perpetuals
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
            Trade with{" "}
            <span className="gradient-text">precision</span>
            <br />and speed.
          </h1>

          <p className="text-foreground-secondary text-lg md:text-xl leading-relaxed max-w-xl mb-10">
            A professional-grade perpetuals exchange. Sub-millisecond execution,
            real-time WebSocket feeds, and up to 100x leverage.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate("/login")}
              className="group flex items-center gap-2 bg-primary text-background px-7 py-3.5 rounded-xl font-semibold text-sm hover:bg-primary-hover transition-all glow-primary"
            >
              Open Account
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => navigate("/trade")}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-medium border border-border text-foreground-secondary hover:bg-surface hover:border-border-light hover:text-foreground transition-all"
            >
              Try Demo - No signup needed
            </button>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <div key={i} className="card p-6 group hover:border-border-light transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <s.icon size={16} className="text-primary" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-foreground mb-1 font-mono">{s.value}</p>
              <p className="text-xs text-foreground-muted uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 border-t border-border bg-background-secondary">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16 text-center">
            <p className="text-xs text-primary uppercase tracking-widest mb-3 font-medium">Why Exness</p>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">Built for serious traders.</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="card p-6 group hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <f.icon size={22} className="text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-base">{f.title}</h3>
                <p className="text-foreground-secondary text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="relative rounded-2xl overflow-hidden bg-background-secondary border border-border p-12 md:p-16 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.08)_0%,_transparent_70%)]" />
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Start trading in 30 seconds.</h2>
              <p className="text-foreground-secondary mb-8 max-w-md mx-auto">No KYC, no paperwork. Enter your email, get a magic link, and you&apos;re live.</p>
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 bg-primary text-background px-8 py-3.5 rounded-xl font-semibold hover:bg-primary-hover transition-all text-sm glow-primary"
              >
                Create Free Account <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-10 bg-background-secondary">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-[10px] font-bold text-background">EX</div>
            <span className="text-sm font-medium text-foreground-secondary">Exness Trading</span>
          </div>
          <p className="text-xs text-foreground-muted">&copy; {new Date().getFullYear()} Exness. For demo purposes only.</p>
          <div className="flex items-center gap-4 text-foreground-muted">
            <button className="hover:text-foreground transition-colors p-2 rounded-lg hover:bg-surface"><FaGithub size={16} /></button>
            <button className="hover:text-foreground transition-colors p-2 rounded-lg hover:bg-surface"><FaXTwitter size={16} /></button>
            <button onClick={() => navigate("/docs")} className="text-xs hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-surface">Docs</button>
            <button onClick={() => navigate("/trade")} className="text-xs hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-surface">Trade</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
