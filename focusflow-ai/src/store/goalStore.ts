import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category?: string;
  target_date?: string;
  start_date: string;
  progress: number;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  color?: string;
  icon?: string;
  completed_at?: string;
  milestones?: Milestone[];
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  goal_id: string;
  title: string;
  description?: string;
  order_index: number;
  target_date?: string;
  completed_at?: string;
  status: 'pending' | 'completed' | 'skipped';
}

interface GoalState {
  goals: Goal[];
  isLoading: boolean;
  error: string | null;
  selectedGoal: Goal | null;
  
  setGoals: (goals: Goal[]) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  completeGoal: (id: string) => void;
  setSelectedGoal: (goal: Goal | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  getActiveGoals: () => Goal[];
  getCompletedGoals: () => Goal[];
  getGoalProgress: (goalId: string) => number;
}

export const useGoalStore = create<GoalState>()(
  persist(
    (set, get) => ({
      goals: [],
      isLoading: false,
      error: null,
      selectedGoal: null,
      
      setGoals: (goals) => set({ goals }),
      
      addGoal: (goal) => set((state) => ({
        goals: [goal, ...state.goals],
      })),
      
      updateGoal: (id, updates) => set((state) => ({
        goals: state.goals.map((goal) =>
          goal.id === id ? { ...goal, ...updates } : goal
        ),
      })),
      
      deleteGoal: (id) => set((state) => ({
        goals: state.goals.filter((goal) => goal.id !== id),
      })),
      
      completeGoal: (id) => set((state) => ({
        goals: state.goals.map((goal) =>
          goal.id === id
            ? { ...goal, status: 'completed', progress: 100, completed_at: new Date().toISOString() }
            : goal
        ),
      })),
      
      setSelectedGoal: (goal) => set({ selectedGoal: goal }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      
      getActiveGoals: () => {
        return get().goals.filter((goal) => goal.status === 'active');
      },
      
      getCompletedGoals: () => {
        return get().goals.filter((goal) => goal.status === 'completed');
      },
      
      getGoalProgress: (goalId) => {
        const goal = get().goals.find((g) => g.id === goalId);
        return goal?.progress || 0;
      },
    }),
    {
      name: 'goal-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
