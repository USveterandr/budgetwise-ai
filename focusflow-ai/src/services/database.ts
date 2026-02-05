import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export const db = firestore();

export interface Task {
  id?: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  completed: boolean;
  userId: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Goal {
  id?: string;
  title: string;
  description?: string;
  targetDate?: string;
  progress: number;
  userId: string;
  milestones?: Milestone[];
  createdAt?: any;
  updatedAt?: any;
}

export interface Milestone {
  id?: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  goalId: string;
}

export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  userId: string;
  source: 'google' | 'apple' | 'outlook' | 'manual';
  createdAt?: any;
}

export const TaskService = {
  async getTasks(): Promise<Task[]> {
    const userId = auth().currentUser?.uid;
    if (!userId) return [];
    
    const snapshot = await db
      .collection('tasks')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
  },

  async addTask(task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const userId = auth().currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    const docRef = await db.collection('tasks').add({
      ...task,
      userId,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
    
    return docRef.id;
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    await db.collection('tasks').doc(taskId).update({
      ...updates,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  },

  async deleteTask(taskId: string): Promise<void> {
    await db.collection('tasks').doc(taskId).delete();
  },
};

export const GoalService = {
  async getGoals(): Promise<Goal[]> {
    const userId = auth().currentUser?.uid;
    if (!userId) return [];
    
    const snapshot = await db
      .collection('goals')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
  },

  async addGoal(goal: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const userId = auth().currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    const docRef = await db.collection('goals').add({
      ...goal,
      userId,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
    
    return docRef.id;
  },

  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<void> {
    await db.collection('goals').doc(goalId).update({
      ...updates,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  },

  async deleteGoal(goalId: string): Promise<void> {
    await db.collection('goals').doc(goalId).delete();
  },

  async addMilestone(goalId: string, milestone: Omit<Milestone, 'id' | 'goalId'>): Promise<string> {
    const docRef = await db.collection('milestones').add({
      ...milestone,
      goalId,
    });
    return docRef.id;
  },

  async updateMilestone(milestoneId: string, updates: Partial<Milestone>): Promise<void> {
    await db.collection('milestones').doc(milestoneId).update(updates);
  },
};

export const CalendarService = {
  async getEvents(): Promise<CalendarEvent[]> {
    const userId = auth().currentUser?.uid;
    if (!userId) return [];
    
    const snapshot = await db
      .collection('calendarEvents')
      .where('userId', '==', userId)
      .orderBy('startTime', 'asc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CalendarEvent));
  },

  async addEvent(event: Omit<CalendarEvent, 'id' | 'userId' | 'createdAt'>): Promise<string> {
    const userId = auth().currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    const docRef = await db.collection('calendarEvents').add({
      ...event,
      userId,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    
    return docRef.id;
  },

  async updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<void> {
    await db.collection('calendarEvents').doc(eventId).update(updates);
  },

  async deleteEvent(eventId: string): Promise<void> {
    await db.collection('calendarEvents').doc(eventId).delete();
  },
};
