import type { Scenario } from "../chatStore";
import { defaultScript, type ScriptStep } from "./default";

export function getScript(scenario: Scenario): ScriptStep[] {
  switch (scenario) {
    case "default":
      return defaultScript;
    default:
      return defaultScript;
  }
}
