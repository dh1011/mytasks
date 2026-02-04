import { useState, useEffect, useCallback } from 'react';
import {
    setDatabaseConfig,
    getDatabaseConfig,
    clearDatabaseConfig,
} from '../services/databaseConfigService';
import { DatabaseConfig } from '@mytasks/core';

export function useDatabaseConfig() {
    const [config, setConfig] = useState<DatabaseConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load config on mount
    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            setIsLoading(true);
            const storedConfig = await getDatabaseConfig();
            setConfig(storedConfig);
            setError(null);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const saveConfig = useCallback(async (newConfig: DatabaseConfig) => {
        try {
            setIsSaving(true);
            setError(null);
            await setDatabaseConfig(newConfig);
            setConfig(newConfig);
            return true;
        } catch (e) {
            setError((e as Error).message);
            return false;
        } finally {
            setIsSaving(false);
        }
    }, []);

    const removeConfig = useCallback(async () => {
        try {
            setIsSaving(true);
            setError(null);
            await clearDatabaseConfig();
            setConfig(null);
            return true;
        } catch (e) {
            setError((e as Error).message);
            return false;
        } finally {
            setIsSaving(false);
        }
    }, []);

    return {
        config,
        isLoading,
        isSaving,
        error,
        saveConfig,
        removeConfig,
        refreshConfig: loadConfig,
    };
}
