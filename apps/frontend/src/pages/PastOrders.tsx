import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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

export default function PastOrders() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["closedOrders"],
    queryFn: async () => {
      const res = await api.get("/trade/closed");
      return res.data.trades as ClosedTrade[];
    },
  });

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col">

      {/* NAV */}
      <nav className="h-16 flex items-center justify-between px-6 bg-[#020617]/80 backdrop-blur-xl border-b border-white/10">

        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="/exness-logo.png" className="h-6" />
            <span className="text-yellow-400 font-semibold">exness</span>
          </Link>

          <Link
            to="/trade"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
        </div>
      </nav>

      <main className="flex-1 p-6 lg:p-10">

        <div className="max-w-7xl mx-auto">

          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Trade History
            </h1>
            <p className="text-gray-400 text-sm">
              All your closed and liquidated positions
            </p>
          </div>

          {/* TABLE WRAPPER */}
          <div className="relative rounded-2xl bg-[#0f172a]/60 backdrop-blur-xl border border-white/10 overflow-hidden">

            {/* GLOW */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-500/10 pointer-events-none" />

            <div className="relative overflow-x-auto">

              <table className="w-full text-sm">

                {/* HEAD */}
                <thead className="bg-white/5 text-gray-400 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-4 text-left">Date</th>
                    <th className="px-6 py-4 text-left">Asset</th>
                    <th className="px-6 py-4 text-left">Type</th>
                    <th className="px-6 py-4 text-right">Size</th>
                    <th className="px-6 py-4 text-right">Entry</th>
                    <th className="px-6 py-4 text-right">Exit</th>
                    <th className="px-6 py-4 text-right">PnL</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>

                {/* BODY */}
                <tbody className="divide-y divide-white/5">

                  {isLoading && (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-gray-400">
                        Loading history...
                      </td>
                    </tr>
                  )}

                  {isError && (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-red-400">
                        Failed to load trades
                      </td>
                    </tr>
                  )}

                  {!isLoading && !isError && data?.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-gray-500">
                        No past trades found
                      </td>
                    </tr>
                  )}

                  {!isLoading &&
                    !isError &&
                    data?.map((trade) => {
                      const date = new Date(trade.createdAt).toLocaleString();
                      const pnlReal = toDecimalNumber(trade.pnl, trade.decimal);
                      const isProfit = pnlReal > 0;

                      return (
                        <tr
                          key={trade.id}
                          className="hover:bg-white/5 transition"
                        >
                          <td className="px-6 py-4 text-gray-400 text-xs">
                            {date}
                          </td>

                          <td className="px-6 py-4 font-medium">
                            {trade.asset}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                trade.type === "long"
                                  ? "bg-green-500/10 text-green-400"
                                  : "bg-red-500/10 text-red-400"
                              }`}
                            >
                              {trade.type}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-right">
                            {trade.quantity}
                          </td>

                          <td className="px-6 py-4 text-right text-gray-400">
                            ${toDecimalNumber(trade.openPrice, trade.decimal).toLocaleString()}
                          </td>

                          <td className="px-6 py-4 text-right text-gray-400">
                            ${toDecimalNumber(trade.closePrice, trade.decimal).toLocaleString()}
                          </td>

                          <td
                            className={`px-6 py-4 text-right font-semibold ${
                              isProfit
                                ? "text-green-400"
                                : pnlReal < 0
                                ? "text-red-400"
                                : "text-gray-300"
                            }`}
                          >
                            {pnlReal > 0 ? "+" : ""}${pnlReal.toLocaleString()}
                          </td>

                          <td className="px-6 py-4 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs ${
                                trade.liquidated
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-gray-700 text-gray-300"
                              }`}
                            >
                              {trade.liquidated ? "Liquidated" : "Closed"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}