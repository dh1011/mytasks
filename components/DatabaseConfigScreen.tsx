import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Switch,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useDatabaseConfig } from '../hooks/useDatabaseConfig';
import { DatabaseConfig } from '../types/DatabaseConfig';
import { theme } from '../styles/theme';

interface Props {
    onClose: () => void;
}

export function DatabaseConfigScreen({ onClose }: Props) {
    const { config, isLoading, isSaving, error, saveConfig, removeConfig } = useDatabaseConfig();

    const [host, setHost] = useState('');
    const [port, setPort] = useState('5432');
    const [database, setDatabase] = useState('');
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const [ssl, setSsl] = useState(true);

    // Load existing config into form
    useEffect(() => {
        if (config) {
            setHost(config.host);
            setPort(config.port.toString());
            setDatabase(config.database);
            setUser(config.user);
            setPassword(config.password);
            setSsl(config.ssl);
        }
    }, [config]);

    const handleSave = async () => {
        const portNum = parseInt(port, 10);
        if (isNaN(portNum)) {
            Alert.alert('Error', 'Port must be a number');
            return;
        }

        if (!host || !database || !user) {
            Alert.alert('Error', 'Host, database, and user are required');
            return;
        }

        const newConfig: DatabaseConfig = {
            host,
            port: portNum,
            database,
            user,
            password,
            ssl,
        };

        const success = await saveConfig(newConfig);
        if (success) {
            Alert.alert('Success', 'Database configuration saved');
        }
    };

    const handleClear = async () => {
        Alert.alert(
            'Clear Configuration',
            'Are you sure you want to remove the database configuration?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        await removeConfig();
                        setHost('');
                        setPort('5432');
                        setDatabase('');
                        setUser('');
                        setPassword('');
                        setSsl(true);
                    },
                },
            ]
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.title}>DATABASE CONFIG</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                <View style={styles.statusBar}>
                    <View style={[styles.statusDot, config ? styles.statusConnected : styles.statusDisconnected]} />
                    <Text style={styles.statusText}>
                        {config ? 'Remote database configured' : 'Using local storage'}
                    </Text>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>HOST</Text>
                    <TextInput
                        style={styles.input}
                        value={host}
                        onChangeText={setHost}
                        placeholder="localhost or db.example.com"
                        placeholderTextColor={theme.colors.textMuted}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>PORT</Text>
                    <TextInput
                        style={styles.input}
                        value={port}
                        onChangeText={setPort}
                        placeholder="5432"
                        placeholderTextColor={theme.colors.textMuted}
                        keyboardType="number-pad"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>DATABASE</Text>
                    <TextInput
                        style={styles.input}
                        value={database}
                        onChangeText={setDatabase}
                        placeholder="mytasks"
                        placeholderTextColor={theme.colors.textMuted}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>USER</Text>
                    <TextInput
                        style={styles.input}
                        value={user}
                        onChangeText={setUser}
                        placeholder="postgres"
                        placeholderTextColor={theme.colors.textMuted}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>PASSWORD</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••"
                        placeholderTextColor={theme.colors.textMuted}
                        secureTextEntry
                    />
                </View>

                <View style={styles.switchGroup}>
                    <Text style={styles.label}>USE SSL</Text>
                    <Switch
                        value={ssl}
                        onValueChange={setSsl}
                        trackColor={{ false: theme.colors.border, true: theme.colors.success }}
                        thumbColor={theme.colors.primary}
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.saveButton]}
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color={theme.colors.background} />
                        ) : (
                            <Text style={styles.saveButtonText}>SAVE CONFIGURATION</Text>
                        )}
                    </TouchableOpacity>

                    {config && (
                        <TouchableOpacity
                            style={[styles.button, styles.clearButton]}
                            onPress={handleClear}
                            disabled={isSaving}
                        >
                            <Text style={styles.clearButtonText}>CLEAR CONFIGURATION</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    closeButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        fontSize: theme.fontSize.xl,
        color: theme.colors.textSecondary,
    },
    title: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
        letterSpacing: theme.letterSpacing.wider,
    },
    placeholder: {
        width: 40,
    },
    form: {
        flex: 1,
    },
    formContent: {
        padding: theme.spacing.lg,
    },
    errorContainer: {
        backgroundColor: theme.colors.danger + '20',
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.sm,
        marginBottom: theme.spacing.lg,
    },
    errorText: {
        color: theme.colors.danger,
        fontSize: theme.fontSize.sm,
    },
    statusBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceElevated,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.sm,
        marginBottom: theme.spacing.xl,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: theme.spacing.sm,
    },
    statusConnected: {
        backgroundColor: theme.colors.success,
    },
    statusDisconnected: {
        backgroundColor: theme.colors.textMuted,
    },
    statusText: {
        color: theme.colors.textSecondary,
        fontSize: theme.fontSize.sm,
    },
    inputGroup: {
        marginBottom: theme.spacing.lg,
    },
    label: {
        fontSize: theme.fontSize.xs,
        fontWeight: theme.fontWeight.medium,
        color: theme.colors.textMuted,
        letterSpacing: theme.letterSpacing.wider,
        marginBottom: theme.spacing.sm,
    },
    input: {
        backgroundColor: theme.colors.surfaceElevated,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.sm,
        padding: theme.spacing.md,
        fontSize: theme.fontSize.md,
        color: theme.colors.text,
    },
    switchGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.xl,
    },
    buttonContainer: {
        gap: theme.spacing.md,
        marginTop: theme.spacing.lg,
    },
    button: {
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButton: {
        backgroundColor: theme.colors.primary,
    },
    saveButtonText: {
        color: theme.colors.background,
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.bold,
        letterSpacing: theme.letterSpacing.wider,
    },
    clearButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.danger,
    },
    clearButtonText: {
        color: theme.colors.danger,
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.bold,
        letterSpacing: theme.letterSpacing.wider,
    },
});
