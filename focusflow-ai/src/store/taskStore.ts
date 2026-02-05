import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  category?: string;
  due_date?: string;
  start_date?: string;
  estimated_minutes?: number;
  actual_minutes?: number;
  completed_at?: string;
  goal_id?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  selectedTask: Task | null;
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  setSelectedTask: (task: Task | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed
  getTasksByStatus: (status: Task['status']) => Task[];
  getTasksByPriority: (priority: Task['priority']) => Task[];
  getTodayTasks: () => Task[];
  getOverdueTasks: () => Task[];
  getTopPriorities: (limit?: number) => Task[];
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      isLoading: false,
      error: null,
      selectedTask: null,
      
      setTasks: (tasks) => set({ tasks }),
      
      addTask: (task) => set((state) => ({ 
        tasks: [task, ...state.tasks] 
      })),
      
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, ...updates } : task
        ),
      })),
      
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      })),
      
      completeTask: (id) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id
            ? { ...task, status: 'completed', completed_at: new Date().toISOString() }
            : task
        ),
      })),
      
      setSelectedTask: (task) => set({ selectedTask: task }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      
      getTasksByStatus: (status) => {
        return get().tasks.filter((task) => task.status === status);
      },
      
      getTasksByPriority: (priority) => {
        return get().tasks.filter((task) => task.priority === priority);
      },
      
      getTodayTasks: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().tasks.filter((task) => {
          if (!task.due_date) return false;
          return task.due_date.startsWith(today);
        });
      },
      
      getOverdueTasks: () => {
        const today = new Date().toISOString();
        return get().tasks.filter((task) => {
          if (task.status === 'completed' || !task.due_date) return false;
          return new Date(task.due_date) < new Date(today);
        });
      },
      
      getTopPriorities: (limit = 3) => {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return get()
          .tasks.filter((task) => task.status !== 'completed')
          .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
          .slice(0, limit);
      },
    }),
    {
      name: 'task-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
