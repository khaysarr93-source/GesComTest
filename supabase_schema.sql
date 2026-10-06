-- ==============================================================================
-- FOX GESCOM - SCHEMA SUPABASE (PostgreSQL)
-- Exécutez ce script dans l'éditeur SQL de votre tableau de bord Supabase (SQL Editor)
-- ==============================================================================

-- 1. Table Paramètres Entreprise & Configuration
CREATE TABLE IF NOT EXISTS company_info (
  id TEXT PRIMARY KEY DEFAULT 'current',
  name TEXT NOT NULL DEFAULT 'FOX GESCOM SÉNÉGAL',
  slogan TEXT DEFAULT 'Solutions de Gestion & Fournitures Professionnelles',
  phone TEXT DEFAULT '+221 33 824 00 00',
  email TEXT DEFAULT 'contact@entreprise.sn',
  website TEXT DEFAULT 'www.entreprise.sn',
  city TEXT DEFAULT 'Dakar, Sénégal',
  address TEXT DEFAULT 'Immeuble Horizon, Rue 12 x Boulevard de la République',
  ninea TEXT DEFAULT '0068429 2G3',
  rc TEXT DEFAULT 'SN-DKR-2026-B-1284',
  is_vat_subject BOOLEAN DEFAULT true,
  vat_rate NUMERIC DEFAULT 18,
  currency TEXT DEFAULT 'FCFA',
  prefix_invoice TEXT DEFAULT 'F',
  prefix_quote TEXT DEFAULT 'D',
  prefix_delivery TEXT DEFAULT 'BL',
  prefix_po TEXT DEFAULT 'CF',
  prefix_reception TEXT DEFAULT 'BR',
  logo TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table Produits & Stock
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  cost_price NUMERIC DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table Clients
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  city TEXT DEFAULT '',
  address TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table Fournisseurs
CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  city TEXT DEFAULT '',
  address TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Table Factures de Vente (Orders)
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  client_id TEXT,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'En attente',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  discount NUMERIC DEFAULT 0,
  tva_rate NUMERIC DEFAULT 18,
  paid_amount NUMERIC DEFAULT 0,
  payments JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Table Devis (Quotes)
CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY,
  client_id TEXT,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'Envoyé',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  discount NUMERIC DEFAULT 0,
  tva_rate NUMERIC DEFAULT 18,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Table Commandes Fournisseurs (Purchase Orders)
CREATE TABLE IF NOT EXISTS purchase_orders (
  id TEXT PRIMARY KEY,
  supplier_id TEXT,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'Commandé',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Table Bons de Réception (Stock Receptions)
CREATE TABLE IF NOT EXISTS receptions (
  id TEXT PRIMARY KEY,
  purchase_order_id TEXT,
  supplier_id TEXT,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Table Bons de Livraison (Delivery Notes)
CREATE TABLE IF NOT EXISTS delivery_notes (
  id TEXT PRIMARY KEY,
  order_id TEXT,
  client_id TEXT,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'En préparation',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS & Policies
ALTER TABLE company_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE receptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_notes ENABLE ROW LEVEL SECURITY;

DO $
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'company_info' AND policyname = 'Allow public read/write company_info') THEN
    CREATE POLICY Allow public read/write company_info ON company_info FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Allow public read/write products') THEN
    CREATE POLICY Allow public read/write products ON products FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Allow public read/write clients') THEN
    CREATE POLICY Allow public read/write clients ON clients FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'suppliers' AND policyname = 'Allow public read/write suppliers') THEN
    CREATE POLICY Allow public read/write suppliers ON suppliers FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Allow public read/write orders') THEN
    CREATE POLICY Allow public read/write orders ON orders FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotes' AND policyname = 'Allow public read/write quotes') THEN
    CREATE POLICY Allow public read/write quotes ON quotes FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'purchase_orders' AND policyname = 'Allow public read/write purchase_orders') THEN
    CREATE POLICY Allow public read/write purchase_orders ON purchase_orders FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'receptions' AND policyname = 'Allow public read/write receptions') THEN
    CREATE POLICY Allow public read/write receptions ON receptions FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'delivery_notes' AND policyname = 'Allow public read/write delivery_notes') THEN
    CREATE POLICY Allow public read/write delivery_notes ON delivery_notes FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $;
