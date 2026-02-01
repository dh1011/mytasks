import React from 'react';
import { Feather } from '@expo/vector-icons';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Alert,
} from 'react-native';
import { Task } from '../types/Task';
import { theme } from '../styles/theme';

interface TaskItemProps {
    task: Task;
    onToggle: (id: string) => void;
    onUpdate: (id: string, updates: Partial<Task>) => void;
    onDelete: (id: string) => void;
}

import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { NotificationService } from '../services/NotificationService';

export function TaskItem({ task, onToggle, onUpdate, onDelete }: TaskItemProps) {
    const [scaleAnim] = React.useState(() => new Animated.Value(1));
    const [showDatePicker, setShowDatePicker] = React.useState(false);

    // Check if task has a future reminder
    const hasReminder = task.reminderAt && new Date(task.reminderAt) > new Date();

    const handleReminderConfig = async () => {
        const hasPermission = await NotificationService.registerForPushNotificationsAsync();
        if (!hasPermission) {
            alert('Permission needed to show notifications');
            return;
        }
        setShowDatePicker(true);
    };

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (event.type === 'set' && selectedDate) {
            // Schedule notification
            NotificationService.scheduleNotification(task.id, 'Task Reminder', task.title, selectedDate);
            // Update DB
            onUpdate(task.id, { reminderAt: selectedDate });
        }
    };


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

    const handleDelete = () => {
        Alert.alert(
            "Delete Task",
            "Are you sure you want to delete this task?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    onPress: () => onDelete(task.id),
                    style: "destructive"
                }
            ]
        );
    };

    return (
        <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.content}>
                {/* Linear iconography - thin outline checkbox */}
                <TouchableOpacity
                    onPress={handleToggle}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <View style={[styles.checkbox, task.completed && styles.checkboxCompleted]}>
                        {task.completed && <Feather name="check" size={12} color={theme.colors.background} strokeWidth={4} />}
                    </View>
                </TouchableOpacity>
                <Text style={[styles.title, task.completed && styles.titleCompleted]}>
                    {task.title}
                </Text>
            </View>

            <TouchableOpacity
                style={styles.actionButton}
                onPress={handleReminderConfig}
            >
                <View style={styles.reminderContainer}>
                    <View style={styles.actionIconContainer}>
                        {hasReminder ? (
                            <Feather name="bell" size={16} color={theme.colors.primary} />
                        ) : (
                            <Feather name="bell-off" size={16} color={theme.colors.textMuted} />
                        )}
                    </View>
                    {hasReminder && (
                        <Text style={styles.reminderText}>
                            {new Date(task.reminderAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    )}
                </View>
            </TouchableOpacity>

            {showDatePicker && (
                <DateTimePicker
                    value={task.reminderAt ? new Date(task.reminderAt) : new Date()}
                    mode="datetime"
                    is24Hour={true}
                    onChange={onDateChange}
                    minimumDate={new Date()}
                />
            )}
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Feather name="x" size={20} color={theme.colors.textMuted} />
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
    actionButton: {
        padding: theme.spacing.xs,
        marginLeft: theme.spacing.sm,
    },
    actionIconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    reminderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reminderText: {
        marginLeft: theme.spacing.xs,
        fontSize: theme.fontSize.xs,
        color: theme.colors.primary,
        fontWeight: theme.fontWeight.medium,
    },
    deleteButton: {
        padding: theme.spacing.xs,
        marginLeft: theme.spacing.sm,
    },
});
