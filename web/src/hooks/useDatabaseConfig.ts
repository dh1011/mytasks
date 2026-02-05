import { useState, useEffect, useCallback } from 'react';
import type { DatabaseConfig } from '@mytasks/core';

const STORAGE_KEY = 'mytasks_db_config';

export function useDatabaseConfig() {
    const [config, setConfig] = useState<DatabaseConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = () => {
        setIsLoading(true);
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setConfig(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading config:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveConfig = useCallback(async (newConfig: DatabaseConfig) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
            setConfig(newConfig);
            return true;
        } catch (error) {
            console.error('Error saving config:', error);
            return false;
        }
    }, []);

    const clearConfig = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setConfig(null);
    }, []);

    return {
        config,
        isLoading,
        saveConfig,
        clearConfig,
        refresh: loadConfig,
    };
}
