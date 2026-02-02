import React, { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Alert,
    Modal,
    Pressable
} from 'react-native';
import { Task } from '../types/Task';
import { theme } from '../styles/theme';

interface TaskItemProps {
    task: Task;
    onToggle: (id: string) => void;
    onUpdate: (id: string, updates: Partial<Task>) => void;
    onDelete: (id: string) => void;
    isExpanded: boolean;
    onExpand: () => void;
}

import DateTimePicker from '@react-native-community/datetimepicker';
import { NotificationService } from '../services/NotificationService';

export function TaskItem({ task, onToggle, onUpdate, onDelete, isExpanded, onExpand }: TaskItemProps) {
    const [scaleAnim] = React.useState(() => new Animated.Value(1));
    const [showReminderModal, setShowReminderModal] = useState(false);

    // Temporary state for the modal
    const [tempDate, setTempDate] = useState<Date>(new Date());
    const [tempRepeat, setTempRepeat] = useState<'daily' | 'weekly' | 'monthly' | 'none'>('none');

    // Check if task has a future reminder
    const hasReminder = task.reminderAt && new Date(task.reminderAt) > new Date();

    const formatReminder = (date: Date) => {
        const now = new Date();
        const isToday = date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();

        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (isToday) {
            return timeStr;
        }

        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        const isTomorrow = date.getDate() === tomorrow.getDate() &&
            date.getMonth() === tomorrow.getMonth() &&
            date.getFullYear() === tomorrow.getFullYear();

        if (isTomorrow) {
            return `Tomorrow, ${timeStr}`;
        }

        return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
    };

    const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

    const handleExpand = () => {
        onExpand();
    };

    const openReminderModal = async () => {
        const hasPermission = await NotificationService.registerForPushNotificationsAsync();
        if (!hasPermission) {
            alert('Permission needed to show notifications');
            return;
        }

        // Initialize with existing values or defaults
        setTempDate(task.reminderAt ? new Date(task.reminderAt) : new Date());
        setTempRepeat(task.repeat || 'none');
        setPickerMode('date'); // Always start with date
        setShowReminderModal(true);
    };

    const saveReminder = async () => {
        setShowReminderModal(false);

        // Update DB first (Optimistic UI)
        onUpdate(task.id, {
            reminderAt: tempDate,
            repeat: tempRepeat
        });

        // Schedule user notification
        try {
            await NotificationService.scheduleNotification(
                task.id,
                'Task Reminder',
                task.title,
                tempDate,
                tempRepeat
            );
        } catch (error) {
            console.error('Failed to schedule notification:', error);
            // Optionally alert user, but don't block the data save
            // Alert.alert('Warning', 'Task saved but notification could not be scheduled.');
        }
    };

    const cancelReminder = async () => {
        // If we want to allow clearing the reminder, we might need a separate button.
        // For 'Cancel' button in modal, it just closes the modal without saving.
        setShowReminderModal(false);
    };

    const clearReminder = async () => {
        // Logic to clear reminder
        // Note: We might need a way to cancel the scheduled notification if we had the ID.
        // For now, we update DB.
        onUpdate(task.id, { reminderAt: undefined, repeat: 'none' });
        setShowReminderModal(false);
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
                { text: "Cancel", style: "cancel" },
                { text: "Delete", onPress: () => onDelete(task.id), style: "destructive" }
            ]
        );
    };

    return (
        <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.mainRow}>
                {/* Checkbox - separate hit area */}
                <TouchableOpacity
                    onPress={handleToggle}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={styles.checkboxContainer}
                >
                    <View style={[styles.checkbox, task.completed && styles.checkboxCompleted]}>
                        {task.completed && <Feather name="check" size={12} color={theme.colors.background} strokeWidth={4} />}
                    </View>
                </TouchableOpacity>

                {/* Task Title - Click to Expand */}
                <TouchableOpacity
                    style={styles.content}
                    onPress={handleExpand}
                    activeOpacity={1}
                >
                    <Text style={[styles.title, task.completed && styles.titleCompleted]}>
                        {task.title}
                    </Text>
                    {task.reminderAt && (
                        <View style={styles.reminderIndicator}>
                            <Text style={styles.reminderText}>
                                {formatReminder(new Date(task.reminderAt))}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Expanded Controls */}
            {isExpanded && (
                <View style={styles.expandedControls}>
                    <TouchableOpacity
                        style={[styles.actionButton, hasReminder && styles.activeActionButton]}
                        onPress={openReminderModal}
                    >
                        <View style={styles.reminderContainer}>
                            <Feather
                                name={hasReminder ? "bell" : "bell"}
                                size={16}
                                color={hasReminder ? theme.colors.primary : theme.colors.textMuted}
                            />
                            <Text style={[styles.actionText, hasReminder && styles.activeActionText]}>
                                {hasReminder
                                    ? `${new Date(task.reminderAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${task.repeat && task.repeat !== 'none' ? ` (${task.repeat})` : ''}`
                                    : "Set Reminder"
                                }
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleDelete}
                    >
                        <Feather name="trash-2" size={16} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                </View>
            )}

            {/* Reminder Config Modal */}
            <Modal
                transparent={true}
                visible={showReminderModal}
                animationType="fade"
                onRequestClose={() => setShowReminderModal(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setShowReminderModal(false)}>
                    <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
                        <Text style={styles.modalTitle}>Set Reminder</Text>

                        {/* Date & Time Picker */}
                        <View style={styles.pickerContainer}>
                            <View style={styles.pickerHeader}>
                                <Text style={styles.label}>
                                    {pickerMode === 'date' ? 'Date' : 'Time'}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setPickerMode(pickerMode === 'date' ? 'time' : 'date')}
                                    style={styles.switchButton}
                                >
                                    <Feather
                                        name={pickerMode === 'date' ? 'clock' : 'calendar'}
                                        size={14}
                                        color={theme.colors.primary}
                                    />
                                    <Text style={styles.switchButtonText}>
                                        {pickerMode === 'date' ? 'Set Time' : 'Set Date'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {pickerMode === 'date' ? (
                                <DateTimePicker
                                    testID="datePicker"
                                    value={tempDate}
                                    mode="date"
                                    display="inline"
                                    onChange={(event, date) => {
                                        if (date) {
                                            const newDate = new Date(tempDate);
                                            newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                                            setTempDate(newDate);
                                        }
                                    }}
                                    style={styles.calendarPicker}
                                    themeVariant="dark"
                                    accentColor={theme.colors.primary}
                                />
                            ) : (
                                <DateTimePicker
                                    testID="timePicker"
                                    value={tempDate}
                                    mode="time"
                                    is24Hour={true}
                                    display="spinner"
                                    onChange={(event, date) => {
                                        if (date) {
                                            const newDate = new Date(tempDate);
                                            newDate.setHours(date.getHours(), date.getMinutes());
                                            setTempDate(newDate);
                                        }
                                    }}
                                    style={styles.timePicker}
                                    textColor={theme.colors.text}
                                />
                            )}
                        </View>

                        {/* Repeat Options */}
                        <View style={styles.repeatContainer}>
                            <View style={styles.repeatOptions}>
                                {(['none', 'daily', 'weekly', 'monthly'] as const).map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={[
                                            styles.repeatOption,
                                            tempRepeat === option && styles.repeatOptionSelected
                                        ]}
                                        onPress={() => {
                                            setTempRepeat(option);
                                            // Requirements: "use current time but the next occurance in the repeat if datetime is not set"
                                            // If we are setting a repeat (not 'none') AND the task didn't already have a reminder
                                            // AND the user hasn't manually picked a date (we approximate this by checking if tempDate is roughly now
                                            // or we can track 'isDirty' state for date. For simplicity/robustness given the prompt:
                                            // "if datetime is not set" -> likely means if task.reminderAt was null.

                                            if (option !== 'none' && !task.reminderAt) {
                                                const now = new Date();
                                                // Create a new date based on 'now'
                                                const nextOccurrence = new Date(now);

                                                if (option === 'daily') {
                                                    nextOccurrence.setDate(now.getDate() + 1);
                                                } else if (option === 'weekly') {
                                                    nextOccurrence.setDate(now.getDate() + 7);
                                                } else if (option === 'monthly') {
                                                    nextOccurrence.setMonth(now.getMonth() + 1);
                                                }
                                                setTempDate(nextOccurrence);
                                            }
                                        }}
                                    >
                                        <Text style={[
                                            styles.repeatOptionText,
                                            tempRepeat === option && styles.repeatOptionTextSelected
                                        ]}>
                                            {option.charAt(0).toUpperCase() + option.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Modal Actions */}
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalButtonSecondary} onPress={clearReminder}>
                                <Text style={styles.modalButtonTextSecondary}>Clear</Text>
                            </TouchableOpacity>
                            <View style={{ flex: 1 }} />
                            <TouchableOpacity style={styles.modalButtonSecondary} onPress={cancelReminder}>
                                <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalButtonPrimary} onPress={saveReminder}>
                                <Text style={styles.modalButtonTextPrimary}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'transparent',
        marginHorizontal: theme.spacing.lg,
        marginVertical: theme.spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
        overflow: 'hidden', // Contain expanded content
    },
    mainRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.sm,
    },
    checkboxContainer: {
        paddingRight: theme.spacing.md,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: theme.colors.textMuted,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    checkboxCompleted: {
        backgroundColor: theme.colors.success,
        borderColor: theme.colors.success,
    },
    title: {
        fontSize: theme.fontSize.md,
        color: theme.colors.text,
        fontWeight: theme.fontWeight.regular,
    },
    titleCompleted: {
        color: theme.colors.textMuted,
        textDecorationLine: 'line-through',
    },
    expandedControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.sm,
        paddingBottom: theme.spacing.md,
        paddingTop: 0,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.xs,
        paddingHorizontal: theme.spacing.sm,
        borderRadius: theme.borderRadius.sm,
        backgroundColor: theme.colors.surfaceElevated,
    },
    activeActionButton: {
        backgroundColor: theme.colors.primaryLight + '20', // slight tint
    },
    reminderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionText: {
        marginLeft: theme.spacing.xs,
        fontSize: theme.fontSize.sm,
        color: theme.colors.textMuted,
    },
    activeActionText: {
        color: theme.colors.primary,
        fontWeight: theme.fontWeight.medium,
    },
    deleteButton: {
        padding: theme.spacing.xs,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.lg,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.lg,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
        textAlign: 'center',
    },
    label: {
        fontSize: theme.fontSize.md,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
        marginTop: theme.spacing.sm,
    },
    pickerContainer: {
        marginBottom: theme.spacing.md,
    },
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
        marginTop: theme.spacing.sm,
    },
    switchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.xs,
    },
    switchButtonText: {
        marginLeft: theme.spacing.xs,
        fontSize: theme.fontSize.sm,
        color: theme.colors.primary,
        fontWeight: theme.fontWeight.medium,
    },
    calendarPicker: {
        width: 320,
        height: 320,
        alignSelf: 'center',
    },
    timePicker: {
        height: 150,
        width: '100%',
    },
    repeatContainer: {
        marginBottom: theme.spacing.lg,
    },
    repeatOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: theme.spacing.xs,
    },
    repeatOption: {
        paddingVertical: theme.spacing.xs,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.borderRadius.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.background,
    },
    repeatOptionSelected: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primary,
    },
    repeatOptionText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.text,
    },
    repeatOptionTextSelected: {
        color: theme.colors.background, // Assuming white text on primary color
        fontWeight: theme.fontWeight.medium,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: theme.spacing.md,
    },
    modalButtonPrimary: {
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.borderRadius.sm,
        marginLeft: theme.spacing.sm,
    },
    modalButtonSecondary: {
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
    },
    modalButtonTextPrimary: {
        color: theme.colors.background,
        fontWeight: theme.fontWeight.bold,
        fontSize: theme.fontSize.md,
    },
    modalButtonTextSecondary: {
        color: theme.colors.textSecondary,
        fontSize: theme.fontSize.md,
    },
    reminderIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    reminderText: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textMuted,
        fontWeight: theme.fontWeight.regular,
    },
});
