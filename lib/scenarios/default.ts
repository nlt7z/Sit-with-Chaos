import type { ChatStore } from "../chatStore";
import { defaultRepairOrder } from "../mockData";

let _seq = 0;
const uid = () => `msg-${++_seq}-${Date.now()}`;

export type ScriptStep = {
  delay: number;
  act: (store: ChatStore) => void;
  waitForUser?: boolean;
};

export const defaultScript: ScriptStep[] = [
  {
    delay: 0,
    act: (s) => {
      _seq = 0;
      s.setShowBanner(true);
      s.advanceStage(1);
    },
  },
  {
    delay: 0,
    act: (s) =>
      s.appendMessage({
        id: uid(),
        type: "timestamp",
        time: "5:33 PM",
        subtitle: "Your privacy is protected on this platform.",
      }),
  },
  {
    delay: 600,
    waitForUser: true,
    act: (s) =>
      s.appendMessage({
        id: uid(),
        type: "expert-text",
        expertVariant: "helmet",
        text: "Hi! What seems to be the issue? Tap a common type below, or describe it yourself.",
        suggestedQuestions: ["Toilet clog", "Toilet not flushing", "Flange issue"],
      }),
  },
  // user-text appended externally on suggestion tap
  {
    delay: 800,
    act: (s) => {
      s.advanceStage(2);
      s.setShowBanner(false);
      s.appendMessage({
        id: uid(),
        type: "system",
        text: "Mike Chen joined the conversation",
        highlight: "Mike Chen",
      });
    },
  },
  {
    delay: 1000,
    act: (s) =>
      s.appendMessage({
        id: uid(),
        type: "master-intro",
        name: "Mike Chen",
        meta: ["Plumbing specialist", "12 yrs exp"],
      }),
  },
  {
    delay: 1500,
    waitForUser: true,
    act: (s) =>
      s.appendMessage({
        id: uid(),
        type: "expert-text",
        expertVariant: "master",
        text: "Thanks! Could you send a quick video of the toilet so I can see what's going on?",
        suggestedQuestions: ["Sure, sending now"],
      }),
  },
  // user-text "Sure, sending now" appended externally
  {
    delay: 1200,
    act: (s) =>
      s.appendMessage({
        id: uid(),
        type: "user-media",
        mediaKind: "video",
        label: "Toilet video",
        duration: "00:15",
      }),
  },
  {
    delay: 2500,
    act: (s) => {
      s.advanceStage(3);
      s.appendMessage({
        id: uid(),
        type: "expert-text",
        expertVariant: "master",
        text: "From the video, the wax ring gasket between the flange and the floor is worn. That's causing the leak. Replacing it should resolve the issue.",
      });
    },
  },
  {
    delay: 1500,
    act: (s) =>
      s.appendMessage({
        id: uid(),
        type: "expert-text",
        expertVariant: "master",
        text: "I've drafted a repair order. Confirm the time and address, then I'll pull nearby merchant quotes for you.",
      }),
  },
  {
    delay: 1200,
    act: (s) =>
      s.appendMessage({
        id: uid(),
        type: "repair-order",
        data: defaultRepairOrder,
      }),
  },
];
