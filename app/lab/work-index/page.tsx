import type { Metadata } from "next";

import { WorkIndexDemo } from "./WorkIndexDemo";

export const metadata: Metadata = {
  title: "Lab: work index · Yuan Fang",
  robots: { index: false, follow: false },
};

/** Demo: the Work page as a hover index that grows into each project, ending on a curtain footer. */
export default function WorkIndexPage() {
  return <WorkIndexDemo />;
}
