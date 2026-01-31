import * as Notifications from 'expo-notifications';
import { NotificationService } from '../services/NotificationService';

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
    setNotificationHandler: jest.fn(),
    scheduleNotificationAsync: jest.fn(),
    cancelScheduledNotificationAsync: jest.fn(),
    getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    SchedulableTriggerInputTypes: {
        DATE: 'date',
    },
}));

jest.mock('expo-device', () => ({
    isDevice: true, // This is less relevant now as we removed the check, but good for completeness of existing mocks
}));

describe('NotificationService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should schedule a notification', async () => {
        const id = 'task-123';
        const title = 'Test Task';
        const body = 'Reminder for Test Task';
        const date = new Date('2025-12-25T12:00:00Z');

        await NotificationService.scheduleNotification(id, title, body, date);

        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
            content: {
                title,
                body,
                data: { taskId: id },
            },
            trigger: {
                type: 'date',
                date,
            },
        });
    });

    it('should cancel a notification', async () => {
        const id = 'task-123';
        await NotificationService.cancelNotification(id);
        expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(id);
    });

    it('should request permissions if not granted', async () => {
        (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'undetermined' });
        (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'granted' });

        const result = await NotificationService.registerForPushNotificationsAsync();

        expect(result).toBe(true);
        expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    });
});
