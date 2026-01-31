import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTasks } from './hooks/useTasks';
import { AddTaskForm } from './components/AddTaskForm';
import { TaskList } from './components/TaskList';
import { DatabaseConfigScreen } from './components/DatabaseConfigScreen';
import { theme } from './styles/theme';

// Grid background component for the modernist aesthetic
function GridBackground() {
  return (
    <View style={styles.gridContainer}>
      {/* Horizontal lines */}
      {Array.from({ length: 40 }).map((_, i) => (
        <View
          key={`h-${i}`}
          style={[
            styles.gridLine,
            styles.gridLineHorizontal,
            { top: i * 32 },
          ]}
        />
      ))}
      {/* Vertical lines */}
      {Array.from({ length: 20 }).map((_, i) => (
        <View
          key={`v-${i}`}
          style={[
            styles.gridLine,
            styles.gridLineVertical,
            { left: i * 32 },
          ]}
        />
      ))}
    </View>
  );
}

export default function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
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
        <GridBackground />
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Floating Card Container */}
          <View style={styles.cardWrapper}>
            <View style={styles.card}>
              <View style={styles.header}>
                <View style={styles.headerTop}>
                  <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={() => setShowSettings(true)}
                  >
                    <Text style={styles.settingsIcon}>⚙</Text>
                  </TouchableOpacity>
                </View>
              </View>



              <View style={styles.controlsContainer}>
                <View style={styles.toggleContainer}>
                  <Switch
                    value={showCompleted}
                    onValueChange={setShowCompleted}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                    thumbColor={Platform.OS === 'android' ? theme.colors.text : '#fff'}
                    ios_backgroundColor={theme.colors.border}
                  />
                  <Text style={styles.toggleLabel}>SHOW COMPLETED</Text>
                </View>

                {completedCount > 0 && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => {
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
                    <Text style={styles.clearButtonText}>CLEAR DONE</Text>
                  </TouchableOpacity>
                )}
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
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: theme.colors.gridLine,
  },
  gridLineHorizontal: {
    left: 0,
    right: 0,
    height: 1,
  },
  gridLineVertical: {
    top: 0,
    bottom: 0,
    width: 1,
  },
  keyboardView: {
    flex: 1,
  },
  cardWrapper: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  card: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    // Soft, diffuse shadow for floating effect
    ...Platform.select({
      web: {
        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.4)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
      },
    }),
    elevation: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
  },
  settingsButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.textMuted,
  },
  listContainer: {
    flex: 1,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textMuted,
    letterSpacing: theme.letterSpacing.wider,
  },
  clearButton: {
    paddingVertical: 4,
  },
  clearButtonText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.danger,
    letterSpacing: theme.letterSpacing.wider,
  },
});
