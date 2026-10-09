import { notFound } from "next/navigation";

/**
 * About is hidden for now: the route 404s and nothing links here. The page
 * itself lives on in AboutContent.tsx; render it here again to bring it back.
 */
export default function AboutPage() {
  notFound();
}
