import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Task } from '../types/Task';
import { TaskItem } from './TaskItem';
import { theme } from '../styles/theme';

interface TaskListProps {
    tasks: Task[];
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
}

export function TaskList({ tasks, onToggle, onDelete }: TaskListProps) {
    if (tasks.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                    <Text style={styles.emptyIcon}>☐</Text>
                </View>
                <Text style={styles.emptyTitle}>NO TASKS YET</Text>
                <Text style={styles.emptySubtitle}>
                    Add a task above to get started
                </Text>
            </View>
        );
    }

    return (
        <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <TaskItem
                    task={item}
                    onToggle={onToggle}
                    onDelete={onDelete}
                />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
        />
    );
}

const styles = StyleSheet.create({
    listContent: {
        paddingVertical: theme.spacing.sm,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.xl,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.lg,
    },
    emptyIcon: {
        fontSize: 32,
        color: theme.colors.textMuted,
    },
    emptyTitle: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
        letterSpacing: theme.letterSpacing.wider,
        marginBottom: theme.spacing.sm,
    },
    emptySubtitle: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textMuted,
        textAlign: 'center',
        letterSpacing: theme.letterSpacing.normal,
    },
});
