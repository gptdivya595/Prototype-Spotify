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
);

CREATE INDEX IF NOT EXISTS discovery_compass_events_session_time
  ON discovery_compass_events (session_id, occurred_at);
