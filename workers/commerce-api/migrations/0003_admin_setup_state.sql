CREATE TABLE IF NOT EXISTS store_setup (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  admin_created INTEGER NOT NULL DEFAULT 0 CHECK (admin_created IN (0,1)),
  completed_at TEXT
);
INSERT OR IGNORE INTO store_setup (id, admin_created) VALUES (1, 0);
