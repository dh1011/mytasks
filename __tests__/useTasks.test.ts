import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useTasks } from '../hooks/useTasks';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () =>
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock getDatabaseConfig to return a valid config
jest.mock('../services/databaseConfigService', () => ({
    getDatabaseConfig: jest.fn().mockResolvedValue({
        apiUrl: 'https://mock.api.co',
        anonKey: 'mock-key',
    }),
}));

// Mock ApiService
const mockTasks = [
    { id: '1', title: 'Buy Groceries', completed: false, createdAt: new Date() },
];

const mockApiService = {
    fetchTasks: jest.fn().mockResolvedValue([]),
    createTask: jest.fn().mockResolvedValue(mockTasks[0]),
    toggleTask: jest.fn().mockResolvedValue({ ...mockTasks[0], completed: true }),
    updateTask: jest.fn().mockImplementation((id, updates) => Promise.resolve({ ...mockTasks[0], ...updates })),
    deleteTask: jest.fn().mockResolvedValue(undefined),
    deleteCompletedTasks: jest.fn().mockResolvedValue(undefined),
};

jest.mock('../services/apiService', () => ({
    ApiService: jest.fn().mockImplementation(() => mockApiService),
}));

describe('Backend SRS Requirements (via useTasks)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset fetchTasks to empty default
        mockApiService.fetchTasks.mockResolvedValue([]);
    });

    it('BE-REQ-001 & BE-REQ-004: Creates a valid task and persists it', async () => {
        const { result } = renderHook(() => useTasks());
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await act(async () => {
            await result.current.addTask('Buy Groceries');
        });

        // The hook uses functional state update based on previous state + new task
        // We mocked createTask to return the task
        expect(result.current.tasks).toHaveLength(1);
        expect(result.current.tasks[0].title).toBe('Buy Groceries');
        expect(mockApiService.createTask).toHaveBeenCalledWith('Buy Groceries');
    });

    it('BE-REQ-006: Toggles completion status', async () => {
        // Setup initial state: Hook fetches empty list, we add one manually via mock logic or just assert on flow
        // To make it easier, let's make fetchTasks return one item for this test
        mockApiService.fetchTasks.mockResolvedValue([mockTasks[0]]);

        const { result } = renderHook(() => useTasks());
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.tasks).toHaveLength(1); // Loaded from fetch

        const taskId = result.current.tasks[0].id;

        await act(async () => {
            await result.current.toggleTask(taskId);
        });

        expect(mockApiService.updateTask).toHaveBeenCalledWith(taskId, { completed: true });
        expect(result.current.tasks[0].completed).toBe(true);
    });

    it('BE-REQ-008: Deletes a task by ID', async () => {
        mockApiService.fetchTasks.mockResolvedValue([mockTasks[0]]);

        const { result } = renderHook(() => useTasks());
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        const taskId = result.current.tasks[0].id;

        await act(async () => {
            await result.current.deleteTask(taskId);
        });

        expect(mockApiService.deleteTask).toHaveBeenCalledWith(taskId);
        expect(result.current.tasks).toHaveLength(0);
    });
    it('BE-REQ-019: Deletes all completed tasks', async () => {
        const tasksWithCompleted = [
            { id: '1', title: 'Task 1', completed: true, createdAt: new Date() },
            { id: '2', title: 'Task 2', completed: false, createdAt: new Date() },
        ];
        mockApiService.fetchTasks.mockResolvedValue(tasksWithCompleted);

        const { result } = renderHook(() => useTasks());
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.tasks).toHaveLength(2);

        await act(async () => {
            await result.current.clearCompleted();
        });

        expect(mockApiService.deleteCompletedTasks).toHaveBeenCalled();
        // Optimistic update check
        expect(result.current.tasks).toHaveLength(1);
        expect(result.current.tasks[0].id).toBe('2');
    });
});
