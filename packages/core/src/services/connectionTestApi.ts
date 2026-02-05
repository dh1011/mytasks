import type { DatabaseConfig } from '../types/DatabaseConfig';
import { ApiService } from './apiService';

export interface ConnectionTestResult {
    success: boolean;
    error?: string;
    warning?: string;
}

/**
 * Validates the database configuration by attempting to connect to the PostgREST API.
 */
export async function testDatabaseConnection(
    config: DatabaseConfig
): Promise<ConnectionTestResult> {
    // Basic Syntax Validation
    if (!config.apiUrl) return { success: false, error: 'API URL is required' };
    if (!config.anonKey) return { success: false, error: 'Anon Key is required' };

    try {
        // Validate URL format
        new URL(config.apiUrl);
    } catch {
        return { success: false, error: 'Invalid API URL format' };
    }

    // Network Reachability & Auth Check
    try {
        const api = new ApiService(config);
        const isConnected = await api.testConnection();

        if (isConnected) {
            return { success: true };
        } else {
            return { success: false, error: 'Connection failed: API unreachable or unauthorized' };
        }
    } catch (error) {
        return { success: false, error: `Connection failed: ${(error as Error).message}` };
    }
}
