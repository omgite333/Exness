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
import { LogOut } from "lucide-react";
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
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    onSuccess: () => {
      queryClient.clear();
      navigate("/");
    }
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

      // Prices from engine are raw integers — convert the diff to decimal before multiplying by quantity
      const diffInt = o.type === "long"
        ? current - o.openPrice
        : o.openPrice - current;
      pnl += toDecimalNumber(diffInt, decimal) * o.quantity;

      // Margin stored by engine is also a raw integer — convert before adding
      margin += toDecimalNumber(o.margin || 0, decimal);
    }

    return base + pnl + margin;
  })();

  if ((isAuthLoading || isGuestLoading) && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-gray-400 text-lg font-medium">
        Initializing trading session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white font-sans flex flex-col">

      {/* NAVBAR */}
      <nav className="h-16 px-6 flex items-center justify-between bg-[#0f172a] border-b border-gray-800">

        {/* LOGO */}
        <div className="flex items-center gap-3 cursor-pointer"
         onClick={() => navigate("/")} >  
          <img src="/exness-logo.png" className="h-6" />
          <span className="text-lg font-semibold tracking-wide text-yellow-400">
            Exness
          </span>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-6">

          <div className="text-right">
            <p className="text-xs text-gray-400">Equity</p>
            <p className="text-lg font-semibold">
              ${isBalanceLoading || !usdBalance
                ? "..."
                : toDecimalNumber(equity, usdBalance.decimal).toLocaleString()}
            </p>
          </div>

          {isGuest ? (
            <button
              onClick={() => navigate("/login")}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-1.5 rounded-lg text-sm font-medium hover:opacity-90 transition"
            >
              Sign Up
            </button>
          ) : (
            <button onClick={() => handleLogout()}>
              <LogOut className="w-5 h-5 text-red-400 hover:text-red-500" />
            </button>
          )}
        </div>
      </nav>

      <main className="flex flex-1 overflow-hidden">

        {/* LEFT PANEL */}
        <aside className="w-72 bg-[#0f172a] border-r border-gray-800 hidden lg:flex flex-col">
          <div className="p-4 text-sm text-gray-400 font-medium">
            Instruments
          </div>
          <div className="flex-1 overflow-y-auto">
            <QuotesTable />
          </div>
        </aside>

        {/* CENTER */}
        <section className="flex-1 flex flex-col">

          {/* TOP BAR */}
          <div className="flex justify-between items-center px-5 py-3 bg-[#0f172a] border-b border-gray-800">

            <div>
              <p className="text-sm text-gray-400">{selectedSymbol}</p>
              <p className="text-2xl font-bold">
                {q && getMidPrice(q).toFixed(q.decimal)}
              </p>
            </div>

            <TimeframeSwitcher />
          </div>

          {/* CHART */}
          <div className="flex-1 bg-[#020617]">
            <CandlesChart symbol={selectedSymbol} decimal={q?.decimal} />
          </div>

          {/* ORDERS */}
          <div className="h-52 bg-[#0f172a] border-t border-gray-800">
            <div className="p-3 text-sm text-gray-400 font-medium">
              Open Positions
            </div>
            <OpenOrders />
          </div>
        </section>

        {/* RIGHT PANEL */}
        <aside className="w-96 bg-[#0f172a] border-l border-gray-800 hidden lg:flex flex-col">

          <div className="p-4 border-b border-gray-800 text-lg font-semibold">
            Execute Trade
          </div>

          <div className="p-4 flex-1 overflow-y-auto">
            <TradeForm />
          </div>
        </aside>

      </main>
    </div>
  );
}