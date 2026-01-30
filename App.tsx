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
  const {
    tasks,
    isLoading,
    addTask,
    toggleTask,
    deleteTask,
    refresh,
  } = useTasks();

  const handleCloseSettings = () => {
    setShowSettings(false);
    refresh();
  };

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const pendingCount = tasks.filter((t) => !t.completed).length;
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
                  <Text style={styles.date}>{dateString}</Text>
                  <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={() => setShowSettings(true)}
                  >
                    <Text style={styles.settingsIcon}>⚙</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.title}>MY TASKS</Text>
                <View style={styles.statsContainer}>
                  <View style={styles.stat}>
                    <Text style={styles.statNumber}>{pendingCount}</Text>
                    <Text style={styles.statLabel}>PENDING</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.stat}>
                    <Text style={[styles.statNumber, styles.statSuccess]}>
                      {completedCount}
                    </Text>
                    <Text style={styles.statLabel}>DONE</Text>
                  </View>
                </View>
              </View>

              <AddTaskForm onAdd={addTask} />

              <View style={styles.listContainer}>
                <TaskList
                  tasks={tasks}
                  onToggle={toggleTask}
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
  date: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    fontWeight: theme.fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: theme.letterSpacing.widest,
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    letterSpacing: theme.letterSpacing.wide,
    marginBottom: theme.spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
  },
  statNumber: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  statSuccess: {
    color: theme.colors.success,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
    letterSpacing: theme.letterSpacing.wider,
    fontWeight: theme.fontWeight.medium,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
});
