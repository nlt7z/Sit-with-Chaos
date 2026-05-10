"use client";

import { Check, Clock, ChevronRight } from "lucide-react";
import { merchants, mockQuoteSchedule } from "@/lib/mock-data";

type Variant = "loading" | "live" | "selected" | "expired";

type Props = {
  merchantId: string;
  variant?: Variant;
  onSelect?: () => void;
};

export function QuoteCard({ merchantId, variant = "live", onSelect }: Props) {
  const merchant = merchants.find((m) => m.id === merchantId);
  const quote = mockQuoteSchedule.find((q) => q.merchantId === merchantId);

  if (!merchant || !quote || !quote.price) return null;

  const isExpired = variant === "expired";
  const isLoading = variant === "loading";
  const isBest = quote.bestMatch;

  return (
    <div
      className={`relative mx-3 mb-3 rounded-xl bg-white border overflow-hidden
        ${variant === "selected" ? "border-meituan-yellow shadow-md" : "border-meituan-border"}
        ${isExpired ? "opacity-50 grayscale" : ""}`}
    >
      {isBest && !isExpired && (
        <div className="absolute top-0 left-0 bg-meituan-yellow text-[10px] font-semibold text-meituan-text-primary px-2 py-0.5 rounded-br-lg">
          最佳匹配
        </div>
      )}
      {isExpired && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <span className="bg-black/60 text-white text-[12px] font-medium px-3 py-1 rounded-full">报价已过期</span>
        </div>
      )}

      <div className={`px-3 pt-${isBest ? "6" : "3"} pb-3`}>
        {/* Merchant row */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-full bg-meituan-bg-chip flex items-center justify-center text-[11px] font-semibold text-meituan-text-secondary shrink-0">
            {merchant.name.slice(0, 1)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[14px] font-medium text-meituan-text-primary truncate">{merchant.name}</span>
              {merchant.verified && (
                <span className="text-[9px] bg-meituan-trust/10 text-meituan-trust px-1 py-0.5 rounded shrink-0">认证</span>
              )}
            </div>
            <div className="text-[11px] text-meituan-text-tertiary">
              ⭐ {merchant.rating} ({merchant.orders}+单)
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-4 bg-meituan-bg-chip rounded w-1/3" />
            <div className="h-3 bg-meituan-bg-chip rounded w-2/3" />
          </div>
        ) : (
          <>
            {/* Price */}
            <div className="flex items-baseline gap-1 mb-1.5">
              <span className="text-[22px] font-semibold text-meituan-orange" style={{ fontVariantNumeric: "tabular-nums" }}>
                ¥{quote.price}
              </span>
              <span className="text-[11px] text-meituan-text-tertiary">含上门费 · 基础诊断</span>
            </div>

            {/* Includes */}
            <div className="space-y-0.5 mb-2">
              {(quote.includes as string[]).map((item) => (
                <div key={item} className="flex items-center gap-1 text-[12px] text-meituan-text-secondary">
                  <Check size={11} className="text-meituan-success shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            {/* Time */}
            <div className="flex items-center gap-1 text-[11px] text-meituan-text-tertiary mb-2.5">
              <Clock size={11} />
              <span>最快 {quote.earliestTime} 上门</span>
              <span className="ml-auto text-meituan-danger">报价 {quote.expiresInMin} 分钟后过期</span>
            </div>

            {/* CTA */}
            {onSelect && (
              <button
                onClick={onSelect}
                className="w-full h-9 bg-meituan-yellow rounded-lg text-[14px] font-semibold text-meituan-text-primary active:scale-95 transition-transform"
              >
                选择此报价
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
