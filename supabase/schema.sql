-- ============================================================
-- Menú Semanal – Supabase schema
-- Run this SQL in the Supabase SQL Editor:
-- https://app.supabase.com/project/ayglsatakiocpwwnthui/sql
-- ============================================================

-- Single key-value table that stores all app data as JSONB
CREATE TABLE IF NOT EXISTS app_data (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Allow anonymous read/write (no auth required for this personal app)
ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all" ON app_data
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- The app will automatically populate these rows on first use:
--   key = 'recipes'  → array of recipe objects
--   key = 'history'  → object { "YYYY-MM-DD": { weekMenu } }
--   key = 'checked'  → array of checked ingredient keys
-- ============================================================
