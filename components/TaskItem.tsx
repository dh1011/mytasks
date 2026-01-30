import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
} from 'react-native';
import { Task } from '../types/Task';
import { theme } from '../styles/theme';

interface TaskItemProps {
    task: Task;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    const handleToggle = () => {
        // Animate the press
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.98,
                duration: 80,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 80,
                useNativeDriver: true,
            }),
        ]).start();

        onToggle(task.id);
    };

    return (
        <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity
                style={styles.content}
                onPress={handleToggle}
                activeOpacity={0.7}
            >
                {/* Linear iconography - thin outline checkbox */}
                <View style={[styles.checkbox, task.completed && styles.checkboxCompleted]}>
                    {task.completed && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.title, task.completed && styles.titleCompleted]}>
                    {task.title}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => onDelete(task.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Text style={styles.deleteText}>×</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        marginHorizontal: theme.spacing.lg,
        marginVertical: theme.spacing.xs,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: theme.colors.textMuted,
        marginRight: theme.spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxCompleted: {
        backgroundColor: theme.colors.success,
        borderColor: theme.colors.success,
    },
    checkmark: {
        color: theme.colors.background,
        fontSize: 12,
        fontWeight: theme.fontWeight.bold,
    },
    title: {
        flex: 1,
        fontSize: theme.fontSize.md,
        color: theme.colors.text,
        fontWeight: theme.fontWeight.regular,
        letterSpacing: theme.letterSpacing.normal,
    },
    titleCompleted: {
        color: theme.colors.textMuted,
        textDecorationLine: 'line-through',
    },
    deleteButton: {
        padding: theme.spacing.xs,
        marginLeft: theme.spacing.sm,
    },
    deleteText: {
        fontSize: 20,
        color: theme.colors.textMuted,
        fontWeight: theme.fontWeight.regular,
        lineHeight: 20,
    },
});
