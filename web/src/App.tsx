import { useState, useEffect, useRef, useCallback } from 'react';
import { Settings, Plus, Inbox, Bell, Loader2, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useDatabaseConfig } from './hooks/useDatabaseConfig';
import { useTasks } from './hooks/useTasks';
import { AddTaskForm } from './components/AddTaskForm';
import { TaskItem } from './components/TaskItem';
import { DatabaseConfigPanel } from './components/DatabaseConfigPanel';
import { cn } from '@/lib/utils';

export default function App() {
  const { config, saveConfig, isLoading: configLoading } = useDatabaseConfig();
  const [showSettings, setShowSettings] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState<'inbox' | 'reminders'>('inbox');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const {
    isLoading: tasksLoading,
    isLoadingMore,
    isLoadingCompleted,
    hasMore,
    hasMoreCompleted,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    clearCompleted,
    refresh,
    loadMore,
    loadMoreCompleted,
    inboxTasks,
    reminderTasks,
    completedTasks,
  } = useTasks(config, activeTab, showCompleted);

  // Tab Indicator Logic
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const [indicatorReady, setIndicatorReady] = useState(false);

  // Responsive check
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateIndicator = useCallback(() => {
    const btn = tabRefs.current.get(activeTab);
    const container = tabsContainerRef.current;
    if (btn && container) {
      const containerRect = container.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      setIndicator({
        left: btnRect.left - containerRect.left,
        width: btnRect.width,
      });
    }
  }, [activeTab]);

  useEffect(() => {
    updateIndicator();
    if (!indicatorReady) {
      requestAnimationFrame(() => setIndicatorReady(true));
    }
  }, [activeTab, updateIndicator, indicatorReady]);

  // Recalculate on resize
  useEffect(() => {
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [updateIndicator]);

  // Infinite scroll — sentinel for active tab tasks
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMore]);

  // Infinite scroll — sentinel for completed tasks
  const completedSentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sentinel = completedSentinelRef.current;
    if (!sentinel || !showCompleted) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreCompleted && !isLoadingCompleted) {
          loadMoreCompleted();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMoreCompleted, isLoadingCompleted, loadMoreCompleted, showCompleted]);

  const handleCloseSettings = () => {
    setShowSettings(false);
    refresh();
  };

  const handleExpand = (id: string) => {
    setExpandedTaskId(prevId => prevId === id ? null : id);
  };

  const isLoading = configLoading || tasksLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const currentTasks = activeTab === 'inbox' ? inboxTasks : reminderTasks;

  return (
    <div className="flex h-screen w-full bg-background text-foreground" onClick={() => setExpandedTaskId(null)}>
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <div className="flex-1 flex flex-col w-full max-w-2xl mx-auto bg-background h-full">

          {/* Top Header - Unified for Mobile and Desktop */}
          <div className="flex items-center justify-between px-6 py-6 shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <img src="/favicon.png" alt="MyTasks Logo" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Show/Hide Completed Toggle */}
              <button
                className={cn(
                  "p-2 rounded-full transition-colors",
                  showCompleted ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                )}
                onClick={() => setShowCompleted(!showCompleted)}
                title={showCompleted ? "Hide Completed" : "Show Completed"}
              >
                {showCompleted ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>

              {/* Settings Button */}
              <button
                className="p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                onClick={() => setShowSettings(true)}
                title="Settings"
              >
                <Settings size={20} />
              </button>

              {/* Delete Completed (Only if applicable) */}
              {showCompleted && completedTasks.length > 0 && (
                <button
                  className="p-2 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete all completed tasks?')) {
                      clearCompleted();
                    }
                  }}
                  title="Delete All Completed"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Add Task Form */}
          <div className={cn("px-4 mb-6", !isDesktop && showAddTask ? "block" : !isDesktop ? "hidden" : "block")}>
            <AddTaskForm onAdd={addTask} />
          </div>

          <div className="flex-1 flex flex-col px-4 overflow-hidden">
            {/* Tabs with Sliding Indicator */}
            <div
              ref={tabsContainerRef}
              className="relative flex items-center gap-1 rounded-lg bg-muted/50 p-1 mb-4 shrink-0"
            >
              <div
                className="pointer-events-none absolute top-1 bottom-1 z-0 rounded-md bg-background shadow-sm ring-1 ring-border/5"
                style={{
                  left: indicator.left,
                  width: indicator.width,
                  transition: indicatorReady
                    ? "left 0.35s cubic-bezier(0.22, 1, 0.36, 1), width 0.35s cubic-bezier(0.22, 1, 0.36, 1)"
                    : "none",
                }}
              />

              <button
                ref={(el) => { if (el) tabRefs.current.set('inbox', el); }}
                className={cn(
                  "relative z-10 flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium transition-colors duration-200",
                  activeTab === 'inbox' ? "text-foreground" : "text-muted-foreground"
                )}
                onClick={() => setActiveTab('inbox')}
              >
                <span>Inbox</span>
              </button>
              <button
                ref={(el) => { if (el) tabRefs.current.set('reminders', el); }}
                className={cn(
                  "relative z-10 flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium transition-colors duration-200",
                  activeTab === 'reminders' ? "text-foreground" : "text-muted-foreground"
                )}
                onClick={() => setActiveTab('reminders')}
              >
                <span>Reminders</span>
              </button>
            </div>

            {/* Task List */}
            <div
              className="flex-1 overflow-y-auto pb-24 scrollbar-hide"
              onClick={(e) => e.stopPropagation()}
            >
              {currentTasks.length === 0 && !isLoadingMore ? (
                <div className="flex flex-col items-center justify-center py-12 mt-12 text-muted-foreground/60">
                  <div className="mb-4 p-4 rounded-2xl bg-muted/30 border border-border/50">
                    {activeTab === 'inbox' ? (
                      <Inbox size={48} strokeWidth={1.5} />
                    ) : (
                      <Bell size={48} strokeWidth={1.5} />
                    )}
                  </div>
                  <h3 className="text-sm font-medium tracking-widest uppercase mb-1 opacity-80">
                    {activeTab === 'inbox' ? 'NO INBOX TASKS' : 'NO REMINDERS'}
                  </h3>
                  <p className="text-xs text-center px-8 opacity-60">
                    {activeTab === 'inbox'
                      ? 'Tasks without reminders appear here'
                      : 'Tasks with upcoming reminders appear here'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {currentTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={toggleTask}
                      onUpdate={updateTask}
                      onDelete={deleteTask}
                      isExpanded={expandedTaskId === task.id}
                      onExpand={() => handleExpand(task.id)}
                    />
                  ))}

                  {/* Sentinel for infinite scroll */}
                  <div ref={sentinelRef} className="h-1" />

                  {isLoadingMore && (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  )}

                  {/* Completed tasks section */}
                  {showCompleted && completedTasks.length > 0 && (
                    <>
                      {completedTasks.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onToggle={toggleTask}
                          onUpdate={updateTask}
                          onDelete={deleteTask}
                          isExpanded={expandedTaskId === task.id}
                          onExpand={() => handleExpand(task.id)}
                        />
                      ))}

                      {/* Sentinel for completed tasks infinite scroll */}
                      <div ref={completedSentinelRef} className="h-1" />

                      {isLoadingCompleted && (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Settings Panel Modal */}
        {showSettings && (
          <DatabaseConfigPanel
            config={config}
            onSave={saveConfig}
            onClose={handleCloseSettings}
          />
        )}

        {/* Mobile Bottom Bar for Add Task (Since we removed the bottom menu, we need a way to add tasks on mobile if the input is hidden) */}
        {!isDesktop && (
          <div className="fixed bottom-6 right-6 z-50">
            <button
              className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-105 active:scale-95"
              onClick={() => setShowAddTask(!showAddTask)}
              aria-label="Add task"
            >
              <Plus size={28} className={cn("transition-transform duration-200", showAddTask && "rotate-45")} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
