import { pool } from './database.js'

const sql = `
CREATE TABLE IF NOT EXISTS features (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  display_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS options (
  id SERIAL PRIMARY KEY,
  feature_id INT REFERENCES features(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  price_delta NUMERIC(10,2) NOT NULL DEFAULT 0,
  asset_url TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  UNIQUE(feature_id, slug)
);

CREATE TABLE IF NOT EXISTS custom_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  base_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  preview_image TEXT,
  submitted_by TEXT,
  submitted_on TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS item_options (
  id SERIAL PRIMARY KEY,
  custom_item_id INT REFERENCES custom_items(id) ON DELETE CASCADE,
  feature_id INT REFERENCES features(id) ON DELETE CASCADE,
  option_id INT REFERENCES options(id) ON DELETE CASCADE,
  UNIQUE(custom_item_id, feature_id)
);

CREATE TABLE IF NOT EXISTS incompatible_pairs (
  id SERIAL PRIMARY KEY,
  option_a INT REFERENCES options(id) ON DELETE CASCADE,
  option_b INT REFERENCES options(id) ON DELETE CASCADE,
  CHECK (option_a <> option_b),
  UNIQUE(option_a, option_b)
);

-- Seed features
INSERT INTO features (name, slug, display_order) VALUES
('Exterior', 'exterior', 1),
('Wheels', 'wheels', 2),
('Interior', 'interior', 3)
ON CONFLICT (slug) DO NOTHING;

-- Seed options (example)
INSERT INTO options (feature_id, name, slug, price_delta, asset_url, is_default)
SELECT f.id, 'Red', 'red', 0, NULL, TRUE FROM features f WHERE f.slug='exterior'
ON CONFLICT DO NOTHING;

INSERT INTO options (feature_id, name, slug, price_delta, asset_url)
SELECT f.id, 'Matte Black', 'matte_black', 150, NULL FROM features f WHERE f.slug='exterior'
ON CONFLICT DO NOTHING;

INSERT INTO options (feature_id, name, slug, price_delta, asset_url, is_default)
SELECT f.id, '18" Alloy', 'alloy_18', 0, NULL, TRUE FROM features f WHERE f.slug='wheels'
ON CONFLICT DO NOTHING;

INSERT INTO options (feature_id, name, slug, price_delta, asset_url)
SELECT f.id, '22" Chrome', 'chrome_22', 300, NULL FROM features f WHERE f.slug='wheels'
ON CONFLICT DO NOTHING;

INSERT INTO options (feature_id, name, slug, price_delta, asset_url, is_default)
SELECT f.id, 'Cloth', 'cloth', 0, NULL, TRUE FROM features f WHERE f.slug='interior'
ON CONFLICT DO NOTHING;

INSERT INTO options (feature_id, name, slug, price_delta, asset_url)
SELECT f.id, 'Leather', 'leather', 400, NULL FROM features f WHERE f.slug='interior'
ON CONFLICT DO NOTHING;

-- Sample incompatibility: matte_black ✖ chrome_22
INSERT INTO incompatible_pairs (option_a, option_b)
SELECT o1.id, o2.id
FROM options o1, options o2
WHERE o1.slug='matte_black' AND o2.slug='chrome_22'
ON CONFLICT DO NOTHING;
`;

async function reset() {
  await pool.query(sql)
  console.log('Database reset & seeded')
  process.exit(0)
}

reset().catch(err => {
  console.error(err)
  process.exit(1)
})
