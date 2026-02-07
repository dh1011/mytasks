import { useState, useEffect, useRef } from 'react';
import { Check, Bell, Trash2 } from 'lucide-react';
import type { Task } from '@mytasks/core';
import { ReminderModal } from './ReminderModal';
import { cn } from '@/lib/utils';

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
    const [justToggled, setJustToggled] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setTempTitle(task.title);
    }, [task.title]);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setJustToggled(true);
        onToggle(task.id);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setJustToggled(false), 500);
    };

    const hasReminder = task.reminderAt && new Date(task.reminderAt) > new Date();

    const formatReminder = (date: Date) => {
        const now = new Date();
        const reminderDate = new Date(date);
        const isToday = reminderDate.getDate() === now.getDate() &&
            reminderDate.getMonth() === now.getMonth() &&
            reminderDate.getFullYear() === now.getFullYear();

        const timeStr = reminderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (isToday) return timeStr;

        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        const isTomorrow = reminderDate.getDate() === tomorrow.getDate() &&
            reminderDate.getMonth() === tomorrow.getMonth() &&
            reminderDate.getFullYear() === tomorrow.getFullYear();

        if (isTomorrow) return `Tomorrow, ${timeStr}`;

        return `${reminderDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
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
        <div className={cn(
            "group flex flex-col rounded-lg px-4 py-3 transition-colors duration-200 hover:bg-muted/50",
            justToggled && "bg-muted/30"
        )}>
            <div className="flex items-start gap-3 w-full">
                <button
                    className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300",
                        task.completed
                            ? "border-accent bg-accent"
                            : "border-muted-foreground/30 hover:border-accent hover:scale-110",
                        justToggled && task.completed && "animate-check-ring"
                    )}
                    onClick={handleToggle}
                    aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                    {task.completed && (
                        <Check
                            className={cn(
                                "h-3 w-3 text-accent-foreground",
                                justToggled && "animate-check-pop"
                            )}
                            strokeWidth={3}
                        />
                    )}
                </button>

                <div className="flex-1 min-w-0" onClick={onExpand}>
                    {isExpanded ? (
                        <input
                            type="text"
                            className={cn(
                                "w-full bg-transparent text-sm leading-relaxed outline-none border-b border-primary/20 pb-1",
                                task.completed && "text-muted-foreground line-through"
                            )}
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
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <span className={cn(
                            "block text-sm leading-relaxed transition-colors duration-300 cursor-pointer",
                            task.completed && !justToggled && "text-muted-foreground line-through",
                            task.completed && justToggled && "animate-strike animate-text-fade",
                            !task.completed && "text-foreground"
                        )}>
                            {task.title}
                        </span>
                    )}

                    {task.reminderAt && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Bell size={10} />
                            <span>{formatReminder(new Date(task.reminderAt))}</span>
                        </div>
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className="flex items-center gap-2 mt-3 pl-8 animate-in slide-in-from-top-2 duration-200">
                    <button
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                            hasReminder
                                ? "bg-primary/10 text-primary hover:bg-primary/20"
                                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                        )}
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowReminderModal(true);
                        }}
                    >
                        <Bell size={12} />
                        <span>
                            {hasReminder
                                ? `${new Date(task.reminderAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${task.repeat && task.repeat !== 'none' ? ` (${task.repeat})` : ''}`
                                : 'Set Reminder'
                            }
                        </span>
                    </button>

                    <button
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors ml-auto"
                        onClick={handleDelete}
                    >
                        <Trash2 size={12} />
                        <span>Delete</span>
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
