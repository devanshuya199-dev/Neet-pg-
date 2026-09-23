CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE college_type AS ENUM ('Govt','Private','Deemed','Central','DNB');
CREATE TYPE branch_type AS ENUM ('Clinical','ParaClinical','NonClinical');
CREATE TYPE counseling_round AS ENUM ('R1','R2','R3','Stray');
CREATE TYPE quota_type AS ENUM ('AIQ','State_Quota','DNB','Management','NRI','Central');
CREATE TYPE category_type AS ENUM ('UR','OBC','EWS','SC','ST','PwD');

CREATE TABLE colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  state VARCHAR(100) NOT NULL,
  college_type college_type NOT NULL,
  established_year INT,
  hospital_beds INT,
  stipend_year_1 NUMERIC(12,2),
  stipend_year_2 NUMERIC(12,2),
  stipend_year_3 NUMERIC(12,2),
  bond_years INT,
  bond_penalty_in_inr NUMERIC(14,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  type branch_type NOT NULL
);

CREATE TABLE cutoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  year INT NOT NULL CHECK (year BETWEEN 2020 AND 2100),
  counseling_round counseling_round NOT NULL,
  quota quota_type NOT NULL,
  category category_type NOT NULL,
  opening_rank INT NOT NULL CHECK (opening_rank > 0),
  closing_rank INT NOT NULL CHECK (closing_rank > 0),
  fee_per_annum NUMERIC(14,2) NOT NULL CHECK (fee_per_annum >= 0),
  source_url TEXT,
  verified_at TIMESTAMPTZ,
  is_mock BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(college_id, branch_id, year, counseling_round, quota, category)
);

CREATE TABLE marks_vs_rank_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INT NOT NULL,
  score INT NOT NULL,
  air_min INT NOT NULL,
  air_max INT NOT NULL,
  UNIQUE(year, score)
);

CREATE INDEX idx_cutoffs_lookup ON cutoffs(year, quota, category, branch_id, closing_rank);
CREATE INDEX idx_colleges_state_type ON colleges(state, college_type);
CREATE INDEX idx_marks_score_year ON marks_vs_rank_history(year, score);
