import { ApiService } from '../services/apiService';
import { DatabaseConfig } from '../types/DatabaseConfig';

// Mock global fetch
global.fetch = jest.fn();

describe('ApiService', () => {
    const mockConfig: DatabaseConfig = {
        apiUrl: 'http://localhost:3000',
        anonKey: 'should-be-ignored-if-no-dot',
    };

    let apiService: ApiService;

    beforeEach(() => {
        apiService = new ApiService(mockConfig);
        (global.fetch as jest.Mock).mockClear();
    });

    it('fetchTasks: success', async () => {
        const mockTasks = [
            { id: '1', title: 'Task 1', completed: false, created_at: '2023-01-01T00:00:00Z', reminder_at: null },
        ];
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockTasks,
        });

        const tasks = await apiService.fetchTasks();
        expect(tasks).toHaveLength(1);
        expect(tasks[0].title).toBe('Task 1');
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('tasks?order=created_at.desc'),
            expect.objectContaining({ method: 'GET' })
        );
    });

    it('updateTask: success', async () => {
        const mockTask = { id: '1', title: 'Updated', completed: true, created_at: '2023-01-01T00:00:00Z', reminder_at: '2025-01-01T00:00:00Z' };
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [mockTask],
        });

        const updated = await apiService.updateTask('1', { completed: true });
        expect(updated.completed).toBe(true);
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('tasks?id=eq.1'),
            expect.objectContaining({ method: 'PATCH' })
        );
    });

    it('updateTask: handles generic failure with response text', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 400,
            text: async () => 'Column reminder_at does not exist',
        });

        await expect(apiService.updateTask('1', { reminderAt: new Date() }))
            .rejects.toThrow('Failed to update task: 400 Column reminder_at does not exist');
    });

    it('updateTask: persists repeat field', async () => {
        const mockTask = {
            id: '1',
            title: 'Repeat Task',
            completed: false,
            created_at: '2023-01-01T00:00:00Z',
            reminder_at: '2025-01-01T00:00:00Z',
            repeat: 'daily'
        };
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [mockTask],
        });

        const updated = await apiService.updateTask('1', { repeat: 'daily' });
        expect(updated.repeat).toBe('daily');
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('tasks?id=eq.1'),
            expect.objectContaining({
                method: 'PATCH',
                body: expect.stringContaining('"repeat":"daily"')
            })
        );
    });

    it('updateTask: persists monthly repeat field', async () => {
        const mockTask = {
            id: '1',
            title: 'Monthly Task',
            completed: false,
            created_at: '2023-01-01T00:00:00Z',
            reminder_at: '2025-01-01T00:00:00Z',
            repeat: 'monthly'
        };
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [mockTask],
        });

        const updated = await apiService.updateTask('1', { repeat: 'monthly' });
        expect(updated.repeat).toBe('monthly');
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('tasks?id=eq.1'),
            expect.objectContaining({
                method: 'PATCH',
                body: expect.stringContaining('"repeat":"monthly"')
            })
        );
    });
});
