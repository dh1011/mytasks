import React, { useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    StyleSheet,
    Keyboard,
} from 'react-native';
import { theme } from '../styles/theme';

interface AddTaskFormProps {
    onAdd: (title: string) => void;
    onClose: () => void;
}

export function AddTaskForm({ onAdd, onClose }: AddTaskFormProps) {
    const [title, setTitle] = useState('');

    const handleSubmit = () => {
        if (title.trim()) {
            onAdd(title);
            setTitle('');
            Keyboard.dismiss();
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="ADD A NEW TASK..."
                placeholderTextColor={theme.colors.textMuted}
                value={title}
                onChangeText={setTitle}
                onSubmitEditing={handleSubmit}
                returnKeyType="done"
                autoFocus={true}
                onBlur={onClose}
            />
            <TouchableOpacity
                style={[styles.button, !title.trim() && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={!title.trim()}
                activeOpacity={0.7}
            >
                <Text style={[styles.buttonText, !title.trim() && styles.buttonTextDisabled]}>
                    +
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        gap: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    input: {
        flex: 1,
        backgroundColor: theme.colors.surfaceElevated,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        fontSize: theme.fontSize.sm,
        color: theme.colors.text,
        letterSpacing: theme.letterSpacing.wide,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    button: {
        width: 48,
        height: 48,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.text,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.text,
    },
    buttonDisabled: {
        backgroundColor: 'transparent',
        borderColor: theme.colors.border,
    },
    buttonText: {
        color: theme.colors.background,
        fontSize: 24,
        fontWeight: theme.fontWeight.regular,
        lineHeight: 28,
    },
    buttonTextDisabled: {
        color: theme.colors.textMuted,
    },
});
