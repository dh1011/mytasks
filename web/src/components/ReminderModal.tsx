import React, { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { theme } from '../styles/theme';
import styles from './ReminderModal.module.css';

interface ReminderModalProps {
    initialDate: Date;
    initialRepeat: 'daily' | 'weekly' | 'monthly' | 'none';
    onSave: (date: Date, repeat: 'daily' | 'weekly' | 'monthly' | 'none') => void;
    onClear: () => void;
    onClose: () => void;
}

export function ReminderModal({ initialDate, initialRepeat, onSave, onClear, onClose }: ReminderModalProps) {
    const [tempDate, setTempDate] = useState(initialDate);
    const [tempRepeat, setTempRepeat] = useState(initialRepeat);
    const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDateValue = e.target.value;
        const newDate = new Date(tempDate);
        const [year, month, day] = newDateValue.split('-').map(Number);
        newDate.setFullYear(year, month - 1, day);
        setTempDate(newDate);
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTimeValue = e.target.value;
        const newDate = new Date(tempDate);
        const [hours, minutes] = newTimeValue.split(':').map(Number);
        newDate.setHours(hours, minutes);
        setTempDate(newDate);
    };

    const handleRepeatChange = (option: 'daily' | 'weekly' | 'monthly' | 'none') => {
        setTempRepeat(option);
        // If selecting a repeat option and no reminder was set, set default date
        if (option !== 'none' && !initialDate) {
            const now = new Date();
            const nextOccurrence = new Date(now);
            if (option === 'daily') {
                nextOccurrence.setDate(now.getDate() + 1);
            } else if (option === 'weekly') {
                nextOccurrence.setDate(now.getDate() + 7);
            } else if (option === 'monthly') {
                nextOccurrence.setMonth(now.getMonth() + 1);
            }
            setTempDate(nextOccurrence);
        }
    };

    const formatDateForInput = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const formatTimeForInput = (date: Date) => {
        return date.toTimeString().slice(0, 5);
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.content} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.title}>Set Reminder</h2>

                <div className={styles.pickerContainer}>
                    <div className={styles.pickerHeader}>
                        <span className={styles.label}>
                            {pickerMode === 'date' ? 'Date' : 'Time'}
                        </span>
                        <button
                            className={styles.switchButton}
                            onClick={() => setPickerMode(pickerMode === 'date' ? 'time' : 'date')}
                        >
                            {pickerMode === 'date' ? (
                                <>
                                    <Clock size={14} color={theme.colors.primary} />
                                    <span>Set Time</span>
                                </>
                            ) : (
                                <>
                                    <Calendar size={14} color={theme.colors.primary} />
                                    <span>Set Date</span>
                                </>
                            )}
                        </button>
                    </div>

                    {pickerMode === 'date' ? (
                        <input
                            type="date"
                            className={styles.dateInput}
                            value={formatDateForInput(tempDate)}
                            onChange={handleDateChange}
                        />
                    ) : (
                        <input
                            type="time"
                            className={styles.timeInput}
                            value={formatTimeForInput(tempDate)}
                            onChange={handleTimeChange}
                        />
                    )}
                </div>

                <div className={styles.repeatContainer}>
                    <div className={styles.repeatOptions}>
                        {(['none', 'daily', 'weekly', 'monthly'] as const).map((option) => (
                            <button
                                key={option}
                                className={`${styles.repeatOption} ${tempRepeat === option ? styles.repeatOptionSelected : ''}`}
                                onClick={() => handleRepeatChange(option)}
                            >
                                {option.charAt(0).toUpperCase() + option.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.actions}>
                    <button className={styles.buttonSecondary} onClick={onClear}>
                        Clear
                    </button>
                    <div style={{ flex: 1 }} />
                    <button className={styles.buttonSecondary} onClick={onClose}>
                        Cancel
                    </button>
                    <button className={styles.buttonPrimary} onClick={() => onSave(tempDate, tempRepeat)}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
