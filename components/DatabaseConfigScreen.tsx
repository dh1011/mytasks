import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { theme } from '../styles/theme';
import { DatabaseConfig } from '../types/DatabaseConfig'; // Keep usage of types
import { useDatabaseConfig } from '../hooks/useDatabaseConfig';
import { testDatabaseConnection } from '../services/connectionTestApi';

interface Props {
    onClose: () => void;
}

export function DatabaseConfigScreen({ onClose }: Props) {
    const { config, saveConfig, isLoading } = useDatabaseConfig();

    // Local state for form inputs
    const [apiUrl, setApiUrl] = useState('');
    const [anonKey, setAnonKey] = useState('');

    const [isTesting, setIsTesting] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Update form and editing state when config loads
    useEffect(() => {
        if (!isLoading) {
            setApiUrl(config?.apiUrl || '');
            setAnonKey(config?.anonKey || '');
            setIsEditing(!config?.apiUrl);
        }
    }, [isLoading, config]);

    const handleSave = async () => {
        setConnectionError(null);
        setIsTesting(true);

        const newConfig: DatabaseConfig = {
            apiUrl: apiUrl.trim(),
            anonKey: anonKey.trim(),
        };

        try {
            const result = await testDatabaseConnection(newConfig);

            if (!result.success) {
                setConnectionError(result.error || 'Unknown connection error');
                Alert.alert('Connection Failed', result.error || 'Could not connect to the API.');
            } else {
                // Connection successful, save the config
                const success = await saveConfig(newConfig);
                if (success) {
                    Alert.alert('Success', 'API connection verified and configuration saved');
                    setIsEditing(false);
                } else {
                    Alert.alert('Error', 'Failed to save configuration');
                }
            }
        } catch (error) {
            setConnectionError((error as Error).message);
            Alert.alert('Error', 'An unexpected error occurred during validation');
        } finally {
            setIsTesting(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setConnectionError(null);
    };

    const handleCancel = () => {
        setApiUrl(config?.apiUrl || '');
        setAnonKey(config?.anonKey || '');
        setIsEditing(false);
        setConnectionError(null);
    };

    const renderSavedConfig = () => (
        <View style={styles.savedConfigContainer}>
            <View style={styles.savedConfigRow}>
                <Text style={styles.savedConfigLabel}>API URL</Text>
                <Text style={styles.savedConfigValue} numberOfLines={2}>
                    {config?.apiUrl}
                </Text>
            </View>
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
        </View>
    );

    const renderEditForm = () => (
        <>
            {connectionError && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Error: {connectionError}</Text>
                </View>
            )}

            <View style={styles.formGroup}>
                <Text style={styles.label}>API URL</Text>
                <TextInput
                    style={styles.input}
                    value={apiUrl}
                    onChangeText={setApiUrl}
                    placeholder="https://your-project.supabase.co/rest/v1"
                    placeholderTextColor={theme.colors.textMuted}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                <Text style={styles.hint}>The base URL of your REST API.</Text>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>MyTasks Anon Key</Text>
                <TextInput
                    style={styles.input}
                    value={anonKey}
                    onChangeText={setAnonKey}
                    placeholder="eyJhbG..."
                    placeholderTextColor={theme.colors.textMuted}
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry
                />
                <Text style={styles.hint}>The public 'anon' key for your project.</Text>
            </View>

            <TouchableOpacity
                style={[styles.saveButton, isTesting && styles.disabledButton]}
                onPress={handleSave}
                disabled={isTesting}
            >
                {isTesting ? (
                    <ActivityIndicator color={theme.colors.background} />
                ) : (
                    <Text style={styles.saveButtonText}>SAVE & CONNECT</Text>
                )}
            </TouchableOpacity>

            {config?.apiUrl && (
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
            )}
        </>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <Text style={styles.description}>
                    Connect to your PostgREST-compatible API (e.g., Supabase).
                </Text>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color={theme.colors.text} />
                    </View>
                ) : isEditing ? renderEditForm() : renderSavedConfig()}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerTitle: {
        fontSize: theme.fontSize.xl,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
    },
    closeButton: {
        padding: theme.spacing.sm,
    },
    closeButtonText: {
        fontSize: theme.fontSize.lg,
        color: theme.colors.text,
    },
    content: {
        flex: 1,
        padding: theme.spacing.lg,
    },
    description: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textMuted,
        marginBottom: theme.spacing.xl,
        lineHeight: 20,
    },
    formGroup: {
        marginBottom: theme.spacing.lg,
    },
    label: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.medium,
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    input: {
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        fontSize: theme.fontSize.md,
        color: theme.colors.text,
    },
    hint: {
        fontSize: 11,
        color: theme.colors.textMuted,
        marginTop: 4,
    },
    saveButton: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        marginTop: theme.spacing.xl,
    },
    disabledButton: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: theme.colors.background,
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.bold,
        letterSpacing: 1,
    },
    cancelButton: {
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        marginTop: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    cancelButtonText: {
        color: theme.colors.text,
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.medium,
    },
    savedConfigContainer: {
        backgroundColor: theme.colors.surfaceElevated,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.lg,
    },
    savedConfigRow: {
        marginBottom: theme.spacing.md,
    },
    savedConfigLabel: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: theme.spacing.xs,
    },
    savedConfigValue: {
        fontSize: theme.fontSize.md,
        color: theme.colors.text,
    },
    editButton: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.sm,
        alignItems: 'center',
        marginTop: theme.spacing.sm,
    },
    editButtonText: {
        color: theme.colors.background,
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.bold,
    },
    errorContainer: {
        backgroundColor: '#FFEBEE',
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.lg,
        borderWidth: 1,
        borderColor: '#FFCDD2',
    },
    errorText: {
        color: '#D32F2F',
        fontSize: theme.fontSize.sm,
    },
    loadingContainer: {
        padding: theme.spacing.xl,
        alignItems: 'center',
    },
});
