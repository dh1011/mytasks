import type { Task } from '@mytasks/core';

export interface TaskGroup {
    label: string;
    tasks: Task[];
}

/**
 * Groups reminder tasks by their due date.
 * - Overdue tasks (reminderAt <= now) are all in a single "Overdue" group at the top.
 * - Remaining tasks are grouped by: Today, Tomorrow, day name (within 7 days), or formatted date.
 * Tasks within each group keep their original order.
 */
export function groupTasksByDate(tasks: Task[]): TaskGroup[] {
    const now = new Date();
    const today = stripTime(now);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const groups = new Map<string, TaskGroup>();

    for (const task of tasks) {
        if (!task.reminderAt) continue;

        const reminderDate = new Date(task.reminderAt);
        const reminderDay = stripTime(reminderDate);

        let label: string;

        if (reminderDate <= now) {
            label = 'Overdue';
        } else if (reminderDay.getTime() === today.getTime()) {
            label = 'Today';
        } else if (reminderDay.getTime() === tomorrow.getTime()) {
            label = 'Tomorrow';
        } else if (reminderDay < nextWeek) {
            label = reminderDate.toLocaleDateString([], { weekday: 'long' });
        } else {
            label = reminderDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }

        if (!groups.has(label)) {
            groups.set(label, { label, tasks: [] });
        }
        groups.get(label)!.tasks.push(task);
    }

    return Array.from(groups.values());
}

function stripTime(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}
