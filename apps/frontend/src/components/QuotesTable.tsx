import { useEffect, useRef, useState } from "react";
import { useQuotesStore } from "@/lib/quotesStore";
import { formatPrice } from "@/lib/quotesStore";

function FlashPrice({ value, decimal, isSelected }: { value: number; decimal: number; isSelected: boolean }) {
  const prevRef = useRef<number | null>(null);
  const [dir, setDir] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = value;
    if (prev === null || prev === value) return;
    setDir(value > prev ? "up" : "down");
    const t = setTimeout(() => setDir(null), 1000);
    return () => clearTimeout(t);
  }, [value]);

  const cls =
    dir === "up" ? "text-bull" : dir === "down" ? "text-bear" : isSelected ? "text-fg" : "text-fg/80";

  return (
    <span className={`transition-colors duration-300 tabular-nums ${cls}`}>
      {formatPrice(value, decimal)}
    </span>
  );
}

export default function QuotesTable() {
  const { quotes, selectedSymbol, setSelectedSymbol } = useQuotesStore();

  const symbols = ["BTCUSDC", "ETHUSDC", "SOLUSDC"];

  return (
    <div className="flex flex-col gap-1 p-2 w-full">
      {symbols.map((symbol) => {
        const q = quotes[symbol];
        const isSelected = selectedSymbol === symbol;
        const base = symbol.replace("USDC", "");

        return (
          <button
            key={symbol}
            onClick={() => setSelectedSymbol(symbol)}
            className={`
              group relative w-full text-left rounded-xl border px-3.5 py-3 transition-all duration-150
              ${isSelected
                ? "bg-brand/[0.08] border-brand/50"
                : "border-transparent hover:bg-wash"
              }
            `}
          >
            {isSelected && (
              <div className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full bg-brand" />
            )}

            <div className="font-extrabold text-sm tracking-tight">
              {base}
              <span className="ml-1.5 text-[10px] font-semibold text-muted">/ USDC · PERP</span>
            </div>

            {q ? (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted font-medium">BID</span>
                  <span className="font-bold">
                    <FlashPrice value={q.bid_price} decimal={q.decimal} isSelected={isSelected} />
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted font-medium">ASK</span>
                  <span className="font-bold">
                    <FlashPrice value={q.ask_price} decimal={q.decimal} isSelected={isSelected} />
                  </span>
                </div>
              </div>
            ) : (
              <div className="animate-pulse h-8 w-24 bg-wash rounded mt-2" />
            )}
          </button>
        );
      })}
    </div>
  );
}
