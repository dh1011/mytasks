export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  reminderAt?: Date;
  repeat?: 'daily' | 'weekly' | 'monthly' | 'none';
  notificationId?: string;
}
