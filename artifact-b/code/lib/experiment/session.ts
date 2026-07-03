import { createHash, randomUUID } from "node:crypto";

export type Condition = "baseline" | "guided";
export type ConditionOrder = [Condition, Condition];

export function assignConditionOrder(seed: string): ConditionOrder {
  const digest = createHash("sha256").update(seed).digest();
  return digest[0] % 2 === 0 ? ["baseline", "guided"] : ["guided", "baseline"];
}

export function createStudySession(studyVersion: string, seed: string = randomUUID()) {
  return {
    sessionId: randomUUID(),
    seed,
    studyVersion,
    conditionOrder: assignConditionOrder(seed),
    currentConditionIndex: 0,
    createdAt: new Date().toISOString()
  };
}
