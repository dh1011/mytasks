import AsyncStorage from '@react-native-async-storage/async-storage';
import { DatabaseConfig } from '@mytasks/core';

const DB_CONFIG_KEY = '@mytasks:db_config';

export async function setDatabaseConfig(config: DatabaseConfig): Promise<void> {
    await AsyncStorage.setItem(DB_CONFIG_KEY, JSON.stringify(config));
}

export async function getDatabaseConfig(): Promise<DatabaseConfig | null> {
    const stored = await AsyncStorage.getItem(DB_CONFIG_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as DatabaseConfig;
}

export async function clearDatabaseConfig(): Promise<void> {
    await AsyncStorage.removeItem(DB_CONFIG_KEY);
}
