import React, { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  Alert,
  TouchableWithoutFeedback,
  Text,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTasks } from './hooks/useTasks';
import { AddTaskForm } from './components/AddTaskForm';
import { TaskList } from './components/TaskList';
import { DatabaseConfigScreen } from './components/DatabaseConfigScreen';
import { theme } from './styles/theme';

export default function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const {
    tasks,
    isLoading,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    clearCompleted,
    refresh,
  } = useTasks();

  const handleCloseSettings = () => {
    setShowSettings(false);
    refresh();
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Main Content Container */}
          <View style={styles.contentContainer}>
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => setShowSettings(true)}
                >
                  <Feather name="settings" size={20} color={theme.colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => setShowMenu(true)}
                >
                  <Feather name="more-vertical" size={20} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            <AddTaskForm onAdd={addTask} />

            <View style={styles.listContainer}>
              <TaskList
                tasks={
                  tasks
                    .filter(t => showCompleted ? true : !t.completed)
                    .sort((a, b) => {
                      // Sort by completed status (false first, true last)
                      if (a.completed === b.completed) return 0;
                      return a.completed ? 1 : -1;
                    })
                }
                onToggle={toggleTask}
                onUpdate={updateTask}
                onDelete={deleteTask}
              />
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* Settings Modal */}
        <Modal
          visible={showSettings}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowSettings(false)}
        >
          <DatabaseConfigScreen onClose={handleCloseSettings} />
        </Modal>

        {/* Overflow Menu Modal */}
        <Modal
          visible={showMenu}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowMenu(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
            <View style={styles.menuOverlay}>
              <View style={styles.menuContainer}>
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
                          { text: "Delete", onPress: clearCompleted, style: "destructive" }
                        ]
                      );
                    }}
                  >
                    <Text style={styles.menuText}>Delete Completed</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
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
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    top: 60, // approximate header height + spacing
    right: theme.spacing.lg,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    // Shadow
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.5)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 8,
      },
    }),
    minWidth: 180,
    zIndex: 1000,
  },
  menuItem: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  menuText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  listContainer: {
    flex: 1,
  },
});
