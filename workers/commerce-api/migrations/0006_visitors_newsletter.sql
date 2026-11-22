CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','unsubscribed')),
  source TEXT NOT NULL DEFAULT 'footer',
  consent_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  unsubscribed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_newsletter_status_created ON newsletter_subscribers(status,created_at);
ALTER TABLE analytics_events ADD COLUMN country_code TEXT;
ALTER TABLE analytics_events ADD COLUMN city TEXT;
ALTER TABLE analytics_events ADD COLUMN region TEXT;
CREATE INDEX IF NOT EXISTS idx_analytics_geo ON analytics_events(country_code,city,created_at);
