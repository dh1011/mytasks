import { DatabaseConfig } from '../types/DatabaseConfig';
import { Task } from '../types/Task';

// PostgreSQL client for remote database operations
// This service uses the pg library for Node.js environments (test scripts)
// For React Native, you would need a REST API wrapper or Supabase client

import { Pool, PoolClient } from 'pg';

export class PostgresService {
    private pool: Pool;

    constructor(config: DatabaseConfig) {
        this.pool = new Pool({
            host: config.host,
            port: config.port,
            database: config.database,
            user: config.user,
            password: config.password,
            ssl: config.ssl ? { rejectUnauthorized: false } : false,
        });
    }

    async testConnection(): Promise<boolean> {
        let client: PoolClient | null = null;
        try {
            client = await this.pool.connect();
            await client.query('SELECT 1');
            return true;
        } catch (error) {
            throw new Error(`CONNECTION_ERROR: ${(error as Error).message}`);
        } finally {
            if (client) client.release();
        }
    }

    async createTask(title: string): Promise<Task> {
        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            throw new Error('INVALID_INPUT: Title cannot be empty');
        }

        const result = await this.pool.query(
            'INSERT INTO tasks (title) VALUES ($1) RETURNING id, title, completed, created_at',
            [trimmedTitle]
        );

        const row = result.rows[0];
        return {
            id: row.id,
            title: row.title,
            completed: row.completed,
            createdAt: new Date(row.created_at),
        };
    }

    async fetchTasks(): Promise<Task[]> {
        const result = await this.pool.query(
            'SELECT id, title, completed, created_at FROM tasks ORDER BY created_at DESC'
        );

        return result.rows.map((row) => ({
            id: row.id,
            title: row.title,
            completed: row.completed,
            createdAt: new Date(row.created_at),
        }));
    }

    async updateTask(taskId: string, completed: boolean): Promise<Task> {
        const result = await this.pool.query(
            'UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING id, title, completed, created_at',
            [completed, taskId]
        );

        if (result.rowCount === 0) {
            throw new Error('NOT_FOUND: Task does not exist');
        }

        const row = result.rows[0];
        return {
            id: row.id,
            title: row.title,
            completed: row.completed,
            createdAt: new Date(row.created_at),
        };
    }

    async deleteTask(taskId: string): Promise<void> {
        await this.pool.query('DELETE FROM tasks WHERE id = $1', [taskId]);
        // Idempotent: no error if task doesn't exist
    }

    async close(): Promise<void> {
        await this.pool.end();
    }
}
