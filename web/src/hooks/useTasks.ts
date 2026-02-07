import { useState, useEffect, useCallback } from 'react';
import type { Task, DatabaseConfig } from '@mytasks/core';
import { ApiService } from '@mytasks/core';

export function useTasks(config: DatabaseConfig | null) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const loadTasks = useCallback(async (isInitialLoad = false) => {
        if (!config?.apiUrl || !config?.anonKey) return;

        if (isInitialLoad) {
            setIsLoading(true);
        }
        try {
            const api = new ApiService(config);
            const fetchedTasks = await api.fetchTasks();
            setTasks(fetchedTasks);
        } catch (error) {
            console.error('Error loading tasks:', error);
            setTasks([]);
        } finally {
            setIsLoading(false);
        }
    }, [config]);


    useEffect(() => {
        if (config?.apiUrl && config?.anonKey) {
            loadTasks(true);
        } else {
            setTasks([]);
            setIsLoading(false);
        }
    }, [config, loadTasks]);



    const addTask = useCallback(async (title: string) => {
        if (!config?.apiUrl || !config?.anonKey) {
            alert('Please configure database settings first');
            return;
        }

        const api = new ApiService(config);
        try {
            const newTask = await api.createTask(title);
            setTasks((prev) => [newTask, ...prev]);
        } catch (error) {
            console.error('Error adding task:', error);
            alert('Failed to add task');
        }
    }, [config]);

    const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
        if (!config?.apiUrl || !config?.anonKey) return;

        // Optimistic update
        const previousTasks = [...tasks];
        setTasks((prev) =>
            prev.map((task) =>
                task.id === id ? { ...task, ...updates } : task
            )
        );

        const api = new ApiService(config);
        try {
            await api.updateTask(id, updates);
        } catch (error) {
            console.error('Error updating task:', error);
            setTasks(previousTasks);
            alert('Failed to update task');
        }
    }, [config, tasks]);

    const toggleTask = useCallback(async (id: string) => {
        const task = tasks.find(t => t.id === id);
        if (task) {
            await updateTask(id, { completed: !task.completed });
        }
    }, [tasks, updateTask]);

    const deleteTask = useCallback(async (id: string) => {
        if (!config?.apiUrl || !config?.anonKey) return;

        // Optimistic update
        const previousTasks = [...tasks];
        setTasks((prev) => prev.filter((task) => task.id !== id));

        const api = new ApiService(config);
        try {
            await api.deleteTask(id);
        } catch (error) {
            console.error('Error deleting task:', error);
            setTasks(previousTasks);
            alert('Failed to delete task');
        }
    }, [config, tasks]);

    const clearCompleted = useCallback(async () => {
        if (!config?.apiUrl || !config?.anonKey) return;

        // Optimistic update
        const previousTasks = [...tasks];
        setTasks((prev) => prev.filter((task) => !task.completed));

        const api = new ApiService(config);
        try {
            await api.deleteCompletedTasks();
        } catch (error) {
            console.error('Error clearing completed tasks:', error);
            setTasks(previousTasks);
            alert('Failed to delete completed tasks');
        }
    }, [config, tasks]);

    // Reminder tasks: Not completed, has reminder. Sort by reminder time (soonest first).
    const reminderTasks = tasks
        .filter((task) => !task.completed && task.reminderAt)
        .sort((a, b) => {
            if (!a.reminderAt || !b.reminderAt) return 0;
            return new Date(a.reminderAt).getTime() - new Date(b.reminderAt).getTime();
        });

    // Inbox tasks: Not completed, no reminder. Sort by creation time (newest first).
    const inboxTasks = tasks
        .filter((task) => !task.completed && !task.reminderAt)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const completedTasks = tasks.filter((task) => task.completed);

    return {
        tasks,
        inboxTasks,
        reminderTasks,
        completedTasks,
        isLoading,
        addTask,
        updateTask,
        toggleTask,
        deleteTask,
        clearCompleted,
        refresh: () => loadTasks(false),
    };
}
