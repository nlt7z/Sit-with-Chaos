import type { Metadata } from "next";
import DailyPracticePage from "./DailyPracticePage";

export const metadata: Metadata = {
  title: "Daily Practice — Yuan Fang",
  description:
    "Interactive design explorations — one component per day. Motion, data visualization, and fintech UI patterns.",
};

export default function Page() {
  return <DailyPracticePage />;
}
