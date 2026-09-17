-- Camera archive schema. Run automatically on server boot (see migrate.js) —
-- every statement is idempotent so it's safe to run on every deploy.

CREATE TABLE IF NOT EXISTS products (
  id_num BIGSERIAL PRIMARY KEY,
  id TEXT GENERATED ALWAYS AS ('CAM-' || lpad(id_num::text, 4, '0')) STORED,
  brand TEXT NOT NULL,
  series TEXT DEFAULT '',
  model TEXT NOT NULL,
  year INT,
  price NUMERIC(10, 2),
  megapixels NUMERIC(5, 1),
  optical_zoom NUMERIC(5, 1),
  digital_zoom NUMERIC(5, 1),
  storage TEXT DEFAULT 'Unknown',
  battery TEXT DEFAULT 'Unknown',
  display_inches NUMERIC(4, 1),
  video TEXT DEFAULT 'None',
  weight_grams INT,
  colorway TEXT NOT NULL DEFAULT 'silver',
  body_style TEXT NOT NULL DEFAULT 'compact',
  condition_body TEXT NOT NULL DEFAULT 'GOOD',
  condition_lens TEXT NOT NULL DEFAULT 'GOOD',
  condition_lcd TEXT NOT NULL DEFAULT 'GOOD',
  condition_overall NUMERIC(3, 1),
  status TEXT NOT NULL DEFAULT 'AVAILABLE',
  stock INT NOT NULL DEFAULT 0,
  accessories TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  serial TEXT,
  mystery JSONB,
  disabled BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_images (
  id BIGSERIAL PRIMARY KEY,
  product_id_num BIGINT NOT NULL REFERENCES products (id_num) ON DELETE CASCADE,
  position INT NOT NULL DEFAULT 0,
  mime_type TEXT NOT NULL,
  data BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS product_images_product_idx ON product_images (product_id_num, position);

CREATE TABLE IF NOT EXISTS orders (
  id_num BIGSERIAL PRIMARY KEY,
  code TEXT GENERATED ALWAYS AS ('ORD-' || lpad(id_num::text, 5, '0')) STORED,
  status TEXT NOT NULL DEFAULT 'pending',
  customer_name TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT,
  subtotal NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  payment_gateway TEXT,
  payment_authority TEXT,
  payment_amount_rial BIGINT,
  payment_ref TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_authority_idx ON orders (payment_authority);

CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id_num BIGINT NOT NULL REFERENCES orders (id_num) ON DELETE CASCADE,
  product_id_num BIGINT REFERENCES products (id_num) ON DELETE SET NULL,
  brand TEXT,
  model TEXT,
  unit_price NUMERIC(10, 2) NOT NULL,
  qty INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_set_updated_at ON products;
CREATE TRIGGER products_set_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS orders_set_updated_at ON orders;
CREATE TRIGGER orders_set_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
