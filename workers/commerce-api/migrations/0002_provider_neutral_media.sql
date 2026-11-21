-- Replace storage-provider-specific keys with provider-neutral identifiers.
ALTER TABLE product_images RENAME COLUMN r2_key TO storage_key;
ALTER TABLE media_assets RENAME COLUMN r2_key TO storage_key;
