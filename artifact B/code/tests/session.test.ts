import assert from "node:assert/strict";
import test from "node:test";
import { assignConditionOrder, createStudySession } from "../lib/experiment/session";

test("condition order is stable for a seed and contains both conditions", () => {
  const first = assignConditionOrder("stable-seed");
  const second = assignConditionOrder("stable-seed");
  assert.deepEqual(first, second);
  assert.deepEqual(new Set(first), new Set(["baseline", "guided"]));
});

test("session ids are pseudonymous UUIDs", () => {
  const session = createStudySession("pilot-v1", "seed-a");
  assert.match(session.sessionId, /^[0-9a-f-]{36}$/);
  assert.equal(session.studyVersion, "pilot-v1");
  assert.equal(session.currentConditionIndex, 0);
});
