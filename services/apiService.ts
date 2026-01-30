import { DatabaseConfig } from '../types/DatabaseConfig';
import { Task } from '../types/Task';

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
        return data.map((row: any) => ({
            id: row.id,
            title: row.title,
            completed: row.completed,
            createdAt: new Date(row.created_at),
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
        };
    }

    async toggleTask(id: string, completed: boolean): Promise<Task> {
        const response = await fetch(this.getUrl(`tasks?id=eq.${id}`), {
            method: 'PATCH',
            headers: this.headers,
            body: JSON.stringify({ completed }),
        });

        if (!response.ok) {
            throw new Error(`Failed to update task: ${response.statusText}`);
        }

        const data = await response.json();
        const row = data[0];

        return {
            id: row.id,
            title: row.title,
            completed: row.completed,
            createdAt: new Date(row.created_at),
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
}
