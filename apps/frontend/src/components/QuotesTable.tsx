import { useEffect, useRef, useState } from "react";
import { useQuotesStore } from "@/lib/quotesStore";
import { formatPrice } from "@/lib/quotesStore";
import { TrendingUp, TrendingDown } from "lucide-react";

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
    dir === "up" ? "text-success" : dir === "down" ? "text-danger" : isSelected ? "text-foreground" : "text-foreground-secondary";

  return (
    <span className={`transition-colors duration-300 font-mono ${cls}`}>
      {formatPrice(value, decimal)}
    </span>
  );
}

export default function QuotesTable() {
  const { quotes, selectedSymbol, setSelectedSymbol } = useQuotesStore();

  const symbols = ["BTCUSDC", "ETHUSDC", "SOLUSDC"];

  return (
    <div className="flex flex-col gap-2 p-3 w-full">
      {symbols.map((symbol) => {
        const q = quotes[symbol];
        const isSelected = selectedSymbol === symbol;
        const displaySymbol = symbol.replace("USDC", "");
        
        return (
          <button
            key={symbol}
            onClick={() => setSelectedSymbol(symbol)}
            className={`
              group relative flex flex-col items-start p-4 w-full text-left transition-all duration-200 rounded-xl border
              ${isSelected 
                ? "bg-primary/10 border-primary/30 shadow-sm" 
                : "bg-surface border-border hover:border-border-light hover:bg-surface-hover"
              }
            `}
          >
            {/* Symbol Header */}
            <div className="flex justify-between items-center w-full mb-3">
              <div className="flex items-center gap-2">
                <span className={`font-bold text-base ${isSelected ? "text-foreground" : "text-foreground"}`}>
                  {displaySymbol}
                </span>
                <span className="text-xs text-foreground-muted">/USD</span>
              </div>
              {isSelected && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-soft" />
                  <span className="text-[10px] font-medium text-primary">ACTIVE</span>
                </div>
              )}
            </div>
            
            {/* Prices */}
            {q ? (
              <div className="w-full space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <TrendingDown size={10} className="text-danger" />
                    <span className={`text-[10px] font-medium uppercase ${isSelected ? "text-foreground-secondary" : "text-foreground-muted"}`}>Bid</span>
                  </div>
                  <span className="font-semibold text-sm">
                    <FlashPrice value={q.bid_price} decimal={q.decimal} isSelected={isSelected} />
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={10} className="text-success" />
                    <span className={`text-[10px] font-medium uppercase ${isSelected ? "text-foreground-secondary" : "text-foreground-muted"}`}>Ask</span>
                  </div>
                  <span className="font-semibold text-sm">
                    <FlashPrice value={q.ask_price} decimal={q.decimal} isSelected={isSelected} />
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full h-12 flex items-center justify-center">
                <div className="w-24 h-4 bg-surface-hover rounded animate-shimmer" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
