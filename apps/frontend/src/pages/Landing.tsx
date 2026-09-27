import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import {
  Activity, ArrowRight, ArrowUpDown, ArrowUpRight, Check, FlaskConical,
  History, Menu, Moon, Plus, ShieldCheck, Sun, Wallet, X, Zap,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Theme: self-contained. Toggles a `light` class on the page root and */
/* redefines the palette through scoped CSS variables, so it works no  */
/* matter how the rest of the app wires its theme. It also mirrors the */
/* choice to documentElement + localStorage as a best effort so other  */
/* pages stay in sync when they use the same mechanism.                */
/* ------------------------------------------------------------------ */

const THEME_KEY = "exness-theme";

function applyTheme(isLight: boolean) {
  document.documentElement.setAttribute("data-theme", isLight ? "light" : "dark");
  try {
    localStorage.setItem(THEME_KEY, isLight ? "light" : "dark");
  } catch {
    /* storage unavailable: theme still applies for this visit */
  }
}

function useLandingTheme() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY);
    const initial =
      stored !== null
        ? stored === "light"
        : document.documentElement.getAttribute("data-theme") === "light";
    setLight(initial);
    applyTheme(initial);
  }, []);

  const toggle = () => {
    setLight((prev) => {
      const next = !prev;
      applyTheme(next);
      return next;
    });
  };

  return { light, toggle };
}

function ThemeToggle({ light, toggle, className = "" }: {
  light: boolean;
  toggle: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={toggle}
      aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
      className={`w-10 h-10 rounded-full border border-line flex items-center justify-center text-muted hover:text-fg hover:bg-wash transition-colors ${className}`}
    >
      {light ? <Moon size={17} /> : <Sun size={17} />}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 text-[11px] font-extrabold uppercase tracking-[0.22em] text-gold">
      <span className="inline-block w-7 h-[2px] bg-gold" />
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Terminal mock: a static replica of the real trading screen          */
/* ------------------------------------------------------------------ */

function MiniChart() {
  const candles = useMemo(() => {
    let seed = 11;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    let price = 50;
    const arr: { o: number; h: number; l: number; c: number }[] = [];
    for (let i = 0; i < 46; i++) {
      const o = price;
      const drift = Math.sin(i / 5.2) * 2.6 + (rand() - 0.47) * 5.2;
      const c = o + drift;
      const h = Math.max(o, c) + rand() * 2.2;
      const l = Math.min(o, c) - rand() * 2.2;
      arr.push({ o, h, l, c });
      price = c;
    }
    return arr;
  }, []);

  const W = 560;
  const H = 240;
  const PAD = 10;
  const min = Math.min(...candles.map((k) => k.l));
  const max = Math.max(...candles.map((k) => k.h));
  const y = (v: number) => PAD + (1 - (v - min) / (max - min)) * (H - PAD * 2);
  const slot = W / candles.length;
  const bw = Math.max(2.5, slot * 0.55);
  const last = candles[candles.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={0}
          x2={W}
          y1={H * t}
          y2={H * t}
          stroke="currentColor"
          className="text-line"
          strokeOpacity={0.6}
          strokeDasharray="3 5"
        />
      ))}
      {candles.map((k, i) => {
        const up = k.c >= k.o;
        const col = up ? "#26A69A" : "#EF5350";
        const x = i * slot + slot / 2;
        return (
          <g key={i}>
            <line x1={x} x2={x} y1={y(k.h)} y2={y(k.l)} stroke={col} strokeWidth={1.2} />
            <rect
              x={x - bw / 2}
              y={y(Math.max(k.o, k.c))}
              width={bw}
              height={Math.max(1.6, Math.abs(y(k.o) - y(k.c)))}
              fill={col}
              rx={0.8}
            />
          </g>
        );
      })}
      <line
        x1={0}
        x2={W}
        y1={y(last.c)}
        y2={y(last.c)}
        stroke="#FFDE02"
        strokeWidth={1}
        strokeDasharray="5 4"
        strokeOpacity={0.85}
      />
    </svg>
  );
}

