import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';

interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  progress: number;
  milestones: Milestone[];
}

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', targetDate: '' });

  const addGoal = () => {
    const goal: Goal = {
      id: Date.now().toString(),
      ...newGoal,
      progress: 0,
      milestones: [],
    };
    setGoals([...goals, goal]);
    setModalVisible(false);
    setNewGoal({ title: '', description: '', targetDate: '' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Goals</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ Add Goal</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.goalList}>
        {goals.map(goal => (
          <View key={goal.id} style={styles.goalItem}>
            <Text style={styles.goalTitle}>{goal.title}</Text>
            {goal.description && <Text style={styles.goalDescription}>{goal.description}</Text>}
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <View style={[styles.progressFill, { width: `${goal.progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{goal.progress}%</Text>
            </View>

            <Text style={styles.targetDate}>Target: {goal.targetDate || 'Not set'}</Text>
            
            <View style={styles.milestones}>
              <Text style={styles.milestoneTitle}>Milestones</Text>
              {goal.milestones.length === 0 && (
                <Text style={styles.emptyMilestones}>No milestones yet</Text>
              )}
            </View>
          </View>
        ))}
        {goals.length === 0 && (
          <Text style={styles.emptyText}>No goals yet. Set your first goal!</Text>
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Goal</Text>
            <TextInput
              style={styles.input}
              placeholder="Goal title"
              value={newGoal.title}
              onChangeText={text => setNewGoal({ ...newGoal, title: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Description (optional)"
              value={newGoal.description}
              onChangeText={text => setNewGoal({ ...newGoal, description: text })}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Target date (YYYY-MM-DD)"
              value={newGoal.targetDate}
              onChangeText={text => setNewGoal({ ...newGoal, targetDate: text })}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={addGoal}>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  goalList: {
    flex: 1,
    padding: 20,
  },
  goalItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  goalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
  },
  progressText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6366f1',
    minWidth: 40,
  },
  targetDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },
  milestones: {
    marginTop: 10,
  },
  milestoneTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  emptyMilestones: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
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
    backgroundColor: 'white',
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
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
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
  cancelButton: {
    backgroundColor: '#e5e7eb',
  },
  saveButton: {
    backgroundColor: '#6366f1',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
