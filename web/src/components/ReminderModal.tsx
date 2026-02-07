import React, { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="w-full max-w-sm rounded-xl border border-border bg-card shadow-lg animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <h2 className="text-lg font-semibold tracking-tight mb-6">Set Reminder</h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-border">
                            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                {pickerMode === 'date' ? 'Date' : 'Time'}
                            </span>
                            <button
                                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                                onClick={() => setPickerMode(pickerMode === 'date' ? 'time' : 'date')}
                            >
                                {pickerMode === 'date' ? (
                                    <>
                                        <Clock size={14} />
                                        <span>Set Time</span>
                                    </>
                                ) : (
                                    <>
                                        <Calendar size={14} />
                                        <span>Set Date</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {pickerMode === 'date' ? (
                            <input
                                type="date"
                                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formatDateForInput(tempDate)}
                                onChange={handleDateChange}
                            />
                        ) : (
                            <input
                                type="time"
                                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formatTimeForInput(tempDate)}
                                onChange={handleTimeChange}
                            />
                        )}

                        <div className="pt-2 space-y-2">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">
                                Repeat
                            </span>
                            <div className="flex bg-muted/50 p-1 rounded-lg">
                                {(['none', 'daily', 'weekly', 'monthly'] as const).map((option) => (
                                    <button
                                        key={option}
                                        className={cn(
                                            "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                                            tempRepeat === option
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                        )}
                                        onClick={() => handleRepeatChange(option)}
                                    >
                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-8">
                        <button
                            className="text-sm font-medium text-destructive hover:text-destructive/80 transition-colors"
                            onClick={onClear}
                        >
                            Clear
                        </button>
                        <div className="flex-1" />
                        <button
                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                            onClick={() => onSave(tempDate, tempRepeat)}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
