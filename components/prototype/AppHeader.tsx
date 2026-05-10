"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  title: string;
  back?: boolean | string;
  right?: React.ReactNode;
  badge?: string;
};

export function AppHeader({ title, back, right, badge }: Props) {
  const router = useRouter();

  function handleBack() {
    if (typeof back === "string") {
      router.push(back);
    } else {
      router.back();
    }
  }

  return (
    <div
      className="flex items-center justify-between bg-white border-b border-meituan-border px-4 shrink-0"
      style={{ height: 44 }}
    >
      <div className="w-10 flex items-center">
        {back && (
          <button
            onClick={handleBack}
            className="flex items-center justify-center -ml-2 p-2 text-meituan-text-primary active:opacity-60"
          >
            <ChevronLeft size={22} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-[17px] font-semibold text-meituan-text-primary">{title}</span>
        {badge && (
          <span className="text-[10px] font-semibold bg-meituan-yellow text-meituan-text-primary px-1.5 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>

      <div className="w-10 flex items-center justify-end">{right}</div>
    </div>
  );
}
