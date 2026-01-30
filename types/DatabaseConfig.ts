export interface DatabaseConfig {
    /**
     * The base URL of the PostgREST API (e.g., Supabase REST URL).
     * Example: https://xyz.supabase.co/rest/v1
     */
    apiUrl: string;

    /**
     * The public anonymous key for API authorization.
     */
    anonKey: string;
}
