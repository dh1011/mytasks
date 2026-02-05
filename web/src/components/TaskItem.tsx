import { useState, useEffect } from 'react';
import { Check, Bell, Trash2 } from 'lucide-react';
import type { Task } from '@mytasks/core';
import { theme } from '../styles/theme';
import { ReminderModal } from './ReminderModal';
import styles from './TaskItem.module.css';

interface TaskItemProps {
    task: Task;
    onToggle: (id: string) => void;
    onUpdate: (id: string, updates: Partial<Task>) => void;
    onDelete: (id: string) => void;
    isExpanded: boolean;
    onExpand: () => void;
}

export function TaskItem({ task, onToggle, onUpdate, onDelete, isExpanded, onExpand }: TaskItemProps) {
    const [tempTitle, setTempTitle] = useState(task.title);
    const [showReminderModal, setShowReminderModal] = useState(false);

    useEffect(() => {
        setTempTitle(task.title);
    }, [task.title]);

    const hasReminder = task.reminderAt && new Date(task.reminderAt) > new Date();

    const formatReminder = (date: Date) => {
        const now = new Date();
        const reminderDate = new Date(date);
        const isToday = reminderDate.getDate() === now.getDate() &&
            reminderDate.getMonth() === now.getMonth() &&
            reminderDate.getFullYear() === now.getFullYear();

        const timeStr = reminderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (isToday) {
            return timeStr;
        }

        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        const isTomorrow = reminderDate.getDate() === tomorrow.getDate() &&
            reminderDate.getMonth() === tomorrow.getMonth() &&
            reminderDate.getFullYear() === tomorrow.getFullYear();

        if (isTomorrow) {
            return `Tomorrow, ${timeStr}`;
        }

        return `${reminderDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            onDelete(task.id);
        }
    };

    const handleSaveReminder = (date: Date, repeat: 'daily' | 'weekly' | 'monthly' | 'none') => {
        onUpdate(task.id, { reminderAt: date, repeat });
        setShowReminderModal(false);
    };

    const handleClearReminder = () => {
        onUpdate(task.id, { reminderAt: undefined, repeat: 'none' });
        setShowReminderModal(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.mainRow}>
                <button
                    className={styles.checkboxContainer}
                    onClick={() => onToggle(task.id)}
                    aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                    <div className={`${styles.checkbox} ${task.completed ? styles.checkboxCompleted : ''}`}>
                        {task.completed && <Check size={12} color={theme.colors.background} strokeWidth={4} />}
                    </div>
                </button>

                <div className={styles.content} onClick={onExpand}>
                    {isExpanded ? (
                        <input
                            type="text"
                            className={`${styles.titleInput} ${task.completed ? styles.titleCompleted : ''}`}
                            value={tempTitle}
                            onChange={(e) => setTempTitle(e.target.value)}
                            onBlur={() => onUpdate(task.id, { title: tempTitle.trim() })}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    onUpdate(task.id, { title: tempTitle.trim() });
                                    onExpand();
                                }
                            }}
                            autoFocus
                        />
                    ) : (
                        <span className={`${styles.title} ${task.completed ? styles.titleCompleted : ''}`}>
                            {task.title}
                        </span>
                    )}
                    {task.reminderAt && !isExpanded && (
                        <div className={styles.reminderIndicator}>
                            <span className={styles.reminderText}>
                                {formatReminder(new Date(task.reminderAt))}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className={styles.expandedControls}>
                    <button
                        className={`${styles.actionButton} ${hasReminder ? styles.activeActionButton : ''}`}
                        onClick={() => setShowReminderModal(true)}
                    >
                        <Bell
                            size={16}
                            color={hasReminder ? theme.colors.primary : theme.colors.textMuted}
                        />
                        <span className={`${styles.actionText} ${hasReminder ? styles.activeActionText : ''}`}>
                            {hasReminder
                                ? `${new Date(task.reminderAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${task.repeat && task.repeat !== 'none' ? ` (${task.repeat})` : ''}`
                                : 'Set Reminder'
                            }
                        </span>
                    </button>

                    <button className={styles.deleteButton} onClick={handleDelete}>
                        <Trash2 size={16} color={theme.colors.textMuted} />
                    </button>
                </div>
            )}

            {showReminderModal && (
                <ReminderModal
                    initialDate={task.reminderAt ? new Date(task.reminderAt) : new Date()}
                    initialRepeat={task.repeat || 'none'}
                    onSave={handleSaveReminder}
                    onClear={handleClearReminder}
                    onClose={() => setShowReminderModal(false)}
                />
            )}
        </div>
    );
}
