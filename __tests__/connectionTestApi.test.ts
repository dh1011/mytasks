import { testDatabaseConnection } from '../services/connectionTestApi';
import { DatabaseConfig } from '../types/DatabaseConfig';

// Mock global fetch
const mockFetch = jest.fn();
// @ts-ignore
global.fetch = mockFetch;

describe('Database Configuration Validation (PostgREST)', () => {
    const validConfig: DatabaseConfig = {
        apiUrl: 'https://test.supabase.co/rest/v1',
        anonKey: 'test-anon-key',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockFetch.mockReset();
    });

    it('returns success for valid configuration (API reachable)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
        });

        const result = await testDatabaseConnection(validConfig);
        expect(result.success).toBe(true);
        expect(mockFetch).toHaveBeenCalledWith(
            'https://test.supabase.co/rest/v1/',
            expect.objectContaining({
                method: 'GET',
                headers: expect.objectContaining({
                    apikey: 'test-anon-key',
                }),
            })
        );
    });

    it('returns error when API is unreachable', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network request failed'));

        const result = await testDatabaseConnection(validConfig);
        expect(result.success).toBe(false);
        expect(result.error).toContain('Connection failed');
    });

    it('returns error when API returns non-ok status (e.g. 401 Unauthorized)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            statusText: 'Unauthorized',
        });

        const result = await testDatabaseConnection(validConfig);
        expect(result.success).toBe(false);
        expect(result.error).toContain('unreachable or unauthorized');
    });

    it('returns error when API URL is missing', async () => {
        const result = await testDatabaseConnection({ ...validConfig, apiUrl: '' });
        expect(result.success).toBe(false);
        expect(result.error).toBe('API URL is required');
    });

    it('returns error when Anon Key is missing', async () => {
        const result = await testDatabaseConnection({ ...validConfig, anonKey: '' });
        expect(result.success).toBe(false);
        expect(result.error).toBe('Anon Key is required');
    });

    it('returns error for invalid URL format', async () => {
        const result = await testDatabaseConnection({ ...validConfig, apiUrl: 'not-a-url' });
        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid API URL format');
    });
});
