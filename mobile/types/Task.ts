export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  reminderAt?: Date | null;
  repeat?: 'daily' | 'weekly' | 'monthly' | 'none';
  notificationId?: string;
}
