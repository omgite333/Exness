import { useMemo } from "react";
import {
  useOpenOrdersStore,
  useFetchOpenOrders,
  useCloseOrder,
} from "@/lib/openOrdersStore";
import { useQuotesStore } from "@/lib/quotesStore";
import { toDecimalNumber } from "@/lib/utils";
import { X, TrendingUp, TrendingDown, Loader2 } from "lucide-react";

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
      <div className="lg:hidden flex flex-col gap-2 p-3">
        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-foreground-muted text-xs p-8">
            <Loader2 size={14} className="animate-spin" />
            Syncing orders...
          </div>
        )}
        {isError && (
          <div className="text-center text-xs p-8 text-danger">
            Sync error. Retrying...
          </div>
        )}
        {!isLoading && !isError && rows.length === 0 && (
          <div className="text-center text-xs p-12 text-foreground-muted">
            No open positions
          </div>
        )}
        {!isLoading && !isError && rows.map((r) => (
          <div key={r.id} className="card p-4 animate-fade-in">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-md font-semibold flex items-center gap-1 ${
                  r.type === "long" ? "bg-success-bg text-success" : "bg-danger-bg text-danger"
                }`}>
                  {r.type === "long" ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {r.type.toUpperCase()}
                </span>
                <span className="font-semibold text-sm text-foreground">{r.appSym.replace("USDC", "")}</span>
              </div>
              <button
                onClick={() => closeOrder(r.id)}
                className="p-1.5 rounded-lg hover:bg-danger-bg text-foreground-muted hover:text-danger transition-colors"
                title="Close Position"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-foreground-muted">Entry</span>
                <p className="font-mono font-medium text-foreground">{toDecimalNumber(r.openPrice, r.decimal)}</p>
              </div>
              <div>
                <span className="text-foreground-muted">Mark</span>
                <p className="font-mono font-medium text-foreground">{toDecimalNumber(r.current, r.decimal)}</p>
              </div>
              <div>
                <span className="text-foreground-muted">Size</span>
                <p className="font-mono font-medium text-foreground">{r.quantity} x {r.leverage}x</p>
              </div>
              <div>
                <span className="text-foreground-muted">PnL</span>
                <p className={`font-mono font-bold ${r.pnlDec >= 0 ? "text-success" : "text-danger"}`}>
                  {r.pnlDec > 0 ? "+" : ""}{r.pnlDec.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table view */}
      <table className="hidden lg:table w-full border-collapse text-left">
        <thead className="bg-background-tertiary sticky top-0">
          <tr>
            <th className="px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wide">Asset</th>
            <th className="px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wide text-center">Side</th>
            <th className="px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wide text-right">Entry</th>
            <th className="px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wide text-right">Mark</th>
            <th className="px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wide text-right">Size</th>
            <th className="px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wide text-right">Leverage</th>
            <th className="px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wide text-right">PnL</th>
            <th className="px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wide text-right">Action</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {isLoading ? (
            <tr>
              <td className="p-8 text-center text-foreground-muted" colSpan={8}>
                <div className="flex items-center justify-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  Syncing orders...
                </div>
              </td>
            </tr>
          ) : isError ? (
            <tr>
              <td className="p-8 text-center text-danger" colSpan={8}>
                Sync error. Retrying...
              </td>
            </tr>
          ) : null}

          {!isLoading &&
            !isError &&
            rows.map((r) => (
            <tr key={r.id} className="border-b border-border hover:bg-surface-hover transition-colors animate-fade-in">
              <td className="px-4 py-3 font-semibold text-foreground">{r.appSym.replace("USDC", "")}</td>
              <td className="px-4 py-3 text-center">
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md font-semibold ${
                  r.type === "long" ? "bg-success-bg text-success" : "bg-danger-bg text-danger"
                }`}>
                  {r.type === "long" ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {r.type.toUpperCase()}
                </span>
              </td>
              <td className="px-4 py-3 text-right font-mono text-foreground-secondary">
                {toDecimalNumber(r.openPrice, r.decimal)}
              </td>
              <td className="px-4 py-3 text-right font-mono text-foreground">
                {toDecimalNumber(r.current, r.decimal)}
              </td>
              <td className="px-4 py-3 text-right font-mono font-semibold text-foreground">{r.quantity}</td>
              <td className="px-4 py-3 text-right font-mono text-foreground-muted">{r.leverage}x</td>
              <td className={`px-4 py-3 text-right font-mono font-bold ${r.pnlDec >= 0 ? "text-success" : "text-danger"}`}>
                {r.pnlDec > 0 ? "+" : ""}{r.pnlDec.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => closeOrder(r.id)}
                  className="p-1.5 rounded-lg hover:bg-danger-bg text-foreground-muted hover:text-danger transition-colors"
                  title="Close Position"
                >
                  <X className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
          {!isLoading && !isError && rows.length === 0 ? (
            <tr>
              <td className="p-12 text-center text-foreground-muted" colSpan={8}>
                No open positions
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
