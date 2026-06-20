import BlueGradientBackground from "@/components/BlueGradientBackground";

export const metadata = { title: "Gradient — Lab" };

export default function GradientLab() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <BlueGradientBackground fixed />

      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-white/70">
          Lab · Animated Background
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-white drop-shadow-sm sm:text-7xl">
          Blue Gradient
        </h1>
        <p className="mt-4 max-w-md text-sm text-white/75">
          Diagonal sky ramp · drifting light arc · fine film grain
        </p>
      </section>
    </main>
  );
}
