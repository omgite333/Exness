import { useState, useEffect, useRef } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useSessionStore } from "@/lib/session";
import { useQuotesFeed, useQuotesStore, getMidPrice } from "@/lib/quotesStore";
import { wsClient } from "@/lib/ws";
import CandlesChart, { TimeframeSwitcher } from "@/components/CandlesChart";
import QuotesTable from "@/components/QuotesTable";
import TradeForm from "@/components/TradeForm";
import OpenOrders from "@/components/OpenOrders";
import { useUsdBalance } from "@/lib/balance";
import { useOpenOrdersStore } from "@/lib/openOrdersStore";
import { backendToAppSymbol } from "@/lib/symbols";
import { toDecimalNumber } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { LogOut, History, TrendingUp, Wifi, WifiOff, User, ChevronDown, Activity } from "lucide-react";
import api from "@/lib/api";
import { useAuthCheck } from "@/lib/useAuthCheck";
import { useGuestSession } from "@/lib/useGuestSession";

export default function Trade() {
  useQuotesFeed();
  const queryClient = useQueryClient();
  const userId = useSessionStore((s) => s.userId);
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  const isGuest = useSessionStore((s) => s.isGuest);
  const navigate = useNavigate();
  const [wsConnected, setWsConnected] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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

  const { quotes, selectedSymbol } = useQuotesStore();
  const q = quotes[selectedSymbol];
  const { data: usdBalance, isLoading: isBalanceLoading } = useUsdBalance();
  const openOrders = Object.values(useOpenOrdersStore((s) => s.ordersById));

  const equity = (() => {
    const base = usdBalance ? usdBalance.balance : 0;
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
    return base + pnl + margin;
  })();

  const equityNum = usdBalance ? toDecimalNumber(equity, usdBalance.decimal) : 0;
  const balanceNum = usdBalance ? usdBalance.balance : 0;
  const unrealizedPnl = equityNum - balanceNum;
  const pnlPositive = unrealizedPnl >= 0;

  if ((isAuthLoading || isGuestLoading) && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-foreground-muted text-sm">Initializing trading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background text-foreground font-sans flex flex-col overflow-hidden">

      {/* NAVBAR */}
      <nav className="h-14 shrink-0 px-4 flex items-center justify-between bg-background-secondary border-b border-border z-30">

        {/* LEFT - logo + symbol info */}
        <div className="flex items-center gap-5">
          <div 
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-xs font-bold text-background shrink-0">EX</div>
            <span className="font-semibold text-sm tracking-tight hidden sm:block">Exness</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 h-14">
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-3 px-4">
              <span className="text-sm font-medium text-foreground">{selectedSymbol}</span>
              {q && (
                <>
                  <span className="text-lg font-bold font-mono text-foreground">{getMidPrice(q).toFixed(q.decimal)}</span>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-success-bg">
                    <Activity size={12} className="text-success" />
                    <span className="text-xs font-medium text-success">Live</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT - equity + ws status + user */}
        <div className="flex items-center gap-3">

          {/* WS indicator */}
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${wsConnected ? "bg-success-bg text-success" : "bg-danger-bg text-danger"}`}>
            {wsConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
            <span className="hidden md:block">{wsConnected ? "Connected" : "Offline"}</span>
          </div>

          {/* Equity */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-surface border border-border">
            <div>
              <p className="text-[10px] text-foreground-muted uppercase tracking-wide leading-none mb-1">Equity</p>
              <p className="text-sm font-bold font-mono text-foreground">
                {isBalanceLoading || !usdBalance ? (
                  <span className="text-foreground-muted">Loading...</span>
                ) : (
                  `$${equityNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                )}
              </p>
            </div>
            {!isBalanceLoading && usdBalance && unrealizedPnl !== 0 && (
              <div className={`text-xs font-mono font-semibold px-2 py-1 rounded-md ${pnlPositive ? "bg-success-bg text-success" : "bg-danger-bg text-danger"}`}>
                {pnlPositive ? "+" : ""}{unrealizedPnl.toFixed(2)}
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-surface transition-colors text-foreground-secondary hover:text-foreground border border-transparent hover:border-border"
            >
              <User size={16} />
              <ChevronDown size={12} className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-xs text-foreground-muted">{isGuest ? "Guest Account" : "Authenticated"}</p>
                  <p className="text-xs text-foreground mt-0.5 truncate font-mono">{userId?.slice(0, 20)}...</p>
                </div>
                {!isGuest && (
                  <button
                    onClick={() => { setUserMenuOpen(false); navigate("/past-orders"); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-colors"
                  >
                    <History size={14} /> Trade History
                  </button>
                )}
                {isGuest ? (
                  <button
                    onClick={() => { setUserMenuOpen(false); navigate("/login"); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-primary hover:bg-primary/5 transition-colors"
                  >
                    Sign up for full access
                  </button>
                ) : (
                  <button
                    onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-danger hover:bg-danger-bg transition-colors"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* MAIN LAYOUT */}
      <main className="flex flex-1 overflow-hidden">

        {/* LEFT - instruments */}
        <aside className="w-60 shrink-0 bg-background-secondary border-r border-border hidden lg:flex flex-col">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-medium text-foreground-muted uppercase tracking-widest">Markets</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <QuotesTable />
          </div>
        </aside>

        {/* CENTER - chart + orders */}
        <section className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Chart topbar */}
          <div className="h-12 shrink-0 flex items-center justify-between px-4 bg-background-secondary border-b border-border">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-foreground">{selectedSymbol}</span>
              {q && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-semibold text-foreground">{getMidPrice(q).toFixed(q.decimal)}</span>
                  <div className="h-4 w-px bg-border" />
                  <span className="text-xs text-foreground-muted">Bid <span className="text-danger font-mono font-medium">{toDecimalNumber(q.bid_price, q.decimal).toFixed(q.decimal)}</span></span>
                  <span className="text-xs text-foreground-muted">Ask <span className="text-success font-mono font-medium">{toDecimalNumber(q.ask_price, q.decimal).toFixed(q.decimal)}</span></span>
                </div>
              )}
            </div>
            <TimeframeSwitcher />
          </div>

          {/* Chart */}
          <div className="flex-1 bg-background min-h-0">
            <CandlesChart symbol={selectedSymbol} decimal={q?.decimal} />
          </div>

          {/* Open positions */}
          <div className="h-48 shrink-0 bg-background-secondary border-t border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <p className="text-xs font-medium text-foreground-muted uppercase tracking-widest">Open Positions</p>
              <span className="text-xs text-foreground-muted font-mono">{openOrders.length} active</span>
            </div>
            <div className="overflow-auto h-[calc(100%-45px)]">
              <OpenOrders />
            </div>
          </div>
        </section>

        {/* RIGHT - trade form */}
        <aside className="w-80 shrink-0 bg-background-secondary border-l border-border hidden lg:flex flex-col">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <p className="text-xs font-medium text-foreground-muted uppercase tracking-widest">New Order</p>
            {isGuest && (
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">Demo</span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
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
