import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { DatabaseConfig } from '@mytasks/core';
import { testDatabaseConnection } from '@mytasks/core';
import { cn } from '@/lib/utils';

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
        } catch {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-lg">
                <div className="flex items-center justify-between border-b border-border p-6">
                    <h2 className="text-lg font-semibold tracking-tight">Database Configuration</h2>
                    <button
                        className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            API URL
                        </label>
                        <input
                            type="url"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="https://your-project.supabase.co/rest/v1"
                            value={apiUrl}
                            onChange={(e) => setApiUrl(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Anon Key
                        </label>
                        <input
                            type="password"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Your anon/public key"
                            value={anonKey}
                            onChange={(e) => setAnonKey(e.target.value)}
                        />
                    </div>

                    {testResult && (
                        <div className={cn(
                            "rounded-md p-3 text-sm font-medium",
                            testResult.success ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                        )}>
                            {testResult.message}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            className="inline-flex h-10 flex-1 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                            onClick={handleTestConnection}
                            disabled={!apiUrl || !anonKey || isTesting}
                        >
                            {isTesting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Testing...
                                </>
                            ) : (
                                'Test Connection'
                            )}
                        </button>

                        <button
                            className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
                            onClick={handleSave}
                            disabled={!apiUrl || !anonKey || isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
