import type { ReactNode } from "react";

export const metadata = {
  title: "Repair Expert · Rapid Diagnosis — Prototype",
};

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#DFE0E6]">
      {children}
    </div>
  );
}
