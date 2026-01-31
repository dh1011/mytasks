-- Create tasks table for PostgreSQL-compatible backend
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reminder_at TIMESTAMPTZ
);

-- Create index for ordering by created_at

-- Create index for ordering by created_at
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);

-- Create anonymous role for PostgREST
CREATE ROLE web_anon NOLOGIN;

-- Grant usage on schema to web_anon
GRANT USAGE ON SCHEMA public TO web_anon;

-- Grant permissions on tasks table
GRANT SELECT, INSERT, UPDATE, DELETE ON tasks TO web_anon;
