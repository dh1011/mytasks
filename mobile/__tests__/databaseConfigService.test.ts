import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    setDatabaseConfig,
    getDatabaseConfig,
    clearDatabaseConfig,
} from '../services/databaseConfigService';
import { DatabaseConfig } from '@mytasks/core';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('Database Configuration Service (BE-REQ-010 to BE-REQ-012)', () => {
    const testConfig: DatabaseConfig = {
        apiUrl: 'https://test.supabase.co/rest/v1',
        anonKey: 'test-anon-key',
    };

    beforeEach(async () => {
        await AsyncStorage.clear();
        jest.clearAllMocks();
    });

    // BE-REQ-010: Set Database Configuration
    describe('BE-REQ-010: Set Database Configuration', () => {
        it('saves configuration to storage', async () => {
            await setDatabaseConfig(testConfig);

            const stored = await AsyncStorage.getItem('@mytasks:db_config');
            expect(stored).not.toBeNull();

            const parsed = JSON.parse(stored!);
            expect(parsed.apiUrl).toBe('https://test.supabase.co/rest/v1');
            expect(parsed.anonKey).toBe('test-anon-key');
        });
    });

    // BE-REQ-011: Get Database Configuration
    describe('BE-REQ-011: Get Database Configuration', () => {
        it('returns null when no configuration exists', async () => {
            const config = await getDatabaseConfig();
            expect(config).toBeNull();
        });

        it('returns stored configuration object', async () => {
            await setDatabaseConfig(testConfig);

            const config = await getDatabaseConfig();

            expect(config).not.toBeNull();
            expect(config?.apiUrl).toBe('https://test.supabase.co/rest/v1');
            expect(config?.anonKey).toBe('test-anon-key');
        });
    });

    // BE-REQ-012: Clear Database Configuration
    describe('BE-REQ-012: Clear Database Configuration', () => {
        it('removes stored configuration', async () => {
            await setDatabaseConfig(testConfig);

            // Verify it's stored
            const beforeClear = await getDatabaseConfig();
            expect(beforeClear).not.toBeNull();

            // Clear it
            await clearDatabaseConfig();

            // Verify it's gone
            const afterClear = await getDatabaseConfig();
            expect(afterClear).toBeNull();
        });

        it('does not throw when no configuration exists', async () => {
            // Should not throw
            await expect(clearDatabaseConfig()).resolves.not.toThrow();
        });
    });
});
