import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal, ActivityIndicator, RefreshControl } from 'react-native';
import { useTaskStore, useThemeStore, useUserStore } from '../store';
import { taskApi } from '../api/client';
import { format } from 'date-fns';

export default function TasksScreen() {
  const { tasks, setTasks, addTask: addTaskToStore, completeTask, deleteTask, isLoading, setLoading, setError } = useTaskStore();
  const { colors } = useThemeStore();
  const { canCreateTask, getRemainingTasks, isPremium } = useUserStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    due_date: '',
    category: '',
  });

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await taskApi.getTasks({ limit: 100 });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  const handleAddTask = async () => {
    if (!canCreateTask()) {
      setError('Task limit reached. Upgrade to Premium for unlimited tasks.');
      return;
    }

    try {
      const response = await taskApi.createTask(newTask);
      addTaskToStore(response.data);
      setModalVisible(false);
      setNewTask({ title: '', description: '', priority: 'medium', due_date: '', category: '' });
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Failed to create task');
    }
  };

  const handleCompleteTask = async (id: string) => {
    try {
      await taskApi.completeTask(id);
      completeTask(id);
    } catch (error) {
      console.error('Error completing task:', error);
      setError('Failed to complete task');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await taskApi.deleteTask(id);
      deleteTask(id);
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return colors.urgent;
      case 'high': return colors.high;
      case 'medium': return colors.medium;
      case 'low': return colors.low;
      default: return colors.medium;
    }
  };

  const remainingTasks = getRemainingTasks();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Tasks</Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]} 
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Add Task</Text>
        </TouchableOpacity>
      </View>

      {!isPremium() && remainingTasks > 0 && (
        <View style={[styles.limitBanner, { backgroundColor: colors.warning + '20' }]}>
          <Text style={[styles.limitText, { color: colors.warning }]}>
            {remainingTasks} tasks remaining on Free plan
          </Text>
        </View>
      )}

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView 
          style={styles.taskList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {tasks.map(task => (
            <TouchableOpacity 
              key={task.id} 
              style={[styles.taskItem, { backgroundColor: colors.surface }]}
              onPress={() => handleCompleteTask(task.id)}
              onLongPress={() => handleDeleteTask(task.id)}
            >
              <View style={styles.taskHeader}>
                <Text style={[
                  styles.taskTitle, 
                  { color: colors.text },
                  task.status === 'completed' && styles.completedText
                ]}>
                  {task.title}
                </Text>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
                  <Text style={styles.priorityText}>{task.priority}</Text>
                </View>
              </View>
              {task.description && (
                <Text style={[styles.taskDescription, { color: colors.textSecondary }]}>
                  {task.description}
                </Text>
              )}
              {task.due_date && (
                <Text style={[styles.taskDate, { color: colors.textSecondary }]}>
                  Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                </Text>
              )}
              {task.status === 'completed' && (
                <View style={[styles.completedBadge, { backgroundColor: colors.success + '20' }]}>
                  <Text style={[styles.completedBadgeText, { color: colors.success }]}>✓ Completed</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
          {tasks.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No tasks yet. Add your first task!
            </Text>
          )}
        </ScrollView>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Task</Text>
            
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              placeholder="Task title"
              placeholderTextColor={colors.textSecondary}
              value={newTask.title}
              onChangeText={text => setNewTask({ ...newTask, title: text })}
            />
            
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              placeholder="Description (optional)"
              placeholderTextColor={colors.textSecondary}
              value={newTask.description}
              onChangeText={text => setNewTask({ ...newTask, description: text })}
              multiline
            />
            
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              placeholder="Due date (YYYY-MM-DD)"
              placeholderTextColor={colors.textSecondary}
              value={newTask.due_date}
              onChangeText={text => setNewTask({ ...newTask, due_date: text })}
            />

            <View style={styles.priorityButtons}>
              {(['low', 'medium', 'high', 'urgent'] as const).map(priority => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.priorityButton,
                    { borderColor: colors.border },
                    newTask.priority === priority && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => setNewTask({ ...newTask, priority })}
                >
                  <Text style={[
                    styles.priorityButtonText,
                    { color: newTask.priority === priority ? 'white' : colors.text }
                  ]}>
                    {priority}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: colors.border }]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: colors.primary }]} 
                onPress={handleAddTask}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  limitBanner: {
    padding: 10,
    alignItems: 'center',
  },
  limitText: {
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskList: {
    flex: 1,
    padding: 20,
  },
  taskItem: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  priorityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  taskDescription: {
    fontSize: 14,
    marginBottom: 5,
  },
  taskDate: {
    fontSize: 12,
  },
  completedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  completedBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  priorityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  priorityButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  priorityButtonText: {
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
