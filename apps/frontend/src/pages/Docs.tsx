import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Database, Radio, Globe, Cpu, Server, ArrowRight } from "lucide-react";
import Logo from "@/components/Logo";

const COMPONENTS = [
  {
    icon: Radio,
    name: "Poller",
    tag: "Data Ingestion",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/15",
    desc: "Connects to Backpack Exchange via WebSocket, subscribes to BTC/ETH/SOL order book tickers, converts raw prices to 4-decimal integer format, and publishes to Redis every 100ms.",
    tech: ["WebSocket", "Backpack Exchange", "Redis Pub/Sub"],
  },
  {
    icon: Globe,
    name: "WebSocket Server",
    tag: "Real-time Layer",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/15",
    desc: "Fans out price updates from Redis to all connected browser clients. Handles user identity mapping so trade confirmations are pushed only to the right user.",
    tech: ["ws", "Redis Pub/Sub", "Pattern Subscribe"],
  },
  {
    icon: Cpu,
    name: "Engine",
    tag: "Matching Core",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/15",
    desc: "In-memory order book and balance ledger. Processes trade-open and trade-close in a single-threaded loop for deterministic execution. Snapshots to MongoDB every 5 seconds for crash recovery.",
    tech: ["Redis Streams", "MongoDB", "TypeScript"],
  },
  {
    icon: Server,
    name: "Backend",
    tag: "API Server",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/15",
    desc: "Express REST API that validates requests, routes to Redis via streams, and awaits engine responses with a 3.5s timeout. Handles JWT auth, guest sessions, and magic-link email flow.",
    tech: ["Express 5", "Redis Streams", "JWT", "Resend"],
  },
  {
    icon: Database,
    name: "Databases",
    tag: "Persistence",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/15",
    desc: "PostgreSQL (Neon serverless) stores user accounts and closed trade history via Drizzle ORM. MongoDB holds engine snapshots for warm restarts without data loss.",
    tech: ["PostgreSQL", "MongoDB", "Drizzle ORM", "Neon"],
  },
  {
    icon: Zap,
    name: "Frontend",
    tag: "Trading UI",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/15",
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
    <div className="bg-ink text-white font-sans min-h-screen">

      {/* Subtle grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-ink/90 backdrop-blur-xl border-b border-white/10 h-14 flex items-center">
        <div className="max-w-5xl mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2.5"
            >
              <Logo iconClassName="w-6 h-6" textClassName="text-sm" />
            </button>
            <div className="w-px h-4 bg-white/10" />
            <span className="text-xs text-muted">Architecture Docs</span>
          </div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-white transition-colors"
          >
            <ArrowLeft size={13} /> Back
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16 relative z-10">

        {/* HERO */}
        <section className="mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/10 border border-brand/25 text-brand text-xs font-semibold mb-6">
            System Documentation
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-5">
            How it{" "}
            <span className="text-brand">works</span>
          </h1>
          <p className="text-muted text-base leading-relaxed max-w-2xl">
            A fully distributed trading system built for low-latency execution. Orders are processed in-memory with Redis as the messaging backbone between six independent services.
          </p>
        </section>

        {/* FLOW DIAGRAM */}
        <section className="mb-20">
          <h2 className="text-xs font-bold text-muted uppercase tracking-widest mb-6">Execution Flow</h2>
          <div className="bg-panel border border-white/5 rounded-2xl p-8 overflow-x-auto">
            <div className="flex items-center gap-0 min-w-max mx-auto">
              {FLOW.map((step, i) => (
                <div key={i} className="flex items-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="px-4 py-2.5 rounded-xl bg-ink border border-white/10 text-center min-w-[90px]">
                      <p className="text-xs font-semibold text-white whitespace-nowrap">{step.label}</p>
                      <p className="text-[10px] text-muted/70 mt-0.5">{step.sub}</p>
                    </div>
                  </div>
                  {i < FLOW.length - 1 && (
                    <div className="flex items-center gap-0 mx-1">
                      <div className="w-6 h-px bg-white/10" />
                      <ArrowRight size={10} className="text-gray-700 -ml-0.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMPONENTS */}
        <section className="mb-20">
          <h2 className="text-xs font-bold text-muted uppercase tracking-widest mb-6">System Components</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {COMPONENTS.map((c, i) => (
              <div
                key={i}
                className={`group p-5 rounded-2xl bg-[#0d1117] border border-white/5 hover:border-white/10 transition-all`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-9 h-9 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center shrink-0`}>
                    <c.icon size={16} className={c.color} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-sm text-white">{c.name}</h3>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full ${c.bg} ${c.color} border ${c.border} font-medium`}>{c.tag}</span>
                    </div>
                  </div>
                </div>
                <p className="text-muted text-xs leading-relaxed mb-4">{c.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {c.tech.map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/5 text-muted">
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
          <h2 className="text-xs font-bold text-muted uppercase tracking-widest mb-6">Key Design Decisions</h2>
          <div className="space-y-px rounded-2xl overflow-hidden border border-white/5">
            {[
              ["Integer prices", "All prices stored as integers with a decimal field (e.g. 870000 = 87.0000) to avoid floating point drift across the Redis boundary."],
              ["Single-threaded engine", "The engine processes one message at a time from a Redis consumer group, guaranteeing no race conditions without locks."],
              ["Response loop", "Backend uses a request ID map and a persistent Redis XREAD loop to match async engine responses to HTTP requests within 3.5s."],
              ["Guest sessions", "Unauthenticated users get a JWT-signed guest ID cookie and $50,000 virtual balance so they can trade immediately."],
              ["Crash recovery", "Engine snapshots full state to MongoDB every 5s. On restart it replays any Redis stream messages it missed while offline."],
            ].map(([title, desc], i) => (
              <div key={i} className="flex gap-4 bg-panel px-5 py-4">
                <div className="w-1.5 h-1.5 rounded-full bg-brand/70 mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white mb-0.5">{title}</p>
                  <p className="text-xs text-muted leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="mt-16 flex flex-col sm:flex-row gap-3 items-start">
          <button
            onClick={() => navigate("/trade")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand text-black font-bold text-sm hover:bg-brand-deep transition-all"
          >
            Try the Platform <ArrowRight size={14} />
          </button>
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-all"
          >
            Create Account
          </button>
        </div>

      </main>
    </div>
  );
}
