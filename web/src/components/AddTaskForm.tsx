import React, { useState, useRef } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddTaskFormProps {
    onAdd: (title: string) => void;
}

export function AddTaskForm({ onAdd }: AddTaskFormProps) {
    const [title, setTitle] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = title.trim();
        if (!trimmed) return;

        setIsSubmitting(true);
        onAdd(trimmed);
        setTitle('');
        inputRef.current?.focus();

        setTimeout(() => setIsSubmitting(false), 250);
    };

    return (
        <form className="flex items-center gap-2" onSubmit={handleSubmit}>
            <div className="relative flex-1">
                <input
                    ref={inputRef}
                    type="text"
                    className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/20"
                    placeholder="Add a new task..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            <button
                type="submit"
                className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all duration-200 hover:opacity-90",
                    isSubmitting && "animate-input-submit",
                    !title.trim() && "opacity-50 cursor-not-allowed hover:opacity-50"
                )}
                disabled={!title.trim()}
                aria-label="Add task"
            >
                <Plus
                    className={cn(
                        "h-5 w-5 transition-transform duration-200",
                        isSubmitting && "rotate-90"
                    )}
                />
            </button>
        </form>
    );
}
