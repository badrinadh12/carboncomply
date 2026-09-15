-- ==============================================================================
-- CARBONCOMPLY — Supabase PostgreSQL Database Schema
-- Prototype Citizen Carbon Tracking & Government Compliance Platform
-- ==============================================================================

-- 1. Activities Table
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('car', 'bus', 'flight', 'electricity', 'veg_meal', 'non_veg_meal')),
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL,
  emission_factor NUMERIC NOT NULL,
  co2_kg NUMERIC NOT NULL,
  activity_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for high-performance date filtering and weekly queries
CREATE INDEX IF NOT EXISTS idx_activities_activity_date ON activities (activity_date);
CREATE INDEX IF NOT EXISTS idx_activities_activity_type ON activities (activity_type);

-- 2. User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  personal_weekly_target NUMERIC NOT NULL DEFAULT 100.00 CHECK (personal_weekly_target > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default user settings if not exists
INSERT INTO user_settings (id, personal_weekly_target)
VALUES ('default', 100.00)
ON CONFLICT (id) DO NOTHING;

-- 3. Compliance Weeks Snapshot Table
CREATE TABLE IF NOT EXISTS compliance_weeks (
  id TEXT PRIMARY KEY,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  total_co2 NUMERIC NOT NULL DEFAULT 0.00,
  government_threshold NUMERIC NOT NULL DEFAULT 100.00,
  exceeded BOOLEAN NOT NULL DEFAULT FALSE,
  first_violation BOOLEAN NOT NULL DEFAULT FALSE,
  fee_amount NUMERIC NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_weeks_week_start ON compliance_weeks (week_start);

-- 4. Enable Row Level Security (RLS)
-- As per hackathon brief, no authentication/login is used.
-- Public read/write policies are enabled for this citizen prototype.
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_weeks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public citizen access to activities" ON activities
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public citizen access to user_settings" ON user_settings
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public citizen access to compliance_weeks" ON compliance_weeks
  FOR ALL USING (true) WITH CHECK (true);
