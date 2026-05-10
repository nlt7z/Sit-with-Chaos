"use client";

import { ShieldCheck } from "lucide-react";
import { usePrototypeStore } from "@/lib/store";

type Props = {
  compact?: boolean;
  label?: string;
};

export function DiagnosisSummaryCard({ compact, label }: Props) {
  const { symptoms, detail, timePreference, address, hasPhoto } = usePrototypeStore();

  const problemText = symptoms.length > 0 ? symptoms.join("、") : "马桶堵塞";
  const timeText = timePreference ?? "今天下午";

  if (compact) {
    return (
      <div className="mx-3 mb-2 px-3 py-2 rounded-xl bg-meituan-yellow-soft border border-meituan-yellow/30 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[12px] text-meituan-text-secondary">
          <ShieldCheck size={13} className="text-meituan-yellow-deep shrink-0" />
          <span className="truncate">
            马桶{problemText.slice(0, 4)} · {detail ?? "完全不进水"} · {timeText} · 已留图片
          </span>
        </div>
        <button className="text-[12px] text-meituan-trust shrink-0 ml-2">编辑</button>
      </div>
    );
  }

  return (
    <div className="mx-3 my-2 rounded-xl bg-meituan-yellow-soft border border-meituan-yellow/30 overflow-hidden">
      {label && (
        <div className="px-3 pt-2 pb-0 text-[11px] text-meituan-text-tertiary">{label}</div>
      )}
      <div className="px-3 py-2.5">
        <div className="flex items-center gap-1.5 mb-2">
          <ShieldCheck size={15} className="text-meituan-yellow-deep" />
          <span className="text-[13px] font-semibold text-meituan-text-primary">官方诊断信息</span>
        </div>

        <div className="space-y-1.5">
          <Row label="问题" value={`马桶${problemText}`} />
          <Row label="位置" value={address} />
          <Row label="紧急程度" value={detail ?? "完全不进水"} />
          <Row label="上门时间" value={timeText} />
        </div>

        {hasPhoto && (
          <div className="mt-2.5 w-16 h-16 rounded-lg bg-meituan-bg-chip overflow-hidden flex items-center justify-center">
            <div className="text-[10px] text-meituan-text-tertiary">图片</div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between">
      <span className="text-[12px] text-meituan-text-tertiary shrink-0 mr-3">{label}</span>
      <span className="text-[12px] text-meituan-text-primary text-right">{value}</span>
    </div>
  );
}
