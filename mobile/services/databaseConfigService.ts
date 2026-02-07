import AsyncStorage from '@react-native-async-storage/async-storage';
import { DatabaseConfig } from '@mytasks/core';

import { Platform } from 'react-native';

const DB_CONFIG_KEY = '@mytasks:db_config';

export async function setDatabaseConfig(config: DatabaseConfig): Promise<void> {
    await AsyncStorage.setItem(DB_CONFIG_KEY, JSON.stringify(config));
}

export async function getDatabaseConfig(): Promise<DatabaseConfig | null> {
    const stored = await AsyncStorage.getItem(DB_CONFIG_KEY);
    if (!stored) return null;

    const config = JSON.parse(stored) as DatabaseConfig;

    // Fix for Android Emulator using localhost
    if (Platform.OS === 'android' && config.apiUrl) {
        config.apiUrl = config.apiUrl
            .replace('localhost', '10.0.2.2')
            .replace('127.0.0.1', '10.0.2.2');
    }

    return config;
}

export async function clearDatabaseConfig(): Promise<void> {
    await AsyncStorage.removeItem(DB_CONFIG_KEY);
}
