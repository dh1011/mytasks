import React, { useState, useCallback } from 'react';
import { Feather } from '@expo/vector-icons';
import {
  View,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  Text,
  LogBox,
  FlatList,
  Pressable,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Ignore specific warnings
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  '`expo-notifications` functionality is not fully supported',
]);
import { useTasks } from './hooks/useTasks';
import { AddTaskForm } from './components/AddTaskForm';
import { TaskItem } from './components/TaskItem';
import { DatabaseConfigScreen } from './components/DatabaseConfigScreen';
import { theme } from './styles/theme';

import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [activeTab, setActiveTab] = useState<'inbox' | 'reminders'>('inbox');
  const {
    isLoading,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    clearCompleted,
    refresh,
    inboxTasks,
    reminderTasks,
    completedTasks,
  } = useTasks();

  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Hide splash screen once layout happens
  const onLayoutRootView = useCallback(async () => {
    if (!isLoading) {
      await SplashScreen.hideAsync();
    }
  }, [isLoading]);

  const handleCloseSettings = () => {
    setShowSettings(false);
    refresh();
  };

  const completedCount = completedTasks.length;

  const handleExpand = (id: string) => {
    setExpandedTaskId(prevId => prevId === id ? null : id);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  // Sections logic replaced by tabs
  // const sections = []; ...

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} onLayout={onLayoutRootView}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Main Content Container */}
          <View style={styles.contentContainer}>
            {showAddTask && (
              <View style={styles.addTaskWrapper}>
                <AddTaskForm
                  onAdd={addTask}
                  onClose={() => setShowAddTask(false)}
                />
              </View>
            )}

            <View style={styles.listContainer}>
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tabButton, activeTab === 'inbox' && styles.activeTabButton]}
                  onPress={() => setActiveTab('inbox')}
                >
                  <Text style={[styles.tabText, activeTab === 'inbox' && styles.activeTabText]}>Inbox</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tabButton, activeTab === 'reminders' && styles.activeTabButton]}
                  onPress={() => setActiveTab('reminders')}
                >
                  <Text style={[styles.tabText, activeTab === 'reminders' && styles.activeTabText]}>Reminders</Text>
                </TouchableOpacity>
              </View>

              <Pressable style={styles.listContainer} onPress={() => setExpandedTaskId(null)}>
                {activeTab === 'inbox' ? (
                  <FlatList
                    data={[...inboxTasks, ...(showCompleted ? completedTasks : [])]}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TaskItem
                        task={item}
                        onToggle={toggleTask}
                        onUpdate={updateTask}
                        onDelete={deleteTask}
                        isExpanded={expandedTaskId === item.id}
                        onExpand={() => handleExpand(item.id)}
                      />
                    )}
                    ListEmptyComponent={
                      <Pressable style={styles.emptyContainer} onPress={() => setExpandedTaskId(null)}>
                        <View style={styles.emptyIconContainer}>
                          <Feather name="inbox" size={32} color={theme.colors.textMuted} />
                        </View>
                        <Text style={styles.emptyTitle}>NO INBOX TASKS</Text>
                        <Text style={styles.emptySubtitle}>
                          Tasks without reminders appear here
                        </Text>
                      </Pressable>
                    }
                    contentContainerStyle={[
                      styles.listContent,
                      inboxTasks.length === 0 && (!showCompleted || completedTasks.length === 0) && styles.listContentEmpty
                    ]}
                    showsVerticalScrollIndicator={false}
                  />
                ) : (
                  <FlatList
                    data={[...reminderTasks, ...(showCompleted ? completedTasks : [])]}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TaskItem
                        task={item}
                        onToggle={toggleTask}
                        onUpdate={updateTask}
                        onDelete={deleteTask}
                        isExpanded={expandedTaskId === item.id}
                        onExpand={() => handleExpand(item.id)}
                      />
                    )}
                    ListEmptyComponent={
                      <Pressable style={styles.emptyContainer} onPress={() => setExpandedTaskId(null)}>
                        <View style={styles.emptyIconContainer}>
                          <Feather name="bell" size={32} color={theme.colors.textMuted} />
                        </View>
                        <Text style={styles.emptyTitle}>NO REMINDERS</Text>
                        <Text style={styles.emptySubtitle}>
                          Tasks with upcoming reminders appear here
                        </Text>
                      </Pressable>
                    }
                    contentContainerStyle={[
                      styles.listContent,
                      reminderTasks.length === 0 && (!showCompleted || completedTasks.length === 0) && styles.listContentEmpty
                    ]}
                    showsVerticalScrollIndicator={false}
                  />
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* Settings Panel */}
        {showSettings && (
          <View style={styles.slidePanel}>
            <DatabaseConfigScreen onClose={handleCloseSettings} />
          </View>
        )}

        {/* Menu Panel */}
        {showMenu && (
          <View style={styles.slidePanel}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowCompleted(!showCompleted);
                setShowMenu(false);
              }}
            >
              <Text style={styles.menuText}>
                {showCompleted ? "Hide Completed" : "Show Completed"}
              </Text>
            </TouchableOpacity>

            {completedCount > 0 && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowMenu(false);
                  Alert.alert(
                    "Delete Completed",
                    "Are you sure you want to delete all completed tasks?",
                    [
                      { text: "Cancel", style: "cancel" },
                      { text: "Delete", onPress: clearCompleted }
                    ]
                  );
                }}
              >
                <Text style={styles.menuText}>Delete Completed</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              setShowSettings(!showSettings);
              setShowMenu(false);
            }}
          >
            <Feather name="settings" size={24} color={theme.colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.plusButton}
            onPress={() => setShowAddTask(!showAddTask)}
          >
            <Feather name="plus" size={24} color={theme.colors.surface} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              setShowMenu(!showMenu);
              setShowSettings(false);
            }}
          >
            <Feather name="menu" size={24} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTaskWrapper: {
    marginBottom: theme.spacing.md,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  plusButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slidePanel: {
    backgroundColor: theme.colors.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  menuItem: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  menuText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  sectionHeader: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface, // Sticky header bg
    // or transparent if not sticky
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  sectionHeaderText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textMuted,
    letterSpacing: 1.5,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
    fontWeight: theme.fontWeight.medium,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.bold,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    marginTop: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },

  emptyTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    letterSpacing: theme.letterSpacing.wider,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    letterSpacing: theme.letterSpacing.normal,
  },
});
