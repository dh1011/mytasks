-- Create tasks table for PostgreSQL-compatible backend
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for ordering by created_at
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
