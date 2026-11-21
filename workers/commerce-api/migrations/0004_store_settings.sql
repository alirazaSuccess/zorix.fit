CREATE TABLE IF NOT EXISTS store_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT OR IGNORE INTO store_settings (key,value) VALUES
 ('store_name','ZORIX'),
 ('currency','PKR'),
 ('shipping_fee_paisa','0'),
 ('cod_enabled','true'),
 ('contact_email',''),
 ('contact_phone','');
