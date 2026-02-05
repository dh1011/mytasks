import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { DatabaseConfig } from '@mytasks/core';
import { testDatabaseConnection } from '@mytasks/core';
import { theme } from '../styles/theme';
import styles from './DatabaseConfigPanel.module.css';

interface DatabaseConfigPanelProps {
    config: DatabaseConfig | null;
    onSave: (config: DatabaseConfig) => Promise<boolean>;
    onClose: () => void;
}

export function DatabaseConfigPanel({ config, onSave, onClose }: DatabaseConfigPanelProps) {
    const [apiUrl, setApiUrl] = useState('');
    const [anonKey, setAnonKey] = useState('');
    const [isTesting, setIsTesting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    useEffect(() => {
        if (config) {
            setApiUrl(config.apiUrl || '');
            setAnonKey(config.anonKey || '');
        }
    }, [config]);

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestResult(null);

        try {
            const result = await testDatabaseConnection({ apiUrl, anonKey });
            setTestResult({
                success: result.success,
                message: result.success ? 'Connection successful!' : result.error || 'Connection failed',
            });
        } catch (error) {
            setTestResult({
                success: false,
                message: 'Connection test failed',
            });
        } finally {
            setIsTesting(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const success = await onSave({ apiUrl, anonKey });
            if (success) {
                onClose();
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Database Configuration</h2>
                <button className={styles.closeButton} onClick={onClose}>
                    <X size={20} color={theme.colors.textMuted} />
                </button>
            </div>

            <div className={styles.form}>
                <div className={styles.field}>
                    <label className={styles.label}>API URL</label>
                    <input
                        type="url"
                        className={styles.input}
                        placeholder="https://your-project.supabase.co/rest/v1"
                        value={apiUrl}
                        onChange={(e) => setApiUrl(e.target.value)}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Anon Key</label>
                    <input
                        type="password"
                        className={styles.input}
                        placeholder="Your anon/public key"
                        value={anonKey}
                        onChange={(e) => setAnonKey(e.target.value)}
                    />
                </div>

                {testResult && (
                    <div className={`${styles.testResult} ${testResult.success ? styles.success : styles.error}`}>
                        {testResult.message}
                    </div>
                )}

                <div className={styles.actions}>
                    <button
                        className={styles.testButton}
                        onClick={handleTestConnection}
                        disabled={!apiUrl || !anonKey || isTesting}
                    >
                        {isTesting ? (
                            <>
                                <Loader2 size={16} className={styles.spinner} />
                                Testing...
                            </>
                        ) : (
                            'Test Connection'
                        )}
                    </button>

                    <button
                        className={styles.saveButton}
                        onClick={handleSave}
                        disabled={!apiUrl || !anonKey || isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
}
