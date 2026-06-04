import { LimeSignature } from "@/components/lab/LimeSignature";
import { Nav } from "@/components/Nav";

export const metadata = {
  title: "Lab — lime as signature (idea ③)",
  robots: { index: false, follow: false },
};

export default function LimeLabPage() {
  return (
    <>
      <Nav />
      <main className="relative min-h-screen bg-white pt-16">
        <span className="fixed left-1/2 top-20 z-[60] -translate-x-1/2 rounded-full border border-black/[0.08] bg-white/80 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-textSecondary backdrop-blur">
          prototype · idea ③
        </span>
        <LimeSignature />
      </main>
    </>
  );
}
