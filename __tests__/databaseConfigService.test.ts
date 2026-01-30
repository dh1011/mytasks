import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    setDatabaseConfig,
    getDatabaseConfig,
    clearDatabaseConfig,
} from '../services/databaseConfigService';
import { DatabaseConfig } from '../types/DatabaseConfig';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('Database Configuration Service (BE-REQ-010 to BE-REQ-012)', () => {
    const testConfig: DatabaseConfig = {
        host: 'localhost',
        port: 5432,
        database: 'testdb',
        user: 'testuser',
        password: 'testpass',
        ssl: true,
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
            expect(parsed.host).toBe('localhost');
            expect(parsed.port).toBe(5432);
            expect(parsed.database).toBe('testdb');
            expect(parsed.user).toBe('testuser');
            expect(parsed.password).toBe('testpass');
            expect(parsed.ssl).toBe(true);
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
            expect(config?.host).toBe('localhost');
            expect(config?.port).toBe(5432);
            expect(config?.database).toBe('testdb');
            expect(config?.user).toBe('testuser');
            expect(config?.password).toBe('testpass');
            expect(config?.ssl).toBe(true);
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
