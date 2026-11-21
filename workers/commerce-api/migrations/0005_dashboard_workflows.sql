ALTER TABLE product_images ADD COLUMN delivery_url TEXT;
ALTER TABLE media_assets ADD COLUMN delivery_url TEXT;
CREATE INDEX IF NOT EXISTS idx_order_status_events_order ON order_status_events(order_id,created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at);
