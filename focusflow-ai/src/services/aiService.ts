import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true,
});

export interface DailyPlan {
  prioritizedTasks: string[];
  suggestions: string[];
  estimatedTime: string;
  motivationalMessage: string;
}

export interface ProductivityInsight {
  score: number;
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
}

export interface AIAnalysis {
  taskAnalysis: string;
  goalAlignment: string;
  timeManagement: string;
  suggestions: string[];
}

export const AIService = {
  async generateDailyPlan(
    tasks: Array<{ title: string; priority: string; dueDate?: string }>,
    goals: Array<{ title: string; targetDate?: string }>,
    completedTasks: number,
    totalTasks: number
  ): Promise<DailyPlan> {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful productivity assistant. Generate a daily plan based on tasks and goals.',
          },
          {
            role: 'user',
            content: `
              Tasks: ${JSON.stringify(tasks)}
              Goals: ${JSON.stringify(goals)}
              Progress: ${completedTasks}/${totalTasks} tasks completed
              
              Generate a concise daily plan with:
              - 3-5 prioritized tasks
              - 2-3 productivity suggestions
              - Estimated time to complete
              - A short motivational message
              
              Return as JSON with keys: prioritizedTasks, suggestions, estimatedTime, motivationalMessage
            `,
          },
        ],
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0].message.content;
      return content ? JSON.parse(content) : this.getDefaultDailyPlan();
    } catch (error) {
      console.error('AI Service Error:', error);
      return this.getDefaultDailyPlan();
    }
  },

  async getProductivityInsights(
    weeklyStats: {
      tasksCompleted: number;
      tasksCreated: number;
      goalsProgress: number;
      averageCompletionTime: number;
    }
  ): Promise<ProductivityInsight> {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a productivity analyst. Provide insights based on weekly statistics.',
          },
          {
            role: 'user',
            content: `
              Weekly Stats:
              - Tasks Completed: ${weeklyStats.tasksCompleted}
              - Tasks Created: ${weeklyStats.tasksCreated}
              - Goals Progress: ${weeklyStats.goalsProgress}%
              - Average Completion Time: ${weeklyStats.averageCompletionTime} hours
              
              Provide productivity insights with:
              - A score (0-100)
              - 2-3 strengths
              - 2-3 areas for improvement
              - 3-5 actionable recommendations
              
              Return as JSON with keys: score, strengths, areasForImprovement, recommendations
            `,
          },
        ],
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0].message.content;
      return content ? JSON.parse(content) : this.getDefaultProductivityInsight();
    } catch (error) {
      console.error('AI Service Error:', error);
      return this.getDefaultProductivityInsight();
    }
  },

  async analyzeTaskPerformance(
    taskHistory: Array<{ title: string; completed: boolean; completionTime?: number }>
  ): Promise<AIAnalysis> {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Analyze task performance and provide recommendations.',
          },
          {
            role: 'user',
            content: `
              Task History: ${JSON.stringify(taskHistory)}
              
              Analyze and provide:
              - Task completion patterns
              - Goal alignment
              - Time management assessment
              - 3-5 specific suggestions for improvement
              
              Return as JSON with keys: taskAnalysis, goalAlignment, timeManagement, suggestions
            `,
          },
        ],
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0].message.content;
      return content ? JSON.parse(content) : this.getDefaultAIAnalysis();
    } catch (error) {
      console.error('AI Service Error:', error);
      return this.getDefaultAIAnalysis();
    }
  },

  async getSmartSuggestion(
    context: string,
    userPrompt: string
  ): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful productivity assistant. Provide concise, actionable suggestions.',
          },
          {
            role: 'user',
            content: `
              Context: ${context}
              User Request: ${userPrompt}
              
              Provide a helpful suggestion in 1-2 sentences.
            `,
          },
        ],
        max_tokens: 150,
      });

      return completion.choices[0].message.content || 'I suggest breaking down your task into smaller steps.';
    } catch (error) {
      console.error('AI Service Error:', error);
      return 'Try focusing on your highest priority tasks first.';
    }
  },

  getDefaultDailyPlan(): DailyPlan {
    return {
      prioritizedTasks: ['Review your task list', 'Start with highest priority task', 'Schedule breaks'],
      suggestions: ['Use the Pomodoro technique', 'Minimize distractions', 'Take regular breaks'],
      estimatedTime: '4-6 hours',
      motivationalMessage: 'You can achieve great things today!',
    };
  },

  getDefaultProductivityInsight(): ProductivityInsight {
    return {
      score: 70,
      strengths: ['Consistent task completion', 'Goal tracking'],
      areasForImprovement: ['Time estimation', 'Prioritization'],
      recommendations: [
        'Review daily priorities each morning',
        'Track time spent on tasks',
        'Celebrate small wins',
      ],
    };
  },

  getDefaultAIAnalysis(): AIAnalysis {
    return {
      taskAnalysis: 'Good progress on task completion.',
      goalAlignment: 'Tasks align well with your goals.',
      timeManagement: 'Consider better time estimation.',
      suggestions: ['Set more specific deadlines', 'Break large tasks into smaller ones'],
    };
  },
};
