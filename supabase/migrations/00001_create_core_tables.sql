-- =============================================
-- CUSTOMERS TABLE
-- =============================================
CREATE TABLE customers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  phone         TEXT UNIQUE,
  email         TEXT UNIQUE,
  total_visits  INTEGER NOT NULL DEFAULT 0,
  total_spent   NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  points_balance INTEGER NOT NULL DEFAULT 0,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_customers_name ON customers USING gin (name gin_trgm_ops);
CREATE INDEX idx_customers_phone ON customers (phone);
CREATE INDEX idx_customers_email ON customers (email);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- POINTS TRANSACTIONS TABLE
-- =============================================
CREATE TYPE points_transaction_type AS ENUM ('earn', 'redeem', 'adjust');

CREATE TABLE points_transactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type          points_transaction_type NOT NULL,
  amount        INTEGER NOT NULL,
  description   TEXT,
  staff_note    TEXT,
  visit_amount  NUMERIC(10,2),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_points_tx_customer ON points_transactions (customer_id);
CREATE INDEX idx_points_tx_created ON points_transactions (created_at);

-- =============================================
-- REWARDS TABLE
-- =============================================
CREATE TABLE rewards (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT,
  points_cost   INTEGER NOT NULL CHECK (points_cost > 0),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_rewards_updated_at
  BEFORE UPDATE ON rewards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- CAMPAIGNS TABLE
-- =============================================
CREATE TYPE campaign_type AS ENUM ('sms', 'email');
CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'failed');

CREATE TABLE campaigns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  type            campaign_type NOT NULL,
  subject         TEXT,
  body            TEXT NOT NULL,
  segment_filter  JSONB,
  status          campaign_status NOT NULL DEFAULT 'draft',
  scheduled_at    TIMESTAMPTZ,
  sent_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- CAMPAIGN RECIPIENTS TABLE
-- =============================================
CREATE TYPE recipient_status AS ENUM ('pending', 'sent', 'failed', 'delivered', 'bounced');

CREATE TABLE campaign_recipients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id   UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  customer_id   UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  status        recipient_status NOT NULL DEFAULT 'pending',
  error_message TEXT,
  sent_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, customer_id)
);

CREATE INDEX idx_recipients_campaign ON campaign_recipients (campaign_id);
CREATE INDEX idx_recipients_customer ON campaign_recipients (customer_id);

-- =============================================
-- APP SETTINGS TABLE
-- =============================================
CREATE TABLE app_settings (
  key           TEXT PRIMARY KEY,
  value         JSONB NOT NULL,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO app_settings (key, value) VALUES
  ('points_earn_rate', '{"points_per_dollar": 1}'::jsonb),
  ('messaging_provider', '{"sms": null, "email": null}'::jsonb),
  ('store_info', '{"name": "Nail Store", "phone": "", "address": ""}'::jsonb);
