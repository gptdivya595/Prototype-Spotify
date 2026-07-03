import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { validateStudyEvent, type StudyEvent } from "../lib/events/schema";
import { calculateConditionMetrics } from "../lib/metrics/calculate";

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: npm run study:analyze -- <events.json-or-jsonl>");
  process.exitCode = 1;
} else {
  const content = await readFile(resolve(inputPath), "utf8");
  const raw: unknown[] = content.trim().startsWith("[")
    ? JSON.parse(content)
    : content.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
  const events = raw.map(validateStudyEvent);
  const sessions = new Map<string, StudyEvent[]>();
  for (const event of events) sessions.set(event.sessionId, [...(sessions.get(event.sessionId) ?? []), event]);

  const report = [...sessions.entries()].map(([sessionId, scoped]) => ({
    sessionId,
    completed: scoped.some((event) => event.eventName === "study_completed"),
    baseline: calculateConditionMetrics(scoped, "baseline"),
    guided: calculateConditionMetrics(scoped, "guided")
  }));

  console.log(JSON.stringify({
    generatedAt: new Date().toISOString(),
    eventCount: events.length,
    sessionCount: report.length,
    completedSessionCount: report.filter((item) => item.completed).length,
    sessions: report
  }, null, 2));
}
