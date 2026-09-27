import { useState, useEffect, useRef } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useSessionStore } from "@/lib/session";
import { useQuotesFeed, useQuotesStore, getMidPrice } from "@/lib/quotesStore";
import { wsClient } from "@/lib/ws";
import CandlesChart, { TimeframeSwitcher } from "@/components/CandlesChart";
import QuotesTable from "@/components/QuotesTable";
import TradeForm from "@/components/TradeForm";
import OpenOrders from "@/components/OpenOrders";
import Logo from "@/components/Logo";
import { useUsdBalance } from "@/lib/balance";
import { useOpenOrdersStore } from "@/lib/openOrdersStore";
import { backendToAppSymbol } from "@/lib/symbols";
import { toDecimalNumber } from "@/lib/utils";
import { useTheme, toggleTheme } from "@/lib/theme";
import { useNavigate } from "react-router-dom";
import {
  LogOut, History, TrendingUp, Wifi, WifiOff, User, ChevronDown,
  Sun, Moon, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import api from "@/lib/api";
import { useAuthCheck } from "@/lib/useAuthCheck";
import { useGuestSession } from "@/lib/useGuestSession";

const WATCHLIST_SYMBOLS = ["BTCUSDC", "ETHUSDC", "SOLUSDC"];

export default function Trade() {
  useQuotesFeed();
  const queryClient = useQueryClient();
  const userId = useSessionStore((s) => s.userId);
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  const isGuest = useSessionStore((s) => s.isGuest);
  const navigate = useNavigate();
  const theme = useTheme();
  const [wsConnected, setWsConnected] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [watchlistOpen, setWatchlistOpen] = useState(true);
  const [positionsH, setPositionsH] = useState(176);

  const { isLoading: isAuthLoading, isSuccess: isAuthSuccess } = useAuthCheck();
  const { mutate: initGuestSession, isPending: isGuestLoading } = useGuestSession();
  const guestInitiated = useRef(false);

  useEffect(() => {
    if (!isAuthLoading && !isAuthSuccess && !isAuthenticated && !guestInitiated.current) {
      guestInitiated.current = true;
      initGuestSession();
    }
  }, [isAuthLoading, isAuthSuccess, isAuthenticated]);

  const { mutate: handleLogout } = useMutation({
    mutationFn: async () => { await api.post("/auth/logout"); },
    onSuccess: () => { queryClient.clear(); navigate("/"); },
  });

  useEffect(() => {
    if (userId) wsClient.identify(userId);
  }, [userId]);

  useEffect(() => {
    const unsubscribe = wsClient.subscribeUserState(() => {
      queryClient.invalidateQueries({ queryKey: ["openOrders"] });
      queryClient.refetchQueries({ queryKey: ["balance.usd"] });
    });
    return () => unsubscribe();
  }, [queryClient]);

  // WS connection indicator
  useEffect(() => {
    const interval = setInterval(() => {
      const ws = (wsClient as any).ws as WebSocket | null;
      setWsConnected(ws?.readyState === WebSocket.OPEN);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Live clock
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).toUpperCase();

  // Positions panel resize (drag the handle at its top edge)
  const dragRef = useRef<{ startY: number; startH: number } | null>(null);
  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startY: e.clientY, startH: positionsH };
    const onMove = (ev: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      setPositionsH(Math.min(480, Math.max(96, d.startH + (d.startY - ev.clientY))));
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const { quotes, selectedSymbol, setSelectedSymbol } = useQuotesStore();
  const q = quotes[selectedSymbol];
  const { data: usdBalance, isLoading: isBalanceLoading } = useUsdBalance();
  const openOrders = Object.values(useOpenOrdersStore((s) => s.ordersById));

  // All money math in decimal units (balance comes back as an integer + decimal places)
  const balanceDec = usdBalance ? toDecimalNumber(usdBalance.balance, usdBalance.decimal) : 0;
  const equityDec = (() => {
    let pnl = 0;
    let margin = 0;
    for (const o of openOrders) {
      const appSym = backendToAppSymbol(o.asset);
      const lq = quotes[appSym];
      if (!lq) continue;
      const decimal = lq.decimal;
      const current = o.type === "long" ? lq.bid_price : lq.ask_price;
      const diffInt = o.type === "long" ? current - o.openPrice : o.openPrice - current;
      pnl += toDecimalNumber(diffInt, decimal) * o.quantity;
      margin += toDecimalNumber(o.margin || 0, decimal);
    }
    return balanceDec + pnl + margin;
  })();

  const unrealizedPnl = equityDec - balanceDec;
  const pnlPositive = unrealizedPnl >= 0;

  if ((isAuthLoading || isGuestLoading) && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
          <p className="text-muted text-sm">Initializing trading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-ink text-fg font-sans flex flex-col overflow-hidden">

      {/* NAVBAR */}
      <nav className="h-14 shrink-0 px-4 flex items-center justify-between bg-panel border-b border-line z-30">

        {/* LEFT — logo + symbol info */}
        <div className="flex items-center gap-5">
          <button onClick={() => navigate("/")} aria-label="Exness home">
            <Logo iconClassName="w-7 h-7" textClassName="text-base" />
          </button>

          <div className="hidden md:flex items-center gap-1.5 h-14">
            <div className="h-full w-px bg-line" />
            <div className="flex items-center gap-3 px-4">
              <span className="text-xs font-bold tracking-wide">{selectedSymbol}</span>
              {q && (
                <>
                  <span className="text-sm font-bold tabular-nums">{getMidPrice(q).toFixed(q.decimal)}</span>
                  <div className="flex items-center gap-1 text-xs text-bull font-semibold">
                    <TrendingUp size={11} />
                    Live
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — clock, theme, equity, ws status, user */}
        <div className="flex items-center gap-2.5">

          {/* Clock */}
          <div className="hidden md:flex items-baseline gap-2 px-1">
            <span className="text-sm font-bold tabular-nums">{timeStr}</span>
            <span className="text-[10px] text-muted font-semibold tracking-wider">{dateStr}</span>
          </div>

          <div className="hidden md:block w-px h-5 bg-line" />

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2 rounded-lg text-muted hover:text-fg hover:bg-wash transition-colors"
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* WS indicator */}
          <div className={`hidden sm:flex items-center gap-1.5 text-xs font-medium ${wsConnected ? "text-bull" : "text-bear"}`}>
            {wsConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
            <span className="hidden md:block">{wsConnected ? "Live" : "Offline"}</span>
          </div>

          {/* Equity */}
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-wash border border-line">
            <div>
              <p className="text-[10px] text-muted uppercase tracking-wide leading-none mb-0.5">Equity</p>
              <p className="text-sm font-bold tabular-nums">
                {isBalanceLoading || !usdBalance ? (
                  <span className="text-muted/50">Loading...</span>
                ) : (
                  `$${equityDec.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                )}
              </p>
            </div>
            {!isBalanceLoading && usdBalance && unrealizedPnl !== 0 && (
              <div className={`text-xs tabular-nums font-bold ${pnlPositive ? "text-bull" : "text-bear"}`}>
                {pnlPositive ? "+" : ""}{unrealizedPnl.toFixed(2)}
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-wash transition-colors text-muted hover:text-fg"
            >
              <User size={14} />
              <ChevronDown size={12} className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-panel border border-line rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="px-3 py-2.5 border-b border-line">
                  <p className="text-xs text-muted">{isGuest ? "Guest Account" : "Authenticated"}</p>
                  <p className="text-xs text-fg/80 mt-0.5 truncate">{userId?.slice(0, 24)}...</p>
                </div>
                {!isGuest && (
                  <button
                    onClick={() => { setUserMenuOpen(false); navigate("/past-orders"); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-muted hover:text-fg hover:bg-wash transition-colors"
                  >
                    <History size={13} /> Trade History
                  </button>
                )}
                {isGuest ? (
                  <button
                    onClick={() => { setUserMenuOpen(false); navigate("/login"); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-gold hover:bg-wash transition-colors font-semibold"
                  >
                    Sign up for full access →
                  </button>
                ) : (
                  <button
                    onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-bear hover:bg-bear/10 transition-colors"
                  >
                    <LogOut size={13} /> Sign Out
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* MAIN LAYOUT */}
      <main className="flex flex-1 overflow-hidden">

        {/* LEFT — instruments (collapsible) */}
        {watchlistOpen ? (
          <aside className="w-60 shrink-0 bg-panel border-r border-line hidden lg:flex flex-col">
            <div className="px-4 h-11 border-b border-line flex items-center justify-between shrink-0">
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Watchlist</p>
              <button
                onClick={() => setWatchlistOpen(false)}
                title="Minimize watchlist"
                className="p-1.5 rounded-md text-muted hover:text-fg hover:bg-wash transition-colors"
              >
                <PanelLeftClose size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <QuotesTable />
            </div>
          </aside>
        ) : (
          <aside className="w-12 shrink-0 bg-panel border-r border-line hidden lg:flex flex-col items-center py-3 gap-1.5">
            <button
              onClick={() => setWatchlistOpen(true)}
              title="Expand watchlist"
              className="p-2 rounded-lg text-muted hover:text-fg hover:bg-wash transition-colors mb-1"
            >
              <PanelLeftOpen size={15} />
            </button>
            {WATCHLIST_SYMBOLS.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSymbol(s)}
                title={s}
                className={`w-8 h-8 rounded-lg text-[11px] font-extrabold transition-colors ${
                  selectedSymbol === s
                    ? "bg-brand text-black"
                    : "text-muted hover:text-fg hover:bg-wash"
                }`}
              >
                {s.replace("USDC", "").slice(0, 1)}
              </button>
            ))}
          </aside>
        )}

        {/* CENTER — chart + orders */}
        <section className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Chart topbar */}
          <div className="h-11 shrink-0 flex items-center justify-between px-4 bg-panel border-b border-line">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold tracking-wide">{selectedSymbol}</span>
              {q && (
                <div className="flex items-center gap-2">
                  <span className="text-xs tabular-nums font-bold">{getMidPrice(q).toFixed(q.decimal)}</span>
                  <span className="text-[10px] text-muted/50">|</span>
                  <span className="text-[10px] text-muted">Bid <span className="text-bear tabular-nums font-semibold">{toDecimalNumber(q.bid_price, q.decimal).toFixed(q.decimal)}</span></span>
                  <span className="text-[10px] text-muted">Ask <span className="text-bull tabular-nums font-semibold">{toDecimalNumber(q.ask_price, q.decimal).toFixed(q.decimal)}</span></span>
                </div>
              )}
            </div>
            <TimeframeSwitcher />
          </div>

          {/* Chart */}
          <div className="flex-1 bg-ink min-h-0">
            <CandlesChart symbol={selectedSymbol} decimal={q?.decimal} />
          </div>

          {/* Open positions (resizable) */}
          <div
            className="shrink-0 bg-panel border-t border-line overflow-hidden relative"
            style={{ height: positionsH }}
          >
            {/* drag handle */}
            <div
              onMouseDown={startResize}
              title="Drag to resize"
              className="absolute top-0 inset-x-0 h-2.5 cursor-row-resize z-10 flex items-center justify-center group"
            >
              <div className="w-10 h-1 rounded-full bg-line group-hover:bg-gold transition-colors" />
            </div>
            <div className="h-10 px-4 flex items-center justify-between border-b border-line">
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Open Positions</p>
              <span className="text-[10px] text-muted/70 tabular-nums">{openOrders.length} active</span>
            </div>
            <div className="overflow-auto h-[calc(100%-40px)]">
              <OpenOrders />
            </div>
          </div>
        </section>

        {/* RIGHT — trade form */}
        <aside className="w-72 shrink-0 bg-panel border-l border-line hidden lg:flex flex-col">
          <div className="px-4 h-11 border-b border-line flex items-center justify-between shrink-0">
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest">New Order</p>
            {isGuest && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand/10 text-gold border border-brand/25 font-bold">Demo</span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <TradeForm />
          </div>
        </aside>
      </main>

      {/* Click outside to close user menu */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}
    </div>
  );
}
