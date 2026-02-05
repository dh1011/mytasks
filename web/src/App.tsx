import { useState, useEffect } from 'react';
import { Settings, Plus, Menu, Inbox, Bell, Loader2 } from 'lucide-react';
import { useDatabaseConfig } from './hooks/useDatabaseConfig';
import { useTasks } from './hooks/useTasks';
import { AddTaskForm } from './components/AddTaskForm';
import { TaskItem } from './components/TaskItem';
import { DatabaseConfigPanel } from './components/DatabaseConfigPanel';
import { Sidebar } from './components/Sidebar';
import { theme } from './styles/theme';
import './App.css';

function App() {
  const { config, saveConfig, isLoading: configLoading } = useDatabaseConfig();
  const {
    isLoading: tasksLoading,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    clearCompleted,
    refresh,
    inboxTasks,
    reminderTasks,
    completedTasks,
  } = useTasks(config);

  const [showSettings, setShowSettings] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState<'inbox' | 'reminders'>('inbox');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Responsive check
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      <div className="loading-container">
        <Loader2 size={40} color={theme.colors.primary} className="spinner" />
      </div>
    );
  }

  const currentTasks = activeTab === 'inbox' ? inboxTasks : reminderTasks;
  const displayTasks = [...currentTasks, ...(showCompleted ? completedTasks : [])];

  return (
    <div className="app-root" onClick={() => setExpandedTaskId(null)}>
      {isDesktop && (
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenSettings={() => setShowSettings(true)}
          inboxCount={inboxTasks.length}
          reminderCount={reminderTasks.length}
          showCompleted={showCompleted}
          onToggleShowCompleted={() => setShowCompleted(!showCompleted)}
        />
      )}

      <div className="main-content">
        <div className="content-container">
          {/* Desktop Header */}
          {isDesktop && (
            <div className="desktop-header">
              <h2 className="section-title">
                {activeTab === 'inbox' ? 'Inbox' : 'Reminders'}
              </h2>
              <div className="desktop-actions">
                {completedTasks.length > 0 && showCompleted && (
                  <button
                    className="text-button"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete all completed tasks?')) {
                        clearCompleted();
                      }
                    }}
                  >
                    Delete Completed
                  </button>
                )}
              </div>
            </div>
          )}

          {!isDesktop && showAddTask && (
            <div className="add-task-wrapper">
              <AddTaskForm onAdd={addTask} />
            </div>
          )}

          {isDesktop && (
            <div className="add-task-wrapper desktop-add-task">
              <AddTaskForm onAdd={addTask} />
            </div>
          )}

          <div className="list-container">
            {/* Mobile Tabs */}
            {!isDesktop && (
              <div className="tab-container">
                <button
                  className={`tab-button ${activeTab === 'inbox' ? 'active' : ''}`}
                  onClick={() => setActiveTab('inbox')}
                >
                  <span>Inbox</span>
                  {inboxTasks.length > 0 && (
                    <span className="badge">{inboxTasks.length}</span>
                  )}
                </button>
                <button
                  className={`tab-button ${activeTab === 'reminders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reminders')}
                >
                  <span>Reminders</span>
                  {reminderTasks.length > 0 && (
                    <span className="badge">{reminderTasks.length}</span>
                  )}
                </button>
              </div>
            )}

            {/* Task List */}
            <div className="task-list" onClick={(e) => e.stopPropagation()}>
              {displayTasks.length === 0 ? (
                <div className="empty-container">
                  <div className="empty-icon">
                    {activeTab === 'inbox' ? (
                      <Inbox size={32} color={theme.colors.textMuted} />
                    ) : (
                      <Bell size={32} color={theme.colors.textMuted} />
                    )}
                  </div>
                  <h3 className="empty-title">
                    {activeTab === 'inbox' ? 'NO INBOX TASKS' : 'NO REMINDERS'}
                  </h3>
                  <p className="empty-subtitle">
                    {activeTab === 'inbox'
                      ? 'Tasks without reminders appear here'
                      : 'Tasks with upcoming reminders appear here'}
                  </p>
                </div>
              ) : (
                displayTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onUpdate={updateTask}
                    onDelete={deleteTask}
                    isExpanded={expandedTaskId === task.id || isDesktop} // Always expanded controls on desktop? Maybe just handle hover/click better. Let's keep click expand for consistency but allow full width.
                    onExpand={() => handleExpand(task.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Settings Panel / Modal */}
        {showSettings && (
          <div className={isDesktop ? "modal-overlay" : "slide-panel"}>
            <div className={isDesktop ? "modal-content" : ""}>
              <DatabaseConfigPanel
                config={config}
                onSave={saveConfig}
                onClose={handleCloseSettings}
              />
            </div>
          </div>
        )}

        {/* Mobile Menu Panel */}
        {!isDesktop && showMenu && (
          <div className="slide-panel">
            <button
              className="menu-item"
              onClick={() => {
                setShowCompleted(!showCompleted);
                setShowMenu(false);
              }}
            >
              {showCompleted ? 'Hide Completed' : 'Show Completed'}
            </button>

            {completedTasks.length > 0 && (
              <button
                className="menu-item"
                onClick={() => {
                  setShowMenu(false);
                  if (window.confirm('Are you sure you want to delete all completed tasks?')) {
                    clearCompleted();
                  }
                }}
              >
                Delete Completed
              </button>
            )}
          </div>
        )}

        {/* Mobile Bottom Bar */}
        {!isDesktop && (
          <div className="bottom-bar">
            <button
              className="icon-button"
              onClick={() => {
                setShowSettings(!showSettings);
                setShowMenu(false);
              }}
              aria-label="Settings"
            >
              <Settings size={24} color={theme.colors.textMuted} />
            </button>

            <button
              className="plus-button"
              onClick={() => setShowAddTask(!showAddTask)}
              aria-label="Add task"
            >
              <Plus size={24} color={theme.colors.surface} />
            </button>

            <button
              className="icon-button"
              onClick={() => {
                setShowMenu(!showMenu);
                setShowSettings(false);
              }}
              aria-label="Menu"
            >
              <Menu size={24} color={theme.colors.textMuted} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
