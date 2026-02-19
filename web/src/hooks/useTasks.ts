import { useState, useEffect, useCallback, useRef } from 'react';
import type { Task, DatabaseConfig } from '@mytasks/core';
import { ApiService } from '@mytasks/core';

const PAGE_SIZE = 20;

type TabName = 'inbox' | 'reminders' | 'completed';

interface TabState {
    tasks: Task[];
    offset: number;
    hasMore: boolean;
    isLoading: boolean;
}

function emptyTab(): TabState {
    return { tasks: [], offset: 0, hasMore: true, isLoading: false };
}

function initialTabs(): Record<TabName, TabState> {
    return { inbox: emptyTab(), reminders: emptyTab(), completed: emptyTab() };
}

export function useTasks(config: DatabaseConfig | null, activeTab: 'inbox' | 'reminders', showCompleted: boolean) {
    const [tabs, setTabs] = useState<Record<TabName, TabState>>(initialTabs);
    const [initialLoading, setInitialLoading] = useState(true);

    const apiRef = useRef<ApiService | null>(null);
    useEffect(() => {
        if (config?.apiUrl && config?.anonKey) {
            apiRef.current = new ApiService(config);
        } else {
            apiRef.current = null;
        }
    }, [config]);

    // Refs for stable access in callbacks
    const tabsRef = useRef(tabs);
    tabsRef.current = tabs;
    const activeTabRef = useRef(activeTab);
    activeTabRef.current = activeTab;

    const fetchPage = useCallback(async (tab: TabName, offset: number): Promise<Task[]> => {
        const api = apiRef.current;
        if (!api) return [];
        switch (tab) {
            case 'inbox': return api.fetchInboxTasks(PAGE_SIZE, offset);
            case 'reminders': return api.fetchReminderTasks(PAGE_SIZE, offset);
            case 'completed': return api.fetchCompletedTasks(PAGE_SIZE, offset);
        }
    }, []);

    const loadFirstPage = useCallback(async (tab: TabName) => {
        setTabs(prev => ({
            ...prev,
            [tab]: { ...emptyTab(), isLoading: true },
        }));
        try {
            const tasks = await fetchPage(tab, 0);
            setTabs(prev => ({
                ...prev,
                [tab]: {
                    tasks,
                    offset: tasks.length,
                    hasMore: tasks.length >= PAGE_SIZE,
                    isLoading: false,
                },
            }));
        } catch (error) {
            console.error(`Error loading ${tab} tasks:`, error);
            setTabs(prev => ({
                ...prev,
                [tab]: { tasks: [], offset: 0, hasMore: false, isLoading: false },
            }));
        }
    }, [fetchPage]);

    const refreshAll = useCallback(() => {
        setTabs(initialTabs());
        loadFirstPage(activeTabRef.current);
    }, [loadFirstPage]);

    // Stable ref so callbacks can always call the latest refreshAll
    const refreshRef = useRef(refreshAll);
    refreshRef.current = refreshAll;

    // On mount / config change → load first page of active tab
    useEffect(() => {
        if (!config?.apiUrl || !config?.anonKey) {
            setTabs(initialTabs());
            setInitialLoading(false);
            return;
        }
        setInitialLoading(true);
        loadFirstPage(activeTab).then(() => setInitialLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config]);

    // Tab switching: load first page if tab hasn't been loaded yet
    useEffect(() => {
        if (!config?.apiUrl || !config?.anonKey) return;
        setTabs(prev => {
            const tabState = prev[activeTab];
            if (tabState.tasks.length === 0 && !tabState.isLoading && tabState.hasMore) {
                loadFirstPage(activeTab);
            }
            return prev;
        });
    }, [activeTab, config, loadFirstPage]);

    // Load completed tasks when showCompleted is turned on
    useEffect(() => {
        if (!showCompleted || !config?.apiUrl || !config?.anonKey) return;
        setTabs(prev => {
            const tabState = prev.completed;
            if (tabState.tasks.length === 0 && !tabState.isLoading && tabState.hasMore) {
                loadFirstPage('completed');
            }
            return prev;
        });
    }, [showCompleted, config, loadFirstPage]);

    const loadMore = useCallback(async (tab: TabName) => {
        const current = tabsRef.current[tab];
        if (!apiRef.current || current.isLoading || !current.hasMore) return;

        setTabs(prev => ({
            ...prev,
            [tab]: { ...prev[tab], isLoading: true },
        }));

        try {
            const newTasks = await fetchPage(tab, current.offset);
            setTabs(prev => ({
                ...prev,
                [tab]: {
                    tasks: [...prev[tab].tasks, ...newTasks],
                    offset: prev[tab].offset + newTasks.length,
                    hasMore: newTasks.length >= PAGE_SIZE,
                    isLoading: false,
                },
            }));
        } catch (error) {
            console.error(`Error loading more ${tab} tasks:`, error);
            setTabs(prev => ({
                ...prev,
                [tab]: { ...prev[tab], isLoading: false },
            }));
        }
    }, [fetchPage]);

    const addTask = useCallback(async (title: string) => {
        const api = apiRef.current;
        if (!api) {
            alert('Please configure database settings first');
            return;
        }
        try {
            const newTask = await api.createTask(title);
            setTabs(prev => ({
                ...prev,
                inbox: {
                    ...prev.inbox,
                    tasks: [newTask, ...prev.inbox.tasks],
                    offset: prev.inbox.offset + 1,
                },
            }));
        } catch (error) {
            console.error('Error adding task:', error);
            alert('Failed to add task');
        }
    }, []);

    const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
        const api = apiRef.current;
        if (!api) return;

        setTabs(prev => {
            const next = { ...prev };
            for (const tab of ['inbox', 'reminders', 'completed'] as TabName[]) {
                const idx = next[tab].tasks.findIndex(t => t.id === id);
                if (idx !== -1) {
                    const updatedTasks = [...next[tab].tasks];

                    // If setting a reminder on an inbox task, remove from inbox and invalidate reminders
                    if (tab === 'inbox' && updates.reminderAt !== undefined && updates.reminderAt !== null) {
                        updatedTasks.splice(idx, 1);
                        next.inbox = { ...next.inbox, tasks: updatedTasks, offset: next.inbox.offset - 1 };
                        next.reminders = emptyTab();
                    } else {
                        updatedTasks[idx] = { ...updatedTasks[idx], ...updates };
                        next[tab] = { ...next[tab], tasks: updatedTasks };
                    }
                    break;
                }
            }
            return next;
        });

        try {
            await api.updateTask(id, updates);
        } catch (error) {
            console.error('Error updating task:', error);
            alert('Failed to update task');
            refreshRef.current();
        }
    }, []);

    const toggleTask = useCallback(async (id: string) => {
        const api = apiRef.current;
        if (!api) return;

        let foundTask: Task | undefined;
        let foundTab: TabName | undefined;
        const currentTabs = tabsRef.current;
        for (const tab of ['inbox', 'reminders', 'completed'] as TabName[]) {
            const task = currentTabs[tab].tasks.find(t => t.id === id);
            if (task) {
                foundTask = task;
                foundTab = tab;
                break;
            }
        }
        if (!foundTask || !foundTab) return;

        const newCompleted = !foundTask.completed;

        setTabs(prev => {
            const next = { ...prev };
            next[foundTab!] = {
                ...next[foundTab!],
                tasks: next[foundTab!].tasks.filter(t => t.id !== id),
                offset: Math.max(0, next[foundTab!].offset - 1),
            };
            if (newCompleted) {
                next.completed = emptyTab();
            } else {
                next.inbox = emptyTab();
                next.reminders = emptyTab();
            }
            return next;
        });

        try {
            await api.updateTask(id, { completed: newCompleted });
        } catch (error) {
            console.error('Error toggling task:', error);
            alert('Failed to toggle task');
            refreshRef.current();
        }
    }, []);

    const deleteTask = useCallback(async (id: string) => {
        const api = apiRef.current;
        if (!api) return;

        setTabs(prev => {
            const next = { ...prev };
            for (const tab of ['inbox', 'reminders', 'completed'] as TabName[]) {
                const idx = next[tab].tasks.findIndex(t => t.id === id);
                if (idx !== -1) {
                    next[tab] = {
                        ...next[tab],
                        tasks: next[tab].tasks.filter(t => t.id !== id),
                        offset: Math.max(0, next[tab].offset - 1),
                    };
                    break;
                }
            }
            return next;
        });

        try {
            await api.deleteTask(id);
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Failed to delete task');
            refreshRef.current();
        }
    }, []);

    const clearCompleted = useCallback(async () => {
        const api = apiRef.current;
        if (!api) return;

        setTabs(prev => ({
            ...prev,
            completed: { tasks: [], offset: 0, hasMore: false, isLoading: false },
        }));

        try {
            await api.deleteCompletedTasks();
        } catch (error) {
            console.error('Error clearing completed tasks:', error);
            alert('Failed to delete completed tasks');
            refreshRef.current();
        }
    }, []);

    return {
        inboxTasks: tabs.inbox.tasks,
        reminderTasks: tabs.reminders.tasks,
        completedTasks: tabs.completed.tasks,
        isLoading: initialLoading,
        isLoadingMore: tabs[activeTab].isLoading && tabs[activeTab].tasks.length > 0,
        isLoadingCompleted: tabs.completed.isLoading,
        hasMore: tabs[activeTab].hasMore,
        hasMoreCompleted: tabs.completed.hasMore,
        addTask,
        updateTask,
        toggleTask,
        deleteTask,
        clearCompleted,
        loadMore: () => loadMore(activeTab),
        loadMoreCompleted: () => loadMore('completed'),
        refresh: refreshAll,
    };
}
