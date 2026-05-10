import type { Metadata } from "next";
import { DemoNavBar } from "@/components/prototype/DemoNavBar";
import { DeviceFrame } from "@/components/prototype/DeviceFrame";

export const metadata: Metadata = {
  title: "美团 IM 报价 — 原型演示",
};

export default function PrototypeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #f0f0f0 0%, #e5e5e5 50%, #ebebeb 100%)",
      }}
    >
      <DeviceFrame>{children}</DeviceFrame>
      <DemoNavBar />
    </div>
  );
}
