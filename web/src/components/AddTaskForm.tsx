import React, { useState } from 'react';
import { Plus, ArrowUp } from 'lucide-react';
import { theme } from '../styles/theme';
import styles from './AddTaskForm.module.css';

interface AddTaskFormProps {
    onAdd: (title: string) => void;
}

export function AddTaskForm({ onAdd }: AddTaskFormProps) {
    const [title, setTitle] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            onAdd(title.trim());
            setTitle('');
        }
    };

    return (
        <form
            className={`${styles.container} ${isFocused ? styles.containerFocused : ''}`}
            onSubmit={handleSubmit}
        >
            <div className={styles.iconWrapper}>
                <Plus size={20} className={styles.icon} />
            </div>

            <input
                type="text"
                className={styles.input}
                placeholder="Add a new task..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />

            <button
                type="submit"
                className={`${styles.submitButton} ${title.trim() ? styles.active : ''}`}
                disabled={!title.trim()}
                aria-label="Add task"
            >
                <ArrowUp size={20} color={theme.colors.background} strokeWidth={3} />
            </button>
        </form>
    );
}
