import { redirect } from "next/navigation";

// deck-present 已被新的 deck-story 取代;旧链接跳转到英文版(与旧版语言一致)。
// 旧版实现仍保留在 DeckPresentClient.tsx,如需找回可恢复。
export default function MeituanDeckPresentPage() {
  redirect("/work/meituan-im/deck-story-en");
}
