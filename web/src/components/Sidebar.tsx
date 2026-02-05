import { Inbox, Bell, Settings, CheckSquare } from 'lucide-react';
import styles from './Sidebar.module.css';

interface SidebarProps {
    activeTab: 'inbox' | 'reminders';
    onTabChange: (tab: 'inbox' | 'reminders') => void;
    onOpenSettings: () => void;
    inboxCount: number;
    reminderCount: number;
    showCompleted: boolean;
    onToggleShowCompleted: () => void;
}

export function Sidebar({
    activeTab,
    onTabChange,
    onOpenSettings,
    inboxCount,
    reminderCount,
    showCompleted,
    onToggleShowCompleted
}: SidebarProps) {
    return (
        <div className={styles.sidebar}>
            <div className={styles.header}>
                <h1 className={styles.title}>MyTasks</h1>
            </div>

            <nav className={styles.nav}>
                <button
                    className={`${styles.navItem} ${activeTab === 'inbox' ? styles.active : ''}`}
                    onClick={() => onTabChange('inbox')}
                >
                    <div className={styles.iconLabel}>
                        <Inbox size={20} />
                        <span>Inbox</span>
                    </div>
                    {inboxCount > 0 && <span className={styles.badge}>{inboxCount}</span>}
                </button>

                <button
                    className={`${styles.navItem} ${activeTab === 'reminders' ? styles.active : ''}`}
                    onClick={() => onTabChange('reminders')}
                >
                    <div className={styles.iconLabel}>
                        <Bell size={20} />
                        <span>Reminders</span>
                    </div>
                    {reminderCount > 0 && <span className={styles.badge}>{reminderCount}</span>}
                </button>
            </nav>

            <div className={styles.footer}>
                <button
                    className={styles.footerItem}
                    onClick={onToggleShowCompleted}
                >
                    <CheckSquare size={20} className={showCompleted ? styles.activeIcon : ''} />
                    <span>{showCompleted ? 'Hide Completed' : 'Show Completed'}</span>
                </button>

                <button
                    className={styles.footerItem}
                    onClick={onOpenSettings}
                >
                    <Settings size={20} />
                    <span>Settings</span>
                </button>
            </div>
        </div>
    );
}
