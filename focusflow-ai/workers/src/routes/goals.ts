import { Hono } from 'hono';
import type { Env } from '../index';

const goalsRouter = new Hono<{ Bindings: Env }>();

// GET /api/v1/goals
goalsRouter.get('/', async (c) => {
  const userId = c.get('userId');
  const { results } = await c.env.DB.prepare(`
    SELECT * FROM goals 
    WHERE user_id = ? AND deleted_at IS NULL 
    ORDER BY created_at DESC
  `).bind(userId).all();
  
  return c.json({ data: results || [] });
});

// GET /api/v1/goals/:id
goalsRouter.get('/:id', async (c) => {
  const userId = c.get('userId');
  const goalId = c.req.param('id');
  
  const goal = await c.env.DB.prepare(`
    SELECT g.*, 
      (SELECT json_group_array(
        json_object('id', m.id, 'title', m.title, 'status', m.status, 'target_date', m.target_date)
      ) FROM milestones m WHERE m.goal_id = g.id) as milestones
    FROM goals g
    WHERE g.id = ? AND g.user_id = ? AND g.deleted_at IS NULL
  `).bind(goalId, userId).first();
  
  if (!goal) {
    return c.json({ error: 'Goal not found' }, 404);
  }
  
  return c.json({ data: goal });
});

// POST /api/v1/goals
goalsRouter.post('/', async (c) => {
  const userId = c.get('userId');
  const data = await c.req.json();
  const goalId = crypto.randomUUID();
  
  await c.env.DB.prepare(`
    INSERT INTO goals (id, user_id, title, description, category, target_date, color, icon)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    goalId,
    userId,
    data.title,
    data.description || null,
    data.category || null,
    data.target_date || null,
    data.color || null,
    data.icon || null
  ).run();
  
  // Create milestones if provided
  if (data.milestones && Array.isArray(data.milestones)) {
    for (let i = 0; i < data.milestones.length; i++) {
      const m = data.milestones[i];
      await c.env.DB.prepare(`
        INSERT INTO milestones (id, goal_id, user_id, title, description, order_index, target_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(crypto.randomUUID(), goalId, userId, m.title, m.description || null, i, m.target_date || null).run();
    }
  }
  
  return c.json({ data: { id: goalId, ...data }, message: 'Goal created' }, 201);
});

// PATCH /api/v1/goals/:id
goalsRouter.patch('/:id', async (c) => {
  const userId = c.get('userId');
  const goalId = c.req.param('id');
  const data = await c.req.json();
  
  await c.env.DB.prepare(`
    UPDATE goals 
    SET title = COALESCE(?, title),
        description = COALESCE(?, description),
        target_date = COALESCE(?, target_date),
        progress = COALESCE(?, progress),
        status = COALESCE(?, status)
    WHERE id = ? AND user_id = ?
  `).bind(
    data.title,
    data.description,
    data.target_date,
    data.progress,
    data.status,
    goalId,
    userId
  ).run();
  
  return c.json({ message: 'Goal updated' });
});

// POST /api/v1/goals/:id/complete
goalsRouter.post('/:id/complete', async (c) => {
  const userId = c.get('userId');
  const goalId = c.req.param('id');
  
  await c.env.DB.prepare(`
    UPDATE goals 
    SET status = 'completed', progress = 100, completed_at = datetime('now')
    WHERE id = ? AND user_id = ?
  `).bind(goalId, userId).run();
  
  return c.json({ message: 'Goal completed' });
});

// DELETE /api/v1/goals/:id
goalsRouter.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const goalId = c.req.param('id');
  
  await c.env.DB.prepare(`
    UPDATE goals SET deleted_at = datetime('now') WHERE id = ? AND user_id = ?
  `).bind(goalId, userId).run();
  
  return c.json({ message: 'Goal deleted' });
});

export { goalsRouter };
