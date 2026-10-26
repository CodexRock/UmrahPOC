import { readFileSync, writeFileSync } from "node:fs";
import { validateConversation } from "../src/conversation.js";
const result = validateConversation(
  JSON.parse(readFileSync("runtime/conversational-session.json", "utf8")),
);
writeFileSync(
  "runtime/conversational-plan.json",
  JSON.stringify(result, null, 2),
  { mode: 0o600 },
);
// Supplier clickout parameters remain in the private snapshot/result, not terminal logs.
console.log(
  JSON.stringify(
    {
      mode: result.mode,
      validation: result.validation,
      quotedSubtotalEUR: result.quotedSubtotalEUR,
      averagePerAdultEUR: result.averagePerAdultEUR,
      finalPayableTotal: result.finalPayableTotal,
      workerAccessDemonstrated: result.workerAccessDemonstrated,
      warnings: result.warnings,
    },
    null,
    2,
  ),
);
