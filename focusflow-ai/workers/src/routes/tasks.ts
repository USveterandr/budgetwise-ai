import { Hono } from 'hono';
import { getAuth } from '@clerk/backend';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../index';

const tasksRouter = new Hono<{ Bindings: Env }>();

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  due_date: z.string().datetime().optional(),
  start_date: z.string().datetime().optional(),
  estimated_minutes: z.number().int().positive().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  goal_id: z.string().uuid().optional(),
  recurrence_rule: z.string().optional(),
});

const updateTaskSchema = createTaskSchema.partial();

const taskFilterSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  category: z.string().optional(),
  due_before: z.string().datetime().optional(),
  due_after: z.string().datetime().optional(),
  search: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

// Authentication middleware for all task routes
tasksRouter.use('*', async (c, next) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  c.set('userId', auth.userId);
  await next();
});

// GET /api/v1/tasks - List tasks with filtering
// @ts-ignore
tasksRouter.get('/', zValidator('query', taskFilterSchema), async (c) => {
  const userId = c.get('userId');
  const filters = c.req.valid('query');
  
  let query = `
    SELECT 
      t.*,
      g.title as goal_title,
      g.color as goal_color
    FROM tasks t
    LEFT JOIN goals g ON t.goal_id = g.id
    WHERE t.user_id = ? 
    AND t.deleted_at IS NULL
  `;
  
  const params: (string | number)[] = [userId];
  
  if (filters.status) {
    query += ' AND t.status = ?';
    params.push(filters.status);
  }
  
  if (filters.priority) {
    query += ' AND t.priority = ?';
    params.push(filters.priority);
  }
  
  if (filters.category) {
    query += ' AND t.category = ?';
    params.push(filters.category);
  }
  
  if (filters.due_before) {
    query += ' AND t.due_date <= ?';
    params.push(filters.due_before);
  }
  
  if (filters.due_after) {
    query += ' AND t.due_date >= ?';
    params.push(filters.due_after);
  }
  
  if (filters.search) {
    query += ' AND (t.title LIKE ? OR t.description LIKE ?)';
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm);
  }
  
  // Get total count
  const countQuery = query.replace(/SELECT.*?FROM/, 'SELECT COUNT(*) as total FROM');
  const countResult = await c.env.DB.prepare(countQuery).bind(...params).first<{ total: number }>();
  const total = countResult?.total || 0;
  
  // Add ordering and pagination
  query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
  params.push(filters.limit, filters.offset);
  
  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  
  // Parse JSON fields
  const tasks = (results || []).map(task => ({
    ...task,
    tags: task.tags ? JSON.parse(task.tags as string) : [],
    attachments: task.attachments ? JSON.parse(task.attachments as string) : [],
  }));
  
  return c.json({
    data: tasks,
    pagination: {
      total,
      limit: filters.limit,
      offset: filters.offset,
      has_more: total > filters.offset + filters.limit,
    },
  });
});

// GET /api/v1/tasks/:id - Get single task
// @ts-ignore
tasksRouter.get('/:id', async (c) => {
  const userId = c.get('userId');
  const taskId = c.req.param('id');
  
  const task = await c.env.DB.prepare(`
    SELECT 
      t.*,
      g.title as goal_title,
      g.color as goal_color
    FROM tasks t
    LEFT JOIN goals g ON t.goal_id = g.id
    WHERE t.id = ? AND t.user_id = ? AND t.deleted_at IS NULL
  `).bind(taskId, userId).first();
  
  if (!task) {
    return c.json({ error: 'Task not found' }, 404);
  }
  
  return c.json({
    data: {
      ...task,
      tags: task.tags ? JSON.parse(task.tags as string) : [],
      attachments: task.attachments ? JSON.parse(task.attachments as string) : [],
    },
  });
});

