import type { Metadata } from "next";
import PsychShowroomPrototypeClient from "./PsychShowroomPrototypeClient";

export const metadata: Metadata = {
  title: "Psychology Expert Showroom Prototype — Yuan Fang",
  description:
    "Interactive psychology consultation showroom with visible analysis steps before response.",
};

export default async function PsychShowroomPrototypePage({
  searchParams,
}: {
  searchParams: Promise<{ embed?: string }>;
}) {
  const params = await searchParams;
  return <PsychShowroomPrototypeClient embed={params.embed === "1"} />;
}

