import { readFileSync, existsSync } from "node:fs";

const HARD_RULES_PATH = "~/.openclaw/company-info/company-hard-rules.md";
const HARD_RULES_MARKER = "## 0. 技能读取原则";

/**
 * Prepends company hard rules from the public company-info directory
 * into every agent's AGENTS.md workspace bootstrap file.
 */
const handler = async (event) => {
  if (event.type !== "agent" || event.action !== "bootstrap") {
    return;
  }

  const agentId = event.context?.agentId || event.agentId || "";
  if (agentId === "main") {
    return;
  }

  if (!existsSync(HARD_RULES_PATH)) {
    return;
  }

  const hardRules = readFileSync(HARD_RULES_PATH, "utf-8");
  if (!hardRules.trim()) {
    return;
  }

  const files = event.context?.bootstrapFiles;
  if (!Array.isArray(files)) {
    return;
  }

  for (const file of files) {
    if (file.name === "AGENTS.md") {
      // Idempotent for a single bootstrap pass.
      if (file.content?.includes(HARD_RULES_MARKER)) {
        return;
      }
      file.content = `${hardRules}\n\n${file.content ?? ""}`;
      return;
    }
  }
};

export default handler;
