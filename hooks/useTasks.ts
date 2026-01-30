import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types/Task';

const STORAGE_KEY = '@mytasks:tasks';

export function useTasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load tasks from storage on mount
    useEffect(() => {
        loadTasks();
    }, []);

    // Save tasks to storage whenever they change
    useEffect(() => {
        if (!isLoading) {
            saveTasks(tasks);
        }
    }, [tasks, isLoading]);

    const loadTasks = async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Convert date strings back to Date objects
                const tasksWithDates = parsed.map((task: any) => ({
                    ...task,
                    createdAt: new Date(task.createdAt),
                }));
                setTasks(tasksWithDates);
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveTasks = async (tasksToSave: Task[]) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasksToSave));
        } catch (error) {
            console.error('Error saving tasks:', error);
        }
    };

    const addTask = useCallback((title: string) => {
        const newTask: Task = {
            id: Date.now().toString(),
            title: title.trim(),
            completed: false,
            createdAt: new Date(),
        };
        setTasks((prev) => [newTask, ...prev]);
    }, []);

    const toggleTask = useCallback((id: string) => {
        setTasks((prev) =>
            prev.map((task) =>
                task.id === id ? { ...task, completed: !task.completed } : task
            )
        );
    }, []);

    const deleteTask = useCallback((id: string) => {
        setTasks((prev) => prev.filter((task) => task.id !== id));
    }, []);

    const clearCompleted = useCallback(() => {
        setTasks((prev) => prev.filter((task) => !task.completed));
    }, []);

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
    };
}