const MOCK_WATCH = [
  { s: "BTC", b: "84,597.90", a: "84,598.00" },
  { s: "ETH", b: "2,697.800", a: "2,697.810" },
  { s: "SOL", b: "122.6200", a: "122.6300" },
];

function TerminalMock() {
  return (
    <div className="relative">
      <div className="terminal-card rounded-2xl border border-line bg-panel overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
        {/* window chrome */}
        <div className="flex items-center gap-1.5 px-4 h-11 border-b border-line bg-panel-2/70">
          <span className="w-2.5 h-2.5 rounded-full bg-bear/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-gold/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-bull/70" />
          <span className="ml-3 text-[10px] font-extrabold tracking-[0.18em] text-muted">
            EXNESS WEB TERMINAL
          </span>
          <span className="ml-auto flex items-center gap-1.5 text-[10px] font-bold text-bull">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bull opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-bull" />
            </span>
            LIVE
          </span>
        </div>

        <div className="grid grid-cols-[86px_1fr_108px] md:grid-cols-[128px_1fr_152px]">
          {/* watchlist */}
          <div className="border-r border-line p-2 space-y-1">
            {MOCK_WATCH.map((w, i) => (
              <div
                key={w.s}
                className={`rounded-lg px-2 py-2 ${i === 0 ? "bg-brand/[0.08] border border-brand/40" : "border border-transparent"}`}
              >
                <p className="text-[11px] font-extrabold leading-none">
                  {w.s}
                  <span className="ml-1 text-[8px] font-semibold text-muted">/ USDC</span>
                </p>
                <p className="mt-1.5 text-[9px] tabular-nums text-muted leading-tight">
                  {w.b}
                  <br />
                  {w.a}
                </p>
              </div>
            ))}
          </div>

          {/* chart */}
          <div className="relative h-[240px] md:h-[300px] p-2">
            <MiniChart />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-bull px-1.5 py-0.5 text-[9px] font-extrabold tabular-nums text-black">
              84,597.95
            </div>
          </div>

          {/* ticket */}
          <div className="border-l border-line p-2.5 flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-panel-2 border border-line p-1">
              <span className="rounded-md bg-bull py-1.5 text-center text-[10px] font-extrabold text-black">
                LONG
              </span>
              <span className="rounded-md py-1.5 text-center text-[10px] font-extrabold text-muted">
                SHORT
              </span>
            </div>
            <div className="rounded-lg bg-panel-2 border border-line px-2 py-1.5">
              <p className="text-[8px] font-bold uppercase tracking-widest text-muted">Qty</p>
              <p className="text-xs font-extrabold tabular-nums">0.50</p>
            </div>
            <div className="rounded-lg bg-panel-2 border border-line px-2 py-1.5">
              <p className="text-[8px] font-bold uppercase tracking-widest text-muted">Lev</p>
              <p className="text-xs font-extrabold tabular-nums">1:100</p>
            </div>
            <div className="mt-auto rounded-lg bg-brand py-2 text-center text-[11px] font-extrabold text-black">
              Place order
            </div>
          </div>
        </div>
      </div>

      {/* filled-order toast */}
      <div className="absolute -bottom-6 left-4 right-4 sm:left-auto sm:right-[-14px] sm:w-[270px] rounded-xl border border-bull/40 bg-panel px-4 py-3 shadow-2xl flex items-center gap-3">
        <span className="w-9 h-9 shrink-0 rounded-full bg-bull/15 text-bull flex items-center justify-center">
          <Check size={16} strokeWidth={3} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-extrabold tracking-wide">BUY 0.50 BTCUSD</p>
          <p className="text-[11px] text-muted tabular-nums">Filled @ 84,597.95 · demo</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const CONDITIONS = [
  {
    n: "01",
    icon: Zap,
    title: "Instant simulated fills",
    desc: "Market and limit orders execute against the live price feed immediately. Practice entries and exits exactly like the real thing.",
  },
  {
    n: "02",
    icon: ArrowUpDown,
    title: "Long or short, with leverage",
    desc: "Take either side of BTC, ETH and SOL. USDC margin, perpetual contracts, no expiry dates to worry about.",
  },
  {
    n: "03",
    icon: History,
    title: "Every trade recorded",
    desc: "Open positions, past fills and full history in one place. Review what worked, what didn't, and why.",
  },
  {
    n: "04",
    icon: Activity,
    title: "Charts that keep up",
    desc: "Candlestick charts stream live prices so you can read price action as it happens, not after the fact.",
  },
];

const MARKETS = [
  { m: "BTCUSDC", name: "Bitcoin vs USDC", type: "Perpetual", margin: "USDC" },
  { m: "ETHUSDC", name: "Ethereum vs USDC", type: "Perpetual", margin: "USDC" },
  { m: "SOLUSDC", name: "Solana vs USDC", type: "Perpetual", margin: "USDC" },
];

const FAQS = [
  {
    q: "Is this real trading?",
    a: "No. This is a demo perpetuals terminal. Your balance is virtual USDC, prices mirror live markets, and no real money is ever involved.",
  },
  {
    q: "What can I trade?",
    a: "Perpetual futures on BTC, ETH and SOL, all quoted and margined in USDC. You can go long or short with leverage.",
  },
  {
    q: "How do I start?",
    a: "Sign in and you get a virtual balance right away. Open the terminal, pick a market, set your size and place your first trade. It takes under a minute.",
  },
  {
    q: "Where does the price data come from?",
    a: "Prices stream from a live market feed, so the charts you practice on move like the real market.",
  },
  {
    q: "Can I lose real money here?",
    a: "No. That's the point of the demo. Try strategies, make mistakes and learn, all with zero financial risk.",
  },
];

const NAV_LINKS = [
  { label: "Terminal", href: "#terminal" },
  { label: "Markets", href: "#markets" },
  { label: "FAQ", href: "#faq" },
];

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { light, toggle } = useLandingTheme();

  return (
    <div className={`landing-page min-h-screen bg-ink text-fg font-sans antialiased overflow-x-clip${light ? " light" : ""}`}>
      <style>{`
        .landing-page.light {
          --color-ink: #FFFFFF;
          --color-panel: #F4F5F7;
          --color-panel-2: #E8EAEE;
          --color-fg: #101418;
          --color-muted: #5F6368;
          --color-line: #DFE2E7;
          --color-wash: #EBEDF1;
        }
        .landing-page.light .text-gold { color: #8a6d00; }
        .landing-page.light .bg-gold { background-color: #8a6d00; }
        .landing-page.light .terminal-card { box-shadow: 0 30px 60px -20px rgba(15, 20, 25, 0.18); }
      `}</style>

      {/* ================= NAV ================= */}
      <header className="fixed top-0 inset-x-0 z-50 bg-ink/90 backdrop-blur-md border-b border-line">
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" aria-label="Exness home">
            <Logo />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-semibold text-muted hover:text-fg transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle light={light} toggle={toggle} />
            <Link
              to="/login"
              className="text-sm font-bold px-4 py-2.5 rounded-full text-fg hover:bg-wash transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/trade"
              className="text-sm font-extrabold px-5 py-2.5 rounded-full bg-brand text-black hover:bg-brand-deep transition-colors"
            >
              Launch terminal
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle light={light} toggle={toggle} />
            <button
              className="p-2 text-fg"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-line bg-ink px-5 py-4 space-y-1">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block py-2.5 text-sm font-semibold text-muted hover:text-fg"
              >
                {l.label}
              </a>
            ))}
            <div className="flex gap-3 pt-3">
              <Link
                to="/login"
                className="flex-1 text-center text-sm font-bold px-4 py-2.5 rounded-full border border-line"
              >
                Sign in
              </Link>
              <Link
                to="/trade"
                className="flex-1 text-center text-sm font-extrabold px-4 py-2.5 rounded-full bg-brand text-black"
              >
                Launch terminal
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ================= HERO ================= */}
      <section className="relative pt-32 md:pt-40 pb-16 md:pb-24">
        {/* faint grid texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "radial-gradient(ellipse 90% 70% at 50% 0%, black 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 90% 70% at 50% 0%, black 30%, transparent 75%)",
          }}
        />
        {/* faint yellow glow */}
        <div className="absolute -top-40 right-[-10%] w-[560px] h-[560px] rounded-full bg-brand/[0.05] blur-[140px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-5 md:px-8 grid lg:grid-cols-[1.02fr_0.98fr] gap-14 lg:gap-10 items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.22em] text-muted border border-line rounded-full px-4 py-2 bg-panel/60">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              Free demo · No real funds
            </p>

            <h1 className="mt-7 text-[44px] leading-[1.02] md:text-[68px] font-extrabold tracking-[-0.03em]">
              Upgrade the way
              <br />
              you{" "}
              <span className="relative inline-block">
                trade.
                <span className="absolute left-0 -bottom-1 md:-bottom-2 h-[5px] md:h-[7px] w-full bg-brand rounded-full" />
              </span>
            </h1>

            <p className="mt-7 text-base md:text-lg text-muted leading-relaxed max-w-xl">
              A demo perpetuals terminal for BTC, ETH and SOL. Live charts,
              instant simulated fills and USDC margin, with zero real money
              on the line.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/trade"
                className="inline-flex items-center gap-2 bg-brand text-black font-extrabold text-sm px-8 py-4 rounded-full hover:bg-brand-deep transition-colors"
              >
                Launch terminal <ArrowRight size={16} strokeWidth={2.5} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 font-bold text-sm px-8 py-4 rounded-full border border-line hover:bg-wash transition-colors"
              >
                Sign in
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-2 text-[12px] font-semibold text-muted">
              <span className="flex items-center gap-1.5">
                <Check size={13} className="text-gold" strokeWidth={3} /> BTC · ETH · SOL perps
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={13} className="text-gold" strokeWidth={3} /> USDC margined
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={13} className="text-gold" strokeWidth={3} /> Virtual funds only
              </span>
            </div>
          </div>

          <div className="animate-rise">
            <TerminalMock />
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="border-y border-line bg-panel/40">
        <div className="max-w-7xl mx-auto px-5 md:px-8 grid grid-cols-2 md:grid-cols-4 md:divide-x divide-line">
          {[
            { v: "03", l: "Perpetual markets" },
            { v: "USDC", l: "Margin currency" },
            { v: "24/7", l: "Markets always open" },
            { v: "$0", l: "Cost to get started" },
          ].map((s) => (
            <div key={s.l} className="py-8 md:py-10 px-2 md:px-8">
              <p className="text-3xl md:text-4xl font-extrabold tracking-tight tabular-nums">
                {s.v}
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                {s.l}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= TERMINAL ================= */}
      <section id="terminal" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-5 md:px-8 grid lg:grid-cols-[1fr_1.35fr] gap-12 lg:gap-20">
          <div className="lg:sticky lg:top-28 self-start">
            <Eyebrow>The terminal</Eyebrow>
            <h2 className="mt-5 text-3xl md:text-[44px] leading-[1.08] font-extrabold tracking-[-0.02em]">
              A real terminal, without the risk.
            </h2>
            <p className="mt-5 text-muted leading-relaxed max-w-md">
              Everything works like a live trading screen: real price action,
              real order mechanics, real P/L. The only thing missing is the
              part where you lose actual money.
            </p>
            <Link
              to="/trade"
              className="mt-7 inline-flex items-center gap-1.5 text-sm font-extrabold text-gold hover:gap-3 transition-all"
            >
              Open the terminal <ArrowUpRight size={16} strokeWidth={2.5} />
            </Link>
          </div>

          <div>
            {CONDITIONS.map((c, i) => (
              <div
                key={c.n}
                className={`flex gap-6 md:gap-8 py-8 ${i !== CONDITIONS.length - 1 ? "border-b border-line" : ""}`}
              >
                <span className="text-sm font-extrabold tabular-nums text-muted/60 pt-1">
                  {c.n}
                </span>
                <span className="w-11 h-11 shrink-0 rounded-xl border border-line bg-panel flex items-center justify-center text-gold">
                  <c.icon size={19} strokeWidth={2} />
                </span>
                <div>
                  <h3 className="text-lg md:text-xl font-extrabold tracking-tight">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-sm md:text-[15px] text-muted leading-relaxed max-w-lg">
                    {c.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= MARKETS ================= */}
      <section id="markets" className="py-24 md:py-32 border-t border-line bg-panel/40">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <Eyebrow>Markets</Eyebrow>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
            <h2 className="text-3xl md:text-[44px] leading-[1.08] font-extrabold tracking-[-0.02em] max-w-xl">
              Three markets. Zero noise.
            </h2>
            <p className="text-muted text-sm md:text-[15px] max-w-sm leading-relaxed">
              Perpetual futures on the three assets that matter most, all
              margined in USDC.
            </p>
          </div>

          <div className="mt-12 overflow-x-auto rounded-2xl border border-line">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-line bg-panel-2/60">
                  {["Market", "Type", "Margin"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.18em] text-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MARKETS.map((r) => (
                  <tr key={r.m} className="border-b border-line last:border-0 hover:bg-wash transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-extrabold tracking-tight">{r.m}</p>
                      <p className="text-xs text-muted mt-0.5">{r.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full border border-line bg-panel-2 text-muted">
                        {r.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 tabular-nums text-muted font-semibold">{r.margin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[11px] text-muted/70 leading-relaxed max-w-3xl">
            Demo prices stream from a live market feed and are for practice only.
          </p>
        </div>
      </section>

      {/* ================= INSIDE THE APP ================= */}
      <section className="py-24 md:py-32 border-t border-line">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <Eyebrow>Inside the app</Eyebrow>
          <h2 className="mt-5 text-3xl md:text-[44px] leading-[1.08] font-extrabold tracking-[-0.02em] max-w-2xl">
            Everything on one screen.
          </h2>

          <div className="mt-12 grid md:grid-cols-3 gap-px bg-line rounded-2xl overflow-hidden border border-line">
            {[
              {
                icon: Activity,
                t: "Live terminal",
                d: "Watchlist, candlestick charts and the order ticket side by side. No tab-hopping.",
              },
              {
                icon: Wallet,
                t: "Positions",
                d: "Open trades with live unrealized P/L, always one glance away.",
              },
              {
                icon: History,
                t: "History",
                d: "Every fill logged. Filter past trades and learn from them.",
              },
            ].map((p) => (
              <div key={p.t} className="bg-ink p-8 md:p-10">
                <span className="w-12 h-12 rounded-2xl bg-brand/[0.08] border border-brand/30 text-gold flex items-center justify-center">
                  <p.icon size={22} strokeWidth={1.8} />
                </span>
                <h3 className="mt-6 text-xl font-extrabold tracking-tight">{p.t}</h3>
                <p className="mt-3 text-sm text-muted leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 grid sm:grid-cols-3 gap-8">
            {[
              { icon: FlaskConical, t: "Virtual funds", d: "Your balance is demo USDC. Experiment freely, size up, try the wild ideas." },
              { icon: Zap, t: "Instant execution", d: "No waiting rooms. Orders fill against the live price feed." },
              { icon: ShieldCheck, t: "No real risk", d: "Blow up the account? It's practice. That's the whole point." },
            ].map((s) => (
              <div key={s.t} className="flex gap-4">
                <s.icon size={20} className="text-gold shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <p className="font-extrabold text-[15px]">{s.t}</p>
                  <p className="mt-1.5 text-sm text-muted leading-relaxed">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section id="faq" className="py-24 md:py-32 border-t border-line bg-panel/40">
        <div className="max-w-3xl mx-auto px-5 md:px-8">
          <div className="text-center">
            <div className="flex justify-center">
              <Eyebrow>FAQ</Eyebrow>
            </div>
            <h2 className="mt-5 text-3xl md:text-[44px] font-extrabold tracking-[-0.02em]">
              Questions, answered.
            </h2>
          </div>

          <div className="mt-12">
            {FAQS.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={f.q} className="border-b border-line">
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="w-full flex items-center justify-between gap-6 py-6 text-left"
                  >
                    <span className="font-extrabold text-[15px] md:text-base tracking-tight">
                      {f.q}
                    </span>
                    <span
                      className={`shrink-0 w-8 h-8 rounded-full border border-line flex items-center justify-center transition-transform duration-200 ${open ? "rotate-45 bg-brand border-brand text-black" : "text-muted"}`}
                    >
                      <Plus size={15} strokeWidth={2.5} />
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-200 ${open ? "grid-rows-[1fr] pb-6 opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                  >
                    <p className="overflow-hidden text-sm md:text-[15px] text-muted leading-relaxed">
                      {f.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="rounded-[28px] bg-brand text-black px-8 py-14 md:p-16 lg:p-20 grid lg:grid-cols-[1.3fr_1fr] gap-10 items-center overflow-hidden relative">
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.07]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, black 1px, transparent 1px), linear-gradient(to bottom, black 1px, transparent 1px)",
                backgroundSize: "56px 56px",
              }}
            />
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-[-0.02em] leading-[1.05]">
                Start practicing today.
              </h2>
              <p className="mt-4 text-black/70 font-medium max-w-lg leading-relaxed">
                Launch the terminal and place your first demo trade in under a
                minute. Free forever, no deposit, no risk.
              </p>
            </div>
            <div className="relative flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-stretch lg:justify-self-end w-full lg:w-64">
              <Link
                to="/trade"
                className="inline-flex justify-center items-center gap-2 bg-black text-white font-extrabold text-sm px-8 py-4 rounded-full hover:bg-black/80 transition-colors"
              >
                Launch terminal <ArrowRight size={16} strokeWidth={2.5} />
              </Link>
              <Link
                to="/login"
                className="inline-flex justify-center items-center gap-2 font-extrabold text-sm px-8 py-4 rounded-full border-2 border-black/70 hover:bg-black hover:text-white transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-line bg-panel">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-14">
          <div className="flex flex-wrap items-start justify-between gap-10">
            <div>
              <Logo />
              <p className="mt-4 text-sm text-muted leading-relaxed max-w-xs">
                A demo perpetuals trading terminal. Practice with virtual USDC
                on live market data.
              </p>
            </div>
            <div className="flex gap-16">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted">
                  Product
                </p>
                <ul className="mt-4 space-y-2.5">
                  <li>
                    <Link to="/trade" className="text-sm text-fg/80 hover:text-fg transition-colors">
                      Terminal
                    </Link>
                  </li>
                  <li>
                    <Link to="/login" className="text-sm text-fg/80 hover:text-fg transition-colors">
                      Sign in
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted">
                  Learn
                </p>
                <ul className="mt-4 space-y-2.5">
                  <li>
                    <a href="#markets" className="text-sm text-fg/80 hover:text-fg transition-colors">
                      Markets
                    </a>
                  </li>
                  <li>
                    <a href="#faq" className="text-sm text-fg/80 hover:text-fg transition-colors">
                      FAQ
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-line space-y-4">
            <p className="text-[11px] leading-relaxed text-muted/80 max-w-4xl">
              <span className="font-extrabold text-muted">Note:</span> this is a
              demo environment. All funds are virtual and no real assets are
              traded. Nothing here is financial advice.
            </p>
            <p className="text-[11px] text-muted/60">
              © 2026 Exness. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
