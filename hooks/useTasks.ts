import { useState, useEffect, useCallback } from 'react';
import { Task } from '../types/Task';
import { ApiService } from '../services/apiService';
import { getDatabaseConfig } from '../services/databaseConfigService';
import { DatabaseConfig } from '../types/DatabaseConfig';

export function useTasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [config, setConfig] = useState<DatabaseConfig | null>(null);

    // Load config and tasks on mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const dbConfig = await getDatabaseConfig();
            setConfig(dbConfig);

            if (dbConfig && dbConfig.apiUrl && dbConfig.anonKey) {
                const api = new ApiService(dbConfig);
                const fetchedTasks = await api.fetchTasks();
                setTasks(fetchedTasks);
            } else {
                setTasks([]);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            setTasks([]);
        } finally {
            setIsLoading(false);
        }
    };

    const addTask = useCallback(async (title: string) => {
        if (!config || !config.apiUrl || !config.anonKey) {
            alert('Please configure database settings first');
            return;
        }

        const api = new ApiService(config);
        setIsLoading(true);
        try {
            const newTask = await api.createTask(title);
            setTasks((prev) => [newTask, ...prev]);
        } catch (error) {
            console.error('Error adding task:', error);
            alert('Failed to add task');
        } finally {
            setIsLoading(false);
        }
    }, [config]);

    const toggleTask = useCallback(async (id: string) => {
        if (!config || !config.apiUrl || !config.anonKey) return;

        // Optimistic update
        setTasks((prev) =>
            prev.map((task) =>
                task.id === id ? { ...task, completed: !task.completed } : task
            )
        );

        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const api = new ApiService(config);
        try {
            await api.toggleTask(id, !task.completed);
        } catch (error) {
            console.error('Error updating task:', error);
            // Revert on failure
            setTasks((prev) =>
                prev.map((t) =>
                    t.id === id ? { ...t, completed: task.completed } : t
                )
            );
            alert('Failed to update task');
        }
    }, [config, tasks]);

    const deleteTask = useCallback(async (id: string) => {
        if (!config || !config.apiUrl || !config.anonKey) return;

        // Optimistic update
        const previousTasks = [...tasks];
        setTasks((prev) => prev.filter((task) => task.id !== id));

        const api = new ApiService(config);
        try {
            await api.deleteTask(id);
        } catch (error) {
            console.error('Error deleting task:', error);
            // Revert
            setTasks(previousTasks);
            alert('Failed to delete task');
        }
    }, [config, tasks]);

    const clearCompleted = useCallback(async () => {
        if (!config || !config.apiUrl || !config.anonKey) return;

        // Optimistic update
        const previousTasks = [...tasks];
        setTasks((prev) => prev.filter((task) => !task.completed));

        const api = new ApiService(config);
        try {
            await api.deleteCompletedTasks();
        } catch (error) {
            console.error('Error clearing completed tasks:', error);
            // Revert
            setTasks(previousTasks);
            alert('Failed to delete completed tasks');
        }
    }, [config, tasks]);

    const pendingTasks = tasks.filter((task) => !task.completed);
    const completedTasks = tasks.filter((task) => task.completed);

    return {
        tasks,
        pendingTasks,
        completedTasks,
        isLoading,
        addTask,
        toggleTask,
        deleteTask,
        clearCompleted,
        refresh: loadData, // Expose refresh to allow app to reload on config change
    };
}
