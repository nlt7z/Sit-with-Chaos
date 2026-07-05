import { permanentRedirect } from "next/navigation";

// The Liner AI Scholar case study now lives at /work/liner. Keep this path alive
// for existing links (gallery cards, deck, external) with a permanent redirect.
export default function LinerScholarRedirect() {
  permanentRedirect("/work/liner");
}
