import { Hono } from 'hono';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Env } from '../index';

const aiRouter = new Hono<{ Bindings: Env }>();

// POST /api/v1/ai/daily-plan
aiRouter.post('/daily-plan', async (c) => {
  const userId = c.get('userId');
  const { date } = await c.req.json();
  
  // Get user's tasks for the day
  const { results: tasks } = await c.env.DB.prepare(`
    SELECT * FROM tasks 
    WHERE user_id = ? 
    AND status != 'completed'
    AND deleted_at IS NULL
    AND (due_date = ? OR due_date BETWEEN ? AND date(?, '+1 day'))
    ORDER BY priority DESC, due_date ASC
  `).bind(userId, date, date, date).all();
  
  // Get user's goals
  const { results: goals } = await c.env.DB.prepare(`
    SELECT * FROM goals 
    WHERE user_id = ? AND status = 'active' AND deleted_at IS NULL
  `).bind(userId).all();
  
  // Get calendar events
  const { results: events } = await c.env.DB.prepare(`
    SELECT * FROM calendar_events 
    WHERE user_id = ? AND deleted_at IS NULL
    AND date(start_time) = ?
    ORDER BY start_time ASC
  `).bind(userId, date).all();
  
  // Generate AI plan using Gemini
  const genAI = new GoogleGenerativeAI(c.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const prompt = `
    You are a productivity assistant. Create a daily plan based on:
    
    TASKS: ${JSON.stringify(tasks)}
    GOALS: ${JSON.stringify(goals)}
    CALENDAR: ${JSON.stringify(events)}
    
    Generate a JSON response with:
    - top_3_priorities: array of task IDs in priority order
    - time_blocks: array of {start_time, end_time, activity, type}
    - break_suggestions: array of break recommendations
    - carry_over_tasks: array of task IDs that should move to next day if not completed
    - productivity_insights: string with personalized insight
    - motivational_message: string
  `;
  
  const startTime = Date.now();
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  const generationTime = Date.now() - startTime;
  
  // Parse AI response (assuming valid JSON)
  let aiPlan;
  try {
    aiPlan = JSON.parse(text);
  } catch {
    // Fallback if not valid JSON
    aiPlan = {
      top_3_priorities: (tasks || []).slice(0, 3).map((t: any) => t.id),
      time_blocks: [],
      break_suggestions: ['Take a 5-minute break every hour'],
      carry_over_tasks: [],
      productivity_insights: 'Focus on your highest priority tasks first.',
      motivational_message: "You've got this! 💪"
    };
  }
  
  // Save plan to database
  const planId = crypto.randomUUID();
  await c.env.DB.prepare(`
    INSERT INTO ai_daily_plans (
      id, user_id, plan_date, prioritized_tasks, time_blocks,
      break_suggestions, carry_over_tasks, productivity_insights,
      motivational_message, tokens_used, generation_time_ms
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    planId,
    userId,
    date,
    JSON.stringify(aiPlan.top_3_priorities),
    JSON.stringify(aiPlan.time_blocks),
    JSON.stringify(aiPlan.break_suggestions),
    JSON.stringify(aiPlan.carry_over_tasks),
    aiPlan.productivity_insights,
    aiPlan.motivational_message,
    response.usageMetadata?.totalTokenCount || 0,
    generationTime
  ).run();
  
  return c.json({
    data: {
      id: planId,
      date,
      ...aiPlan,
      generation_time_ms: generationTime,
    }
  });
});

// POST /api/v1/ai/productivity-insight
aiRouter.post('/productivity-insight', async (c) => {
  const userId = c.get('userId');
  
  // Get last 7 days of productivity stats
  const { results: stats } = await c.env.DB.prepare(`
    SELECT * FROM productivity_stats 
    WHERE user_id = ? 
    AND stat_date >= date('now', '-7 days')
    ORDER BY stat_date DESC
  `).bind(userId).all();
  
  // Get recent task completion
  const { results: recentTasks } = await c.env.DB.prepare(`
    SELECT * FROM tasks 
    WHERE user_id = ? AND status = 'completed'
    AND completed_at >= datetime('now', '-7 days')
    ORDER BY completed_at DESC
  `).bind(userId).all();
  
  // Generate insight using Gemini
  const genAI = new GoogleGenerativeAI(c.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const prompt = `
    Analyze this productivity data and provide insights:
    
    STATS: ${JSON.stringify(stats)}
    RECENT_TASKS: ${JSON.stringify(recentTasks)}
    
    Provide a JSON response with:
    - score: number 0-100
    - strengths: array of strings
    - areas_for_improvement: array of strings
    - recommendations: array of strings
    - trend: 'improving' | 'declining' | 'stable'
  `;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  
  let insight;
  try {
    insight = JSON.parse(response.text());
  } catch {
    insight = {
      score: 75,
      strengths: ['Consistent task completion'],
      areas_for_improvement: ['Time estimation'],
      recommendations: ['Break large tasks into smaller ones'],
      trend: 'stable'
    };
  }
  
  return c.json({ data: insight });
});

// POST /api/v1/ai/chat
aiRouter.post('/chat', async (c) => {
  const userId = c.get('userId');
  const { message, conversation_id } = await c.req.json();
  
  // Get or create conversation
  let convId = conversation_id;
  if (!convId) {
    convId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO ai_conversations (id, user_id, conversation_type, title)
      VALUES (?, ?, 'general_chat', ?)
    `).bind(convId, userId, 'New Chat').run();
  }
  
  // Save user message
  await c.env.DB.prepare(`
    INSERT INTO ai_messages (id, conversation_id, user_id, role, content)
    VALUES (?, ?, ?, 'user', ?)
  `).bind(crypto.randomUUID(), convId, userId, message).run();
  
  // Get conversation context (last 10 messages)
  const { results: context } = await c.env.DB.prepare(`
    SELECT role, content FROM ai_messages
    WHERE conversation_id = ?
    ORDER BY created_at DESC
    LIMIT 10
  `).bind(convId).all();
  
  // Generate response using Gemini
  const genAI = new GoogleGenerativeAI(c.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const prompt = `You are a helpful productivity assistant. Previous context: ${JSON.stringify(context)}. User: ${message}`;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const aiResponse = response.text();
  
  // Save AI response
  const messageId = crypto.randomUUID();
  await c.env.DB.prepare(`
    INSERT INTO ai_messages (id, conversation_id, user_id, role, content, tokens_used, model)
    VALUES (?, ?, ?, 'assistant', ?, ?, 'gemini-1.5-flash')
  `).bind(messageId, convId, userId, aiResponse, response.usageMetadata?.totalTokenCount || 0).run();
  
  return c.json({
    data: {
      id: messageId,
      conversation_id: convId,
      content: aiResponse,
      role: 'assistant',
    }
  });
});

// GET /api/v1/ai/conversations
aiRouter.get('/conversations', async (c) => {
  const userId = c.get('userId');
  
  const { results } = await c.env.DB.prepare(`
    SELECT c.*, 
      (SELECT COUNT(*) FROM ai_messages WHERE conversation_id = c.id) as message_count,
      (SELECT content FROM ai_messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
    FROM ai_conversations c
    WHERE c.user_id = ?
    ORDER BY c.updated_at DESC
  `).bind(userId).all();
  
  return c.json({ data: results || [] });
});

// GET /api/v1/ai/conversations/:id/messages
aiRouter.get('/conversations/:id/messages', async (c) => {
  const userId = c.get('userId');
  const convId = c.req.param('id');
  
  const { results } = await c.env.DB.prepare(`
    SELECT * FROM ai_messages
    WHERE conversation_id = ? AND user_id = ?
    ORDER BY created_at ASC
  `).bind(convId, userId).all();
  
  return c.json({ data: results || [] });
});

export { aiRouter };