// POST /api/v1/tasks - Create task
// @ts-ignore
tasksRouter.post('/', zValidator('json', createTaskSchema), async (c) => {
  const userId = c.get('userId');
  const data = c.req.valid('json');
  
  const taskId = crypto.randomUUID();
  
  await c.env.DB.prepare(`
    INSERT INTO tasks (
      id, user_id, title, description, priority, status,
      due_date, start_date, estimated_minutes, category,
      tags, goal_id, recurrence_rule, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).bind(
    taskId,
    userId,
    data.title,
    data.description || null,
    data.priority,
    'pending',
    data.due_date || null,
    data.start_date || null,
    data.estimated_minutes || null,
    data.category || null,
    data.tags ? JSON.stringify(data.tags) : '[]',
    data.goal_id || null,
    data.recurrence_rule || null
  ).run();
  
  // Log analytics event
  c.env.ANALYTICS?.writeDataPoint({
    blobs: [userId, 'task_created', taskId],
    doubles: [1],
    indexes: [Date.now().toString()],
  });
  
  // If task has due date, create reminder
  if (data.due_date) {
    await c.env.DB.prepare(`
      INSERT INTO reminders (id, user_id, type, title, body, scheduled_at, related_entity_type, related_entity_id)
      VALUES (?, ?, 'task_due', ?, ?, datetime(?, '-1 hour'), 'task', ?)
    `).bind(
      crypto.randomUUID(),
      userId,
      `Task Due: ${data.title}`,
      `Your task "${data.title}" is due soon`,
      data.due_date,
      taskId
    ).run();
  }
  
  return c.json({
    data: { id: taskId, ...data, user_id: userId, status: 'pending' },
    message: 'Task created successfully',
  }, 201);
});

// PATCH /api/v1/tasks/:id - Update task
// @ts-ignore
tasksRouter.patch('/:id', zValidator('json', updateTaskSchema), async (c) => {
  const userId = c.get('userId');
  const taskId = c.req.param('id');
  const data = c.req.valid('json');
  
  // Check if task exists and belongs to user
  const existing = await c.env.DB.prepare(`
    SELECT * FROM tasks WHERE id = ? AND user_id = ? AND deleted_at IS NULL
  `).bind(taskId, userId).first();
  
  if (!existing) {
    return c.json({ error: 'Task not found' }, 404);
  }
  
  // Build dynamic update query
  const updates: string[] = [];
  const params: (string | number | null)[] = [];
  
  if (data.title !== undefined) {
    updates.push('title = ?');
    params.push(data.title);
  }
  if (data.description !== undefined) {
    updates.push('description = ?');
    params.push(data.description);
  }
  if (data.priority !== undefined) {
    updates.push('priority = ?');
    params.push(data.priority);
  }
  if (data.due_date !== undefined) {
    updates.push('due_date = ?');
    params.push(data.due_date);
  }
  if (data.start_date !== undefined) {
    updates.push('start_date = ?');
    params.push(data.start_date);
  }
  if (data.estimated_minutes !== undefined) {
    updates.push('estimated_minutes = ?');
    params.push(data.estimated_minutes);
  }
  if (data.category !== undefined) {
    updates.push('category = ?');
    params.push(data.category);
  }
  if (data.tags !== undefined) {
    updates.push('tags = ?');
    params.push(JSON.stringify(data.tags));
  }
  if (data.goal_id !== undefined) {
    updates.push('goal_id = ?');
    params.push(data.goal_id);
  }
  if (data.recurrence_rule !== undefined) {
    updates.push('recurrence_rule = ?');
    params.push(data.recurrence_rule);
  }
  
  if (updates.length === 0) {
    return c.json({ error: 'No fields to update' }, 400);
  }
  
  params.push(taskId);
  
  await c.env.DB.prepare(`
    UPDATE tasks 
    SET ${updates.join(', ')}, updated_at = datetime('now')
    WHERE id = ?
  `).bind(...params).run();
  
  // Log analytics event
  c.env.ANALYTICS?.writeDataPoint({
    blobs: [userId, 'task_updated', taskId],
    doubles: [1],
    indexes: [Date.now().toString()],
  });
  
  return c.json({
    data: { id: taskId, ...data },
    message: 'Task updated successfully',
  });
});

// POST /api/v1/tasks/:id/complete - Mark task as complete
// @ts-ignore
tasksRouter.post('/:id/complete', async (c) => {
  const userId = c.get('userId');
  const taskId = c.req.param('id');
  
  const result = await c.env.DB.prepare(`
    UPDATE tasks 
    SET status = 'completed', completed_at = datetime('now'), updated_at = datetime('now')
    WHERE id = ? AND user_id = ? AND deleted_at IS NULL
  `).bind(taskId, userId).run();
  
  if (result.meta.rows_written === 0) {
    return c.json({ error: 'Task not found' }, 404);
  }
  
  // Update goal progress if task is linked to a goal
  await c.env.DB.prepare(`
    UPDATE goals 
    SET progress = (
      SELECT ROUND(
        (COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / COUNT(*))
      )
      FROM tasks 
      WHERE goal_id = goals.id AND deleted_at IS NULL
    ),
    updated_at = datetime('now')
    WHERE id IN (SELECT goal_id FROM tasks WHERE id = ?)
  `).bind(taskId).run();
  
  // Mark reminder as completed
  await c.env.DB.prepare(`
    UPDATE reminders 
    SET status = 'dismissed', dismissed_at = datetime('now')
    WHERE related_entity_id = ? AND related_entity_type = 'task'
  `).bind(taskId).run();
  
  // Log analytics event
  c.env.ANALYTICS?.writeDataPoint({
    blobs: [userId, 'task_completed', taskId],
    doubles: [1],
    indexes: [Date.now().toString()],
  });
  
  return c.json({ message: 'Task marked as completed' });
});

// DELETE /api/v1/tasks/:id - Soft delete task
// @ts-ignore
tasksRouter.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const taskId = c.req.param('id');
  
  const result = await c.env.DB.prepare(`
    UPDATE tasks 
    SET deleted_at = datetime('now'), updated_at = datetime('now')
    WHERE id = ? AND user_id = ? AND deleted_at IS NULL
  `).bind(taskId, userId).run();
  
  if (result.meta.rows_written === 0) {
    return c.json({ error: 'Task not found' }, 404);
  }
  
  // Delete associated reminders
  await c.env.DB.prepare(`
    UPDATE reminders 
    SET status = 'dismissed', dismissed_at = datetime('now')
    WHERE related_entity_id = ? AND related_entity_type = 'task'
  `).bind(taskId).run();
  
  // Log analytics event
  c.env.ANALYTICS?.writeDataPoint({
    blobs: [userId, 'task_deleted', taskId],
    doubles: [1],
    indexes: [Date.now().toString()],
  });
  
  return c.json({ message: 'Task deleted successfully' });
});

export { tasksRouter };
