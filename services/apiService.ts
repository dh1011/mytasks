import { DatabaseConfig } from '../types/DatabaseConfig';
import { Task } from '../types/Task';

interface TaskRow {
    id: string;
    title: string;
    completed: boolean;
    created_at: string;
    reminder_at: string | null;
}

export class ApiService {
    private config: DatabaseConfig;
    private headers: HeadersInit;

    constructor(config: DatabaseConfig) {
        this.config = config;
        this.headers = {
            'apikey': config.anonKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation', // Ask PostgREST to return the created/updated record
        };

        // Only add Authorization header if anonKey looks like a JWT token
        // PostgREST without JWT secret will fail if Authorization header is present
        if (config.anonKey && config.anonKey.includes('.')) {
            this.headers['Authorization'] = `Bearer ${config.anonKey}`;
        }
    }

    private getUrl(path: string): string {
        // Remove trailing slash from apiUrl if present, and leading slash from path
        const apiUrl = this.config.apiUrl || '';
        const baseUrl = apiUrl.replace(/\/$/, '');
        const cleanPath = path.replace(/^\//, '');
        return `${baseUrl}/${cleanPath}`;
    }

    async testConnection(): Promise<boolean> {
        try {
            // Fetch root to check reachability/auth
            // Supabase/PostgREST usually returns documented paths at root
            const response = await fetch(this.getUrl(''), {
                method: 'GET',
                headers: this.headers,
            });
            return response.ok;
        } catch (error) {
            console.error('Connection test failed:', error);
            return false;
        }
    }

    async fetchTasks(): Promise<Task[]> {
        const response = await fetch(this.getUrl('tasks?order=created_at.desc'), {
            method: 'GET',
            headers: this.headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch tasks: ${response.statusText}`);
        }

        const data = await response.json();

        // Map snake_case DB fields to camelCase Task model
        return data.map((row: TaskRow) => ({
            id: row.id,
            title: row.title,
            completed: row.completed,
            createdAt: new Date(row.created_at),
            reminderAt: row.reminder_at ? new Date(row.reminder_at) : undefined,
        }));
    }

    async createTask(title: string): Promise<Task> {
        const response = await fetch(this.getUrl('tasks'), {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({ title, completed: false }),
        });

        if (!response.ok) {
            throw new Error(`Failed to create task: ${response.statusText}`);
        }

        const data = await response.json();
        const row = data[0]; // PostgREST returns array of created items

        return {
            id: row.id,
            title: row.title,
            completed: row.completed,
            createdAt: new Date(row.created_at),
            reminderAt: row.reminder_at ? new Date(row.reminder_at) : undefined,
        };
    }

    async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
        const payload: Partial<TaskRow> = {};
        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.completed !== undefined) payload.completed = updates.completed;
        if (updates.reminderAt !== undefined) payload.reminder_at = updates.reminderAt ? updates.reminderAt.toISOString() : null;

        const response = await fetch(this.getUrl(`tasks?id=eq.${id}`), {
            method: 'PATCH',
            headers: this.headers,
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Update failed:', errorText);
            throw new Error(`Failed to update task: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        const row = data[0];

        return {
            id: row.id,
            title: row.title,
            completed: row.completed,
            createdAt: new Date(row.created_at),
            reminderAt: row.reminder_at ? new Date(row.reminder_at) : undefined,
        };
    }

    async deleteTask(id: string): Promise<void> {
        const response = await fetch(this.getUrl(`tasks?id=eq.${id}`), {
            method: 'DELETE',
            headers: this.headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to delete task: ${response.statusText}`);
        }
    }

    async deleteCompletedTasks(): Promise<void> {
        const response = await fetch(this.getUrl('tasks?completed=eq.true'), {
            method: 'DELETE',
            headers: this.headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to delete completed tasks: ${response.statusText}`);
        }
    }
}
