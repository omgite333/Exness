import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useQuotesStore } from "@/lib/quotesStore";
import { appToBackendSymbol } from "@/lib/symbols";
import { toDecimalNumber } from "@/lib/utils";
import { wsClient } from "@/lib/ws";
import { useSessionStore } from "@/lib/session";

const SYMBOLS = ["BTCUSDC", "ETHUSDC", "SOLUSDC"];
const LEVERAGES = ["1x", "5x", "10x", "20x", "50x", "100x"];
const SLIPPAGES = ["0.1%", "0.5%", "1%"];

export default function TradeForm() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDC");
  const [quantity, setQuantity] = useState("0.1");
  const [leverage, setLeverage] = useState("10x");
  const [slippage, setSlippage] = useState("0.5%");
  const [side, setSide] = useState<"long" | "short">("long");
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { quotes } = useQuotesStore();
  const userId = useSessionStore((s) => s.userId);
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);

  const { mutate: placeOrder, isPending } = useMutation({
    mutationFn: async () => {
      const symbol = appToBackendSymbol(selectedSymbol);
      const qty = parseFloat(quantity);

      if (!qty || qty <= 0) throw new Error("Quantity must be greater than 0");

      const res = await api.post("/api/trades/order", {
        userId,
        asset: symbol,
        type: side,
        quantity: qty,
        leverage: parseInt(leverage),
        slippage: parseFloat(slippage),
        isMockOrder: !isAuthenticated,
      });

      if (res.data?.status === "failed") {
        throw new Error(res.data.error || "Order rejected");
      }
      return res.data;
    },
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["openOrders"] });
      queryClient.invalidateQueries({ queryKey: ["balance.usd"] });
      queryClient.invalidateQueries({ queryKey: ["trade-history"] });
    },
    onError: (err: any) => {
      setError(err.message || "Order failed");
    },
  });

const handleSubmit = () => {
  if (!q) {
    wsClient.connect();
    setError("Reconnecting to market feed. Try again in a few seconds.");
    return;
  }
  placeOrder();
};

  const handleNumericChange = (value: string, setter: (v: string) => void) => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    const finalValue = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : cleaned;
    setter(finalValue);
  };

  const q = quotes[selectedSymbol];
  const decimal = q?.decimal ?? 2;
  const openPrice = q ? (side === "long" ? q.ask_price : q.bid_price) : 0;
  const entryDec = toDecimalNumber(openPrice, decimal);
  const levNum = parseInt(leverage) || 1;
  const qtyNum = parseFloat(quantity) || 0;
  const positionSize = entryDec * qtyNum;
  const marginRequired = positionSize / levNum;

  const inputCls =
    "w-full bg-panel-2 border border-line rounded-xl px-3.5 py-3 text-sm font-bold text-fg tabular-nums placeholder:text-muted/50 focus:outline-none focus:border-brand/60 transition-colors";

  return (
    <div className="flex flex-col gap-3.5">
      {/* Market price */}
      <div className="flex items-center justify-between rounded-xl bg-panel-2 border border-line px-3.5 py-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Market</p>
          <p className="text-[11px] text-muted/70 font-medium mt-0.5">{side === "long" ? "Ask" : "Bid"} execution</p>
        </div>
        <p className="text-base font-extrabold tabular-nums">
          {q ? entryDec.toLocaleString(undefined, { minimumFractionDigits: decimal, maximumFractionDigits: decimal }) : "—"}
        </p>
      </div>

      {/* Side segmented */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-panel-2 border border-line rounded-xl">
        <button
          onClick={() => setSide("long")}
          className={`py-2.5 rounded-lg text-sm font-extrabold tracking-wide transition-all ${
            side === "long"
              ? "bg-bull text-black shadow-lg shadow-bull/25"
              : "text-muted hover:text-fg"
          }`}
        >
          LONG
        </button>
        <button
          onClick={() => setSide("short")}
          className={`py-2.5 rounded-lg text-sm font-extrabold tracking-wide transition-all ${
            side === "short"
              ? "bg-bear text-black shadow-lg shadow-bear/25"
              : "text-muted hover:text-fg"
          }`}
        >
          SHORT
        </button>
      </div>

      <div>
        <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Asset</label>
        <select
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value)}
          className={`${inputCls} mt-1.5 appearance-none cursor-pointer`}
        >
          {SYMBOLS.map((s) => (
            <option key={s} value={s} className="bg-panel-2">{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Quantity</label>
        <input
          type="text"
          inputMode="decimal"
          value={quantity}
          onChange={(e) => handleNumericChange(e.target.value, setQuantity)}
          className={`${inputCls} mt-1.5`}
          placeholder="0.1"
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Leverage</label>
          <select
            value={leverage}
            onChange={(e) => setLeverage(e.target.value)}
            className={`${inputCls} mt-1.5 appearance-none cursor-pointer`}
          >
            {LEVERAGES.map((l) => (
              <option key={l} value={l} className="bg-panel-2">{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Slippage</label>
          <select
            value={slippage}
            onChange={(e) => setSlippage(e.target.value)}
            className={`${inputCls} mt-1.5 appearance-none cursor-pointer`}
          >
            {SLIPPAGES.map((s) => (
              <option key={s} value={s} className="bg-panel-2">{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-panel-2 border border-line rounded-xl p-3.5 space-y-2.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted font-semibold uppercase tracking-wider text-[10px]">Est. entry</span>
          <span className="font-bold tabular-nums">
            {q ? entryDec.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: decimal }) : "—"}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted font-semibold uppercase tracking-wider text-[10px]">Position size</span>
          <span className="font-bold tabular-nums">
            {positionSize.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted font-semibold uppercase tracking-wider text-[10px]">Margin required</span>
          <span className="font-bold text-gold tabular-nums">
            {marginRequired.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
          </span>
        </div>
      </div>

      {error && (
        <div className="text-xs text-bear bg-bear/10 border border-bear/25 rounded-xl px-3.5 py-2.5 font-medium">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full py-3.5 rounded-xl bg-brand hover:bg-brand-deep disabled:opacity-50 disabled:cursor-not-allowed text-black font-extrabold text-sm tracking-wide transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand/20"
      >
        {isPending ? "Placing..." : "Place order"}
        {!isPending && <span aria-hidden>→</span>}
      </button>
    </div>
  );
}
