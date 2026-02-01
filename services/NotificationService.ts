import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export class NotificationService {
    static async registerForPushNotificationsAsync() {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return false;
        }
        return true;
    }

    static async scheduleNotification(id: string, title: string, body: string, triggerDate: Date, repeat: 'daily' | 'weekly' | 'monthly' | 'none' = 'none') {

        let notificationTrigger: any;

        if (repeat === 'none') {
            notificationTrigger = {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: triggerDate,
            };
        } else {
            // For recurring, we use calendar trigger
            notificationTrigger = {
                type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                hour: triggerDate.getHours(),
                minute: triggerDate.getMinutes(),
                repeats: true,
            };
            if (repeat === 'weekly') {
                notificationTrigger.weekday = triggerDate.getDay() + 1;
            } else if (repeat === 'monthly') {
                notificationTrigger.day = triggerDate.getDate();
            }
        }

        const identifier = await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data: { taskId: id },
            },
            trigger: notificationTrigger,
        });

        return identifier;
    }

    static async cancelNotification(notificationId: string) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
    }
}
