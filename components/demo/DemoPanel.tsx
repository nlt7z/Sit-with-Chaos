"use client";

import { useChatStore, type Scenario, type Stage } from "@/lib/chatStore";

const SCENARIOS: { key: Scenario; label: string }[] = [
  { key: "default", label: "Default (happy path)" },
  { key: "cat-litter", label: "Cat litter clog" },
  { key: "off-hours", label: "Off hours (9PM)" },
  { key: "quote-expired-modal", label: "Quote expired modal" },
  { key: "quote-expired-chat", label: "Quote expired chat" },
  { key: "return-visit", label: "Return visit" },
  { key: "review-sheet", label: "Review sheet" },
];

const STAGES: { num: Stage; label: string }[] = [
  { num: 1, label: "1" },
  { num: 2, label: "2" },
  { num: 3, label: "3" },
  { num: 4, label: "4" },
];

export function DemoPanel() {
  const scenario = useChatStore((s) => s.scenario);
  const stage = useChatStore((s) => s.stage);
  const messages = useChatStore((s) => s.messages);
  const autoPlay = useChatStore((s) => s.autoPlay);
  const slowMotion = useChatStore((s) => s.slowMotion);
  const setScenario = useChatStore((s) => s.setScenario);
  const advanceStage = useChatStore((s) => s.advanceStage);
  const setAutoPlay = useChatStore((s) => s.setAutoPlay);
  const setSlowMotion = useChatStore((s) => s.setSlowMotion);
  const reset = useChatStore((s) => s.reset);

  return (
    <div className="w-[270px] bg-white rounded-2xl shadow-xl p-4 font-sans">
      <h2 className="text-[14px] font-semibold text-gray-800 mb-4">
        Prototype Controls
      </h2>

      {/* Scenarios */}
      <section className="mb-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
          Scenarios
        </p>
        <div className="flex flex-col gap-1.5">
          {SCENARIOS.map((s) => (
            <button
              key={s.key}
              onClick={() => setScenario(s.key)}
              className={`text-left text-[13px] px-3 py-2 rounded-lg transition-colors leading-snug ${
                scenario === s.key
                  ? "bg-meituan-yellow text-black font-medium"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </section>

      {/* Stage jumper */}
      <section className="mb-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
          Jump to Stage
        </p>
        <div className="grid grid-cols-4 gap-1.5">
          {STAGES.map((s) => (
            <button
              key={s.num}
              onClick={() => advanceStage(s.num)}
              className={`text-[13px] py-1.5 rounded-lg transition-colors font-medium ${
                stage === s.num
                  ? "bg-meituan-blue text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </section>

      {/* Toggles */}
      <section className="mb-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
          Options
        </p>
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoPlay}
              onChange={(e) => setAutoPlay(e.target.checked)}
              className="w-4 h-4 rounded accent-meituan-yellow"
            />
            <span className="text-[13px] text-gray-700">Auto-play messages</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={slowMotion}
              onChange={(e) => setSlowMotion(e.target.checked)}
              className="w-4 h-4 rounded accent-meituan-yellow"
            />
            <span className="text-[13px] text-gray-700">Slow motion (2x)</span>
          </label>
        </div>
      </section>

      {/* Reset */}
      <button
        onClick={reset}
        className="w-full border border-red-300 text-red-500 text-[13px] font-medium py-2 rounded-lg hover:bg-red-50 transition-colors mb-4"
      >
        Reset
      </button>

      {/* State readout */}
      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-[11px] font-mono text-gray-500 leading-relaxed">
          scenario: <span className="text-gray-800">{scenario}</span>
          <br />
          stage: <span className="text-gray-800">{stage}</span>
          <br />
          messages: <span className="text-gray-800">{messages.length}</span>
        </p>
      </div>
    </div>
  );
}
