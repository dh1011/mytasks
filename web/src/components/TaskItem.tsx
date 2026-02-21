import { useState, useRef } from 'react';
import { Transition } from 'react-transition-group';
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

const COMPLETE_DURATION = 380;

export function TaskItem({ task, onToggle, onUpdate, onDelete, isExpanded, onExpand }: TaskItemProps) {
    const [tempTitle, setTempTitle] = useState(task.title);
    const [completing, setCompleting] = useState(false);
    const rowRef = useRef<HTMLDivElement>(null);

    const [prevTaskTitle, setPrevTaskTitle] = useState(task.title);

    if (task.title !== prevTaskTitle) {
        setPrevTaskTitle(task.title);
        setTempTitle(task.title);
    }

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!task.completed) {
            // Trigger the animation; onToggle is called via onEntered after COMPLETE_DURATION
            setCompleting(true);
        } else {
            onToggle(task.id);
        }
    };

    // Visually treat task as complete while the completion animation is running
    const showAsComplete = task.completed || completing;

    const hasReminder = task.reminderAt && new Date(task.reminderAt) > new Date();
    const isOverdue = task.reminderAt && new Date(task.reminderAt) <= new Date();

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
    };

    const handleClearReminder = () => {
        onUpdate(task.id, { reminderAt: undefined, repeat: 'none' });
    };

    const [showReminderModal, setShowReminderModal] = useState(false);

    return (
        <Transition
            in={completing}
            timeout={COMPLETE_DURATION}
            nodeRef={rowRef}
            onEntered={() => {
                // Animation has finished — actually move the task to completed
                onToggle(task.id);
            }}
        >
            {(state) => {
                const isAnimating = state === 'entering' || state === 'entered';

                return (
                    <div
                        ref={rowRef}
                        className={cn(
                            "group relative flex flex-col rounded-lg px-4 py-3 transition-colors duration-200 hover:bg-muted/50",
                            isAnimating && "animate-row-complete"
                        )}
                    >
                        <div className="flex items-start gap-3 w-full">
                            {/* Checkbox + particles */}
                            <div className="relative mt-0.5 shrink-0">
                                <button
                                    className={cn(
                                        "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-300",
                                        showAsComplete
                                            ? "border-accent bg-accent"
                                            : "border-muted-foreground/30 hover:border-accent hover:scale-110",
                                        isAnimating && "animate-check-ring"
                                    )}
                                    onClick={handleToggle}
                                    aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                                >
                                    {showAsComplete && (
                                        <Check
                                            className={cn(
                                                "h-3 w-3 text-accent-foreground",
                                                completing && "animate-check-pop"
                                            )}
                                            strokeWidth={3}
                                        />
                                    )}
                                </button>

                                {/* Particle burst — only rendered while completing */}
                                {completing && (
                                    <div
                                        className="pointer-events-none absolute inset-0 flex items-center justify-center"
                                        aria-hidden="true"
                                    >
                                        {[0, 1, 2, 3, 4, 5].map(i => (
                                            <span key={i} className={`particle particle-${i}`} />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0" onClick={onExpand}>
                                {isExpanded ? (
                                    <input
                                        type="text"
                                        className={cn(
                                            "w-full bg-transparent text-sm leading-relaxed outline-none border-b border-primary/20 pb-1",
                                            showAsComplete && "text-muted-foreground line-through"
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
                                        showAsComplete && !completing && "text-muted-foreground line-through",
                                        showAsComplete && completing && "animate-strike animate-text-fade",
                                        !showAsComplete && "text-foreground"
                                    )}>
                                        {task.title}
                                    </span>
                                )}

                                {task.reminderAt && (
                                    <div className={cn(
                                        "flex items-center gap-1 mt-1 text-xs",
                                        isOverdue ? "text-destructive" : "text-muted-foreground"
                                    )}>
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
                                onSave={(date, repeat) => { handleSaveReminder(date, repeat); setShowReminderModal(false); }}
                                onClear={() => { handleClearReminder(); setShowReminderModal(false); }}
                                onClose={() => setShowReminderModal(false)}
                            />
                        )}
                    </div>
                );
            }}
        </Transition>
    );
}
