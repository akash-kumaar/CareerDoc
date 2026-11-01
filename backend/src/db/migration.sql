-- JobTrack migration
-- Creates the single opportunities table used by the application.

CREATE TABLE IF NOT EXISTS opportunities (
    id              SERIAL PRIMARY KEY,
    company_name    VARCHAR(255) NOT NULL,
    role_title      VARCHAR(255) NOT NULL,
    type            VARCHAR(20)  NOT NULL CHECK (type IN ('job', 'internship', 'freelance')),
    platform        VARCHAR(255),
    url             TEXT,
    location        VARCHAR(255),
    work_arrangement VARCHAR(20) CHECK (work_arrangement IN ('remote', 'hybrid', 'on-site')),
    salary          NUMERIC,
    currency        VARCHAR(10),
    status          VARCHAR(20)  NOT NULL DEFAULT 'saved'
                        CHECK (status IN ('saved', 'applied', 'interview', 'offer', 'rejected', 'closed')),
    applied_date    DATE,
    deadline        DATE,
    notes           TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_opportunities_type ON opportunities(type);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_work_arrangement ON opportunities(work_arrangement);
