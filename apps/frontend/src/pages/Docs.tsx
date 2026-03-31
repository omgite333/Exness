import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Database, Radio, Globe, Cpu, Server, ArrowRight } from "lucide-react";

const COMPONENTS = [
  {
    icon: Radio,
    name: "Poller",
    tag: "Data Ingestion",
    desc: "Connects to Backpack Exchange via WebSocket, subscribes to BTC/ETH/SOL order book tickers, converts raw prices to 4-decimal integer format, and publishes to Redis every 100ms.",
    tech: ["WebSocket", "Backpack Exchange", "Redis Pub/Sub"],
  },
  {
    icon: Globe,
    name: "WebSocket Server",
    tag: "Real-time Layer",
    desc: "Fans out price updates from Redis to all connected browser clients. Handles user identity mapping so trade confirmations are pushed only to the right user.",
    tech: ["ws", "Redis Pub/Sub", "Pattern Subscribe"],
  },
  {
    icon: Cpu,
    name: "Engine",
    tag: "Matching Core",
    desc: "In-memory order book and balance ledger. Processes trade-open and trade-close in a single-threaded loop for deterministic execution. Snapshots to MongoDB every 5 seconds for crash recovery.",
    tech: ["Redis Streams", "MongoDB", "TypeScript"],
  },
  {
    icon: Server,
    name: "Backend",
    tag: "API Server",
    desc: "Express REST API that validates requests, routes to Redis via streams, and awaits engine responses with a 3.5s timeout. Handles JWT auth, guest sessions, and magic-link email flow.",
    tech: ["Express 5", "Redis Streams", "JWT", "Resend"],
  },
  {
    icon: Database,
    name: "Databases",
    tag: "Persistence",
    desc: "PostgreSQL (Neon serverless) stores user accounts and closed trade history via Drizzle ORM. MongoDB holds engine snapshots for warm restarts without data loss.",
    tech: ["PostgreSQL", "MongoDB", "Drizzle ORM", "Neon"],
  },
  {
    icon: Zap,
    name: "Frontend",
    tag: "Trading UI",
    desc: "React + Vite SPA with TanStack Query for server state, Zustand for local state, and Lightweight Charts for candlestick rendering. WebSocket connection provides sub-100ms price updates.",
    tech: ["React 19", "Vite", "TanStack Query", "Lightweight Charts"],
  },
];

const FLOW = [
  { label: "Backpack WS", sub: "Live prices" },
  { label: "Poller", sub: "Parse & publish" },
  { label: "Redis", sub: "Stream + PubSub" },
  { label: "Engine", sub: "Execute trades" },
  { label: "Backend", sub: "REST API" },
  { label: "Frontend", sub: "React UI" },
];

export default function Docs() {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-foreground font-sans min-h-screen">

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border h-14 flex items-center">
        <div className="max-w-5xl mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-xs font-bold text-background">EX</div>
              <span className="font-semibold text-sm tracking-tight">Exness</span>
            </button>
            <div className="w-px h-5 bg-border" />
            <span className="text-sm text-foreground-muted">Architecture Docs</span>
          </div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16 relative z-10">

        {/* HERO */}
        <section className="mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
            System Documentation
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-5">
            How it{" "}
            <span className="gradient-text">works</span>
          </h1>
          <p className="text-foreground-secondary text-base leading-relaxed max-w-2xl">
            A fully distributed trading system built for low-latency execution. Orders are processed in-memory with Redis as the messaging backbone between six independent services.
          </p>
        </section>

        {/* FLOW DIAGRAM */}
        <section className="mb-20">
          <h2 className="text-xs font-medium text-foreground-muted uppercase tracking-widest mb-6">Execution Flow</h2>
          <div className="card p-8 overflow-x-auto">
            <div className="flex items-center gap-0 min-w-max mx-auto">
              {FLOW.map((step, i) => (
                <div key={i} className="flex items-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="px-5 py-3 rounded-xl bg-background border border-border text-center min-w-[100px]">
                      <p className="text-sm font-semibold text-foreground whitespace-nowrap">{step.label}</p>
                      <p className="text-xs text-foreground-muted mt-0.5">{step.sub}</p>
                    </div>
                  </div>
                  {i < FLOW.length - 1 && (
                    <div className="flex items-center gap-0 mx-2">
                      <div className="w-8 h-px bg-border" />
                      <ArrowRight size={12} className="text-foreground-muted -ml-1" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMPONENTS */}
        <section className="mb-20">
          <h2 className="text-xs font-medium text-foreground-muted uppercase tracking-widest mb-6">System Components</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {COMPONENTS.map((c, i) => (
              <div
                key={i}
                className="card p-6 group hover:border-border-light transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <c.icon size={18} className="text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-base text-foreground">{c.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">{c.tag}</span>
                    </div>
                  </div>
                </div>
                <p className="text-foreground-secondary text-sm leading-relaxed mb-4">{c.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {c.tech.map((t) => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded-lg bg-surface border border-border text-foreground-muted">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* KEY FACTS */}
        <section>
          <h2 className="text-xs font-medium text-foreground-muted uppercase tracking-widest mb-6">Key Design Decisions</h2>
          <div className="card overflow-hidden">
            {[
              ["Integer prices", "All prices stored as integers with a decimal field (e.g. 870000 = 87.0000) to avoid floating point drift across the Redis boundary."],
              ["Single-threaded engine", "The engine processes one message at a time from a Redis consumer group, guaranteeing no race conditions without locks."],
              ["Response loop", "Backend uses a request ID map and a persistent Redis XREAD loop to match async engine responses to HTTP requests within 3.5s."],
              ["Guest sessions", "Unauthenticated users get a JWT-signed guest ID cookie and $50,000 virtual balance so they can trade immediately."],
              ["Crash recovery", "Engine snapshots full state to MongoDB every 5s. On restart it replays any Redis stream messages it missed while offline."],
            ].map(([title, desc], i) => (
              <div key={i} className="flex gap-4 px-6 py-5 border-b border-border last:border-b-0 hover:bg-surface-hover transition-colors">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
                  <p className="text-sm text-foreground-secondary leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="mt-16 flex flex-col sm:flex-row gap-3 items-start">
          <button
            onClick={() => navigate("/trade")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-background font-semibold text-sm hover:bg-primary-hover transition-all glow-primary"
          >
            Try the Platform <ArrowRight size={14} />
          </button>
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-sm text-foreground-secondary hover:bg-surface hover:text-foreground transition-all"
          >
            Create Account
          </button>
        </div>

      </main>
    </div>
  );
}
