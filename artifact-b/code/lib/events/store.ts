import type { StudyEvent } from "@/lib/events/schema";
import { neon } from "@neondatabase/serverless";

export interface EventStore {
  append(events: StudyEvent[]): Promise<void>;
  count(): Promise<number>;
  mode: "memory" | "postgres";
  durable: boolean;
}

class MemoryEventStore implements EventStore {
  private events: StudyEvent[] = [];
  mode = "memory" as const;
  durable = false;

  async append(events: StudyEvent[]) {
    this.events.push(...structuredClone(events));
  }

  async count() {
    return this.events.length;
  }
}

class NeonEventStore implements EventStore {
  mode = "postgres" as const;
  durable = true;
  private sql: ReturnType<typeof neon>;
  private initialized = false;

  constructor(databaseUrl: string) {
    this.sql = neon(databaseUrl);
  }

  private async ensureSchema() {
    if (this.initialized) return;
    await this.sql`
      CREATE TABLE IF NOT EXISTS discovery_compass_events (
        event_id UUID PRIMARY KEY,
        session_id UUID NOT NULL,
        event_name TEXT NOT NULL,
        condition TEXT NOT NULL CHECK (condition IN ('baseline', 'guided')),
        iteration INTEGER NOT NULL,
        catalog_version TEXT NOT NULL,
        ranking_version TEXT NOT NULL,
        model_version TEXT,
        properties JSONB NOT NULL,
        occurred_at TIMESTAMPTZ NOT NULL,
        received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await this.sql`
      CREATE INDEX IF NOT EXISTS discovery_compass_events_session_time
      ON discovery_compass_events (session_id, occurred_at)
    `;
    this.initialized = true;
  }

  async append(events: StudyEvent[]) {
    await this.ensureSchema();
    for (const event of events) {
      await this.sql`
        INSERT INTO discovery_compass_events (
          event_id, session_id, event_name, condition, iteration,
          catalog_version, ranking_version, model_version, properties, occurred_at
        ) VALUES (
          ${event.eventId}, ${event.sessionId}, ${event.eventName}, ${event.condition},
          ${event.iteration}, ${event.catalogVersion}, ${event.rankingVersion},
          ${event.modelVersion ?? null}, ${JSON.stringify(event.properties)}::jsonb,
          ${event.occurredAt}::timestamptz
        ) ON CONFLICT (event_id) DO NOTHING
      `;
    }
  }

  async count() {
    await this.ensureSchema();
    const rows = await this.sql`SELECT COUNT(*)::int AS count FROM discovery_compass_events`;
    if (!Array.isArray(rows)) return 0;
    const first = rows[0] as { count?: number } | undefined;
    return Number(first?.count ?? 0);
  }
}

const memoryStore = new MemoryEventStore();
let neonStore: NeonEventStore | undefined;

export function getEventStore(): EventStore {
  if (process.env.EVENT_STORE_MODE === "postgres") {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required for postgres event storage");
    if (!neonStore) neonStore = new NeonEventStore(process.env.DATABASE_URL);
    return neonStore;
  }
  return memoryStore;
}

export function getEventStoreStatus() {
  const requestedMode = process.env.EVENT_STORE_MODE ?? "memory";
  return {
    requestedMode,
    configured: requestedMode === "memory" || Boolean(process.env.DATABASE_URL),
    durable: requestedMode === "postgres" && Boolean(process.env.DATABASE_URL)
  };
}
