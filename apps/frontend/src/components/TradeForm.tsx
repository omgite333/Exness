import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useQuotesStore } from "@/lib/quotesStore";
import { appToBackendSymbol } from "@/lib/symbols";
import { useOpenOrdersStore, type OpenOrder } from "@/lib/openOrdersStore";
import type { UsdBalance } from "@/lib/balance";
import { toDecimalNumber } from "@/lib/utils";
import { ArrowRight, AlertCircle, CheckCircle } from "lucide-react";

interface TradeFormProps {
  defaultSide?: "long" | "short";
  onClose?: () => void;
}

export default function TradeForm({ defaultSide, onClose }: TradeFormProps) {
  const { selectedSymbol, quotes } = useQuotesStore();
  const q = quotes[selectedSymbol];
  const [type, setType] = useState<"long" | "short">(defaultSide ?? "long");
  const [quantity, setQuantity] = useState("0.1");
  const [leverage, setLeverage] = useState("10");
  const [slippage, setSlippage] = useState("0.5");
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const openPrice = q ? (type === "long" ? q.ask_price : q.bid_price) : 0;
  const decimal = q ? q.decimal : 4;

  const upsert = useOpenOrdersStore((s) => s.upsert);
  const qc = useQueryClient();
  
  const validate = () => {
      const newErrors: Record<string, string> = {};
      const qty = Number(quantity);

      if (isNaN(qty) || qty <= 0) newErrors.quantity = "Quantity must be > 0";

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const { mutate, isPending, isSuccess, error } = useMutation({
    mutationFn: async () => {
      const payload = {
        asset: appToBackendSymbol(selectedSymbol),
        type,
        quantity: Number(quantity),
        leverage: Number(leverage),
        slippage: Number(slippage),
        openPrice,
        decimal,
      };
      const { data } = await api.post("/trade/open", payload);
      return data as {
        message: string;
        order?: OpenOrder;
        orderId?: string;
        openOrders?: OpenOrder[];
        usdBalance?: UsdBalance;
      };
    },
    onSuccess: (data) => {
      if (data?.order) upsert(data.order);
      if (data?.openOrders) useOpenOrdersStore.getState().setAll(data.openOrders);
      if (data?.usdBalance) {
        qc.setQueryData<UsdBalance>(["balance.usd"], data.usdBalance);
      } else {
        qc.invalidateQueries({ queryKey: ["balance.usd"] });
      }
      onClose?.();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
        mutate();
    }
  };

  const positionSize = Number(quantity) * (openPrice ? toDecimalNumber(openPrice, decimal) : 0);
  const marginRequired = positionSize / Number(leverage || 1);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* Long/Short Toggle */}
      <div className="flex p-1 gap-1 bg-surface rounded-xl border border-border">
        <button
          type="button"
          onClick={() => setType("long")}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            type === "long"
              ? "bg-success text-background shadow-sm"
              : "bg-transparent text-foreground-secondary hover:text-foreground hover:bg-surface-hover"
          }`}
        >
          Long
        </button>
        <button
          type="button"
          onClick={() => setType("short")}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            type === "short"
              ? "bg-danger text-foreground shadow-sm"
              : "bg-transparent text-foreground-secondary hover:text-foreground hover:bg-surface-hover"
          }`}
        >
          Short
        </button>
      </div>

      <div className="space-y-4">

        {/* Asset */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground-muted uppercase tracking-wide">Asset</label>
          <div className="bg-surface border border-border px-4 py-3 rounded-xl text-sm font-semibold text-foreground">
            {selectedSymbol}
          </div>
        </div>

        {/* Quantity */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground-muted uppercase tracking-wide">Quantity</label>
          <input
            type="number"
            step="0.0001"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className={`w-full px-4 py-3 text-sm font-mono rounded-xl ${errors.quantity ? "border-danger focus:border-danger" : ""}`}
            placeholder="0.00"
          />
          {errors.quantity && (
            <span className="text-xs text-danger font-medium flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3" /> {errors.quantity}
            </span>
          )}
        </div>

        {/* Leverage & Slippage */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground-muted uppercase tracking-wide">Leverage</label>
            <select
              value={leverage}
              onChange={(e) => setLeverage(e.target.value)}
              className="w-full px-4 py-3 text-sm font-mono rounded-xl appearance-none cursor-pointer"
            >
              {[1, 2, 3, 5, 10, 15, 20, 25, 50, 75, 100].map((v) => (
                <option key={v} value={v}>{v}x</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground-muted uppercase tracking-wide">Slippage</label>
            <select
              value={slippage}
              onChange={(e) => setSlippage(e.target.value)}
              className="w-full px-4 py-3 text-sm font-mono rounded-xl appearance-none cursor-pointer"
            >
              {[0.1, 0.2, 0.3, 0.5, 1.0, 2.0, 5.0].map((v) => (
                <option key={v} value={v}>{v}%</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-foreground-muted">Entry Price</span>
          <span className="font-mono font-semibold text-sm text-foreground">
            {openPrice ? toDecimalNumber(openPrice, decimal).toLocaleString() : "-"}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-foreground-muted">Position Size</span>
          <span className="font-mono font-semibold text-sm text-foreground">
            ${positionSize.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-border">
          <span className="text-xs text-foreground-muted">Margin Required</span>
          <span className="font-mono font-bold text-sm text-primary">
            ${marginRequired.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className={`w-full py-3.5 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all ${
          type === "long" 
            ? "bg-success hover:bg-success/90 text-background glow-success" 
            : "bg-danger hover:bg-danger/90 text-foreground glow-danger"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isPending ? (
          <>
            <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            Executing...
          </>
        ) : (
          <>
            Place {type === "long" ? "Long" : "Short"} Order
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Success Message */}
      {isSuccess && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-success-bg border border-success/20 text-success text-sm animate-fade-in">
          <CheckCircle size={16} />
          Order executed successfully
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-danger-bg border border-danger/20 text-danger text-sm animate-fade-in">
          <AlertCircle size={16} />
          {(error as unknown as { response: { data: { message: string } } }).response?.data?.message || "Execution failed"}
        </div>
      )}
    </form>
  );
}
