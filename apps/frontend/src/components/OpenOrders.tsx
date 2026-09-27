import { useMemo } from "react";
import {
  useOpenOrdersStore,
  useFetchOpenOrders,
  useCloseOrder,
} from "@/lib/openOrdersStore";
import { useQuotesStore } from "@/lib/quotesStore";
import { toDecimalNumber } from "@/lib/utils";
import { X } from "lucide-react";

function appToDisplaySymbol(backendSymbol: string): string {
  return backendSymbol.replace("_USDC_PERP", "USDC").replaceAll("_", "");
}

export default function OpenOrders() {
  const { isLoading, isError } = useFetchOpenOrders();
  const { mutate: closeOrder } = useCloseOrder();
  const orders = Object.values(useOpenOrdersStore((s) => s.ordersById));
  const quotes = useQuotesStore((s) => s.quotes);

  const rows = useMemo(() => {
    return orders.map((o) => {
      const appSym = appToDisplaySymbol(o.asset);
      const q = quotes[appSym];
      const decimal = q?.decimal ?? 4;
      const current = q
        ? o.type === "long"
          ? q.bid_price
          : q.ask_price
        : o.openPrice;
      const diffInt =
        o.type === "long" ? current - o.openPrice : o.openPrice - current;
      const pnlDec = toDecimalNumber(diffInt, decimal) * o.quantity;
      return { ...o, appSym, decimal, current, pnlDec };
    });
  }, [orders, quotes]);

  return (
    <div className="w-full">
      {/* Mobile card view */}
      <div className="lg:hidden flex flex-col gap-1.5 p-1.5">
        {isLoading && (
          <div className="text-center text-xs p-4 text-muted font-semibold">Syncing orders...</div>
        )}
        {isError && (
          <div className="text-center text-xs p-4 text-bear font-semibold">Couldn't sync orders — retrying...</div>
        )}
        {!isLoading && !isError && rows.length === 0 && (
          <EmptyState />
        )}
        {!isLoading && !isError && rows.map((r) => (
          <div key={r.id} className="border border-white/10 bg-panel-2 rounded-xl p-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-1 rounded-md font-extrabold uppercase ${
                  r.type === "long" ? "bg-bull/15 text-bull" : "bg-bear/15 text-bear"
                }`}>{r.type}</span>
                <span className="font-bold text-sm">{r.appSym}</span>
              </div>
              <button
                onClick={() => closeOrder(r.id)}
                className="p-1.5 rounded-lg hover:bg-bear hover:text-white text-muted transition-colors"
                title="Close Position"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-between mt-2 text-xs tabular-nums text-muted">
              <span>Entry: {toDecimalNumber(r.openPrice, r.decimal)}</span>
              <span>Mark: {toDecimalNumber(r.current, r.decimal)}</span>
            </div>
            <div className="flex justify-between mt-1 text-xs tabular-nums">
              <span className="text-muted">{r.quantity} × {r.leverage}x</span>
              <span className={`font-bold ${r.pnlDec >= 0 ? "text-bull" : "text-bear"}`}>
                {r.pnlDec > 0 ? "+" : ""}{r.pnlDec.toFixed(r.decimal)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table view */}
      <table className="hidden lg:table w-full border-collapse text-left">
        <thead className="bg-panel sticky top-0 border-b border-white/10">
          <tr>
            <th className="px-4 py-2.5 text-[10px] font-bold uppercase text-muted tracking-widest">Asset</th>
            <th className="px-4 py-2.5 text-[10px] font-bold uppercase text-muted tracking-widest text-center">Side</th>
            <th className="px-4 py-2.5 text-[10px] font-bold uppercase text-muted tracking-widest text-right">Entry</th>
            <th className="px-4 py-2.5 text-[10px] font-bold uppercase text-muted tracking-widest text-right">Mark</th>
            <th className="px-4 py-2.5 text-[10px] font-bold uppercase text-muted tracking-widest text-right">Qty</th>
            <th className="px-4 py-2.5 text-[10px] font-bold uppercase text-muted tracking-widest text-right">Lev</th>
            <th className="px-4 py-2.5 text-[10px] font-bold uppercase text-muted tracking-widest text-right">PnL</th>
            <th className="px-4 py-2.5 text-[10px] font-bold uppercase text-muted tracking-widest text-right">Action</th>
          </tr>
        </thead>
        <tbody className="text-sm tabular-nums">
          {isLoading ? (
            <tr>
              <td className="p-8 text-center text-xs text-muted font-semibold" colSpan={8}>
                Syncing orders...
              </td>
            </tr>
          ) : isError ? (
            <tr>
              <td className="p-8 text-center text-xs text-bear font-semibold" colSpan={8}>
                Couldn't sync orders — retrying...
              </td>
            </tr>
          ) : null}

          {!isLoading &&
            !isError &&
            rows.map((r) => (
            <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
              <td className="px-4 py-2.5 font-bold">{r.appSym}</td>
              <td className="px-4 py-2.5 text-center">
                <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase ${
                  r.type === "long" ? "bg-bull/15 text-bull" : "bg-bear/15 text-bear"
                }`}>
                  {r.type}
                </span>
              </td>
              <td className="px-4 py-2.5 text-right text-white/70">
                {toDecimalNumber(r.openPrice, r.decimal)}
              </td>
              <td className="px-4 py-2.5 text-right text-white/70">
                {toDecimalNumber(r.current, r.decimal)}
              </td>
              <td className="px-4 py-2.5 text-right font-semibold">{r.quantity}</td>
              <td className="px-4 py-2.5 text-right text-muted">{r.leverage}x</td>
              <td
                className={`px-4 py-2.5 text-right font-bold ${
                  r.pnlDec >= 0 ? "text-bull" : "text-bear"
                }`}
              >
                {r.pnlDec > 0 ? "+" : ""}{(r.pnlDec).toFixed(r.decimal)}
              </td>
              <td className="px-4 py-2.5 text-right">
                <button
                  onClick={() => closeOrder(r.id)}
                  className="p-1.5 rounded-lg hover:bg-bear hover:text-white text-muted transition-colors"
                  title="Close Position"
                >
                  <X className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
          {!isLoading && !isError && rows.length === 0 ? (
            <tr>
              <td className="p-10" colSpan={8}>
                <EmptyState />
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-6">
      <p className="text-xs text-muted font-semibold">No open positions</p>
      <p className="text-[11px] text-muted/60 mt-1">Your live positions will appear here.</p>
    </div>
  );
}
