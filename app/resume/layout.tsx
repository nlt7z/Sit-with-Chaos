import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume — Yuan Fang",
  description: "Request a resume by email — Yuan Fang, UX designer.",
};

export default function ResumeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
