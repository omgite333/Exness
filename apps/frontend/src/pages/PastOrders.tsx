import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, Loader2, AlertCircle, InboxIcon } from "lucide-react";
import { toDecimalNumber } from "@/lib/utils";

interface ClosedTrade {
  id: string;
  asset: string;
  type: string;
  quantity: number;
  openPrice: number;
  closePrice: number;
  pnl: number;
  decimal: number;
  liquidated: boolean;
  createdAt: string;
}

function formatAsset(raw: string) {
  return raw.replace("_USDC_PERP", "/USDC").replaceAll("_", "");
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " at " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function PastOrders() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["closedOrders"],
    queryFn: async () => {
      const res = await api.get("/trade/closed");
      return res.data.trades as ClosedTrade[];
    },
  });

  const totalPnl = data?.reduce((sum, t) => sum + toDecimalNumber(t.pnl, t.decimal), 0) ?? 0;
  const wins = data?.filter((t) => t.pnl > 0).length ?? 0;
  const losses = data?.filter((t) => t.pnl < 0).length ?? 0;
  const winRate = data?.length ? Math.round((wins / data.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">

      {/* NAV */}
      <nav className="h-14 shrink-0 flex items-center justify-between px-6 bg-background-secondary border-b border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-xs font-bold text-background">EX</div>
            <span className="font-semibold text-sm tracking-tight">Exness</span>
          </div>
          <div className="w-px h-5 bg-border" />
          <Link
            to="/trade"
            className="flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} /> Back to Trading
          </Link>
        </div>
        <p className="text-sm text-foreground-muted">Trade History</p>
      </nav>

      <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1 text-foreground">Trade History</h1>
          <p className="text-foreground-secondary text-sm">All closed and liquidated positions</p>
        </div>

        {/* SUMMARY CARDS */}
        {data && data.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Total Trades",
                value: data.length.toString(),
                sub: `${wins}W / ${losses}L`,
              },
              {
                label: "Win Rate",
                value: `${winRate}%`,
                sub: "of closed trades",
                positive: winRate >= 50,
              },
              {
                label: "Total P&L",
                value: `${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(2)}`,
                sub: "all positions",
                colored: true,
                positive: totalPnl >= 0,
              },
              {
                label: "Liquidated",
                value: data.filter((t) => t.liquidated).length.toString(),
                sub: "forced closes",
              },
            ].map((card, i) => (
              <div key={i} className="card p-5">
                <p className="text-xs text-foreground-muted uppercase tracking-wide mb-2">{card.label}</p>
                <p className={`text-2xl font-bold font-mono ${card.colored ? (card.positive ? "text-success" : "text-danger") : "text-foreground"}`}>
                  {card.value}
                </p>
                <p className="text-xs text-foreground-muted mt-1">{card.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* TABLE */}
        <div className="card overflow-hidden">

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="text-foreground-muted animate-spin" size={20} />
              <p className="text-sm text-foreground-muted">Loading trade history...</p>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <AlertCircle className="text-danger" size={20} />
              <p className="text-sm text-foreground-muted">Failed to load trades</p>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && data?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <InboxIcon className="text-foreground-muted" size={28} />
              <p className="text-sm text-foreground-muted">No closed trades yet</p>
              <Link to="/trade" className="text-sm text-primary hover:text-primary-hover transition-colors">
                Start trading
              </Link>
            </div>
          )}

          {/* Table */}
          {!isLoading && !isError && data && data.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-background-tertiary">
                    {["Date", "Asset", "Side", "Size", "Entry", "Exit", "P&L", "Status"].map((h, i) => (
                      <th
                        key={h}
                        className={`px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wide ${i >= 3 ? "text-right" : "text-left"} ${i === 7 ? "text-center" : ""}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((trade, idx) => {
                    const pnlReal = toDecimalNumber(trade.pnl, trade.decimal);
                    const isProfit = pnlReal > 0;
                    const isLong = trade.type === "long";
                    return (
                      <tr
                        key={trade.id}
                        className={`border-b border-border last:border-b-0 hover:bg-surface-hover transition-colors`}
                      >
                        <td className="px-5 py-4 text-sm text-foreground-secondary whitespace-nowrap">
                          {formatDate(trade.createdAt)}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-semibold text-foreground">{formatAsset(trade.asset)}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${isLong ? "bg-success-bg text-success" : "bg-danger-bg text-danger"}`}>
                            {isLong ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                            {trade.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right text-sm font-mono text-foreground">
                          {trade.quantity}
                        </td>
                        <td className="px-5 py-4 text-right text-sm font-mono text-foreground-secondary">
                          ${toDecimalNumber(trade.openPrice, trade.decimal).toLocaleString()}
                        </td>
                        <td className="px-5 py-4 text-right text-sm font-mono text-foreground-secondary">
                          ${toDecimalNumber(trade.closePrice, trade.decimal).toLocaleString()}
                        </td>
                        <td className={`px-5 py-4 text-right text-sm font-bold font-mono ${isProfit ? "text-success" : pnlReal < 0 ? "text-danger" : "text-foreground-muted"}`}>
                          {pnlReal > 0 ? "+" : ""}${Math.abs(pnlReal).toFixed(2)}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${trade.liquidated ? "bg-danger-bg text-danger" : "bg-surface text-foreground-muted"}`}>
                            {trade.liquidated ? "Liquidated" : "Closed"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
