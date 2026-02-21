import { useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import type { CSSTransitionProps } from 'react-transition-group/CSSTransition';
import { TaskItem } from './TaskItem';
import type { Task } from '@mytasks/core';

type TaskItemProps = {
    task: Task;
    onToggle: (id: string) => void;
    onUpdate: (id: string, updates: Partial<Task>) => void;
    onDelete: (id: string) => void;
    isExpanded: boolean;
    onExpand: () => void;
};

// TransitionGroup injects lifecycle props (in, onExited, etc.) into its direct
// children. We must forward them to CSSTransition so TransitionGroup can
// correctly manage enter/exit timing and DOM cleanup.
type RTGInjectedProps = Omit<CSSTransitionProps, 'children' | 'nodeRef' | 'classNames' | 'timeout'>;

export function AnimatedTask({ task, onToggle, onUpdate, onDelete, isExpanded, onExpand, ...rtgProps }: TaskItemProps & RTGInjectedProps) {
    const nodeRef = useRef<HTMLDivElement>(null);
    return (
        <CSSTransition
            nodeRef={nodeRef}
            timeout={{ enter: 420, exit: 220 }}
            classNames="task-item"
            {...rtgProps}
        >
            <div ref={nodeRef}>
                <TaskItem
                    task={task}
                    onToggle={onToggle}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    isExpanded={isExpanded}
                    onExpand={onExpand}
                />
            </div>
        </CSSTransition>
    );
}
