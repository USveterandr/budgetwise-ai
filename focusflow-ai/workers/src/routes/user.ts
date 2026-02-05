import { Hono } from 'hono';
import type { Env } from '../index';

const userRouter = new Hono<{ Bindings: Env }>();

// GET /api/v1/user/profile
userRouter.get('/profile', async (c) => {
  const userId = c.get('userId');
  
  const user = await c.env.DB.prepare(`
    SELECT id, email, first_name, last_name, display_name, avatar_url,
           timezone, language, subscription_tier, onboarding_completed, created_at
    FROM users WHERE id = ?
  `).bind(userId).first();
  
  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }
  
  return c.json({ data: user });
});

// PATCH /api/v1/user/profile
userRouter.patch('/profile', async (c) => {
  const userId = c.get('userId');
  const data = await c.req.json();
  
  await c.env.DB.prepare(`
    UPDATE users 
    SET first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        display_name = COALESCE(?, display_name),
        timezone = COALESCE(?, timezone),
        language = COALESCE(?, language),
        avatar_url = COALESCE(?, avatar_url),
        onboarding_completed = COALESCE(?, onboarding_completed),
        updated_at = datetime('now')
    WHERE id = ?
  `).bind(
    data.first_name,
    data.last_name,
    data.display_name,
    data.timezone,
    data.language,
    data.avatar_url,
    data.onboarding_completed,
    userId
  ).run();
  
  return c.json({ message: 'Profile updated' });
});

// GET /api/v1/user/stats
userRouter.get('/stats', async (c) => {
  const userId = c.get('userId');
  
  const stats = await c.env.DB.prepare(`
    SELECT 
      (SELECT COUNT(*) FROM tasks WHERE user_id = ? AND deleted_at IS NULL) as total_tasks,
      (SELECT COUNT(*) FROM tasks WHERE user_id = ? AND status = 'completed' AND deleted_at IS NULL) as completed_tasks,
      (SELECT COUNT(*) FROM goals WHERE user_id = ? AND deleted_at IS NULL) as total_goals,
      (SELECT COUNT(*) FROM goals WHERE user_id = ? AND status = 'completed' AND deleted_at IS NULL) as completed_goals,
      (SELECT COUNT(*) FROM calendar_events WHERE user_id = ? AND deleted_at IS NULL) as total_events,
      (SELECT productivity_score FROM productivity_stats WHERE user_id = ? ORDER BY stat_date DESC LIMIT 1) as current_productivity_score
  `).bind(userId, userId, userId, userId, userId, userId).first();
  
  return c.json({ data: stats });
});

// GET /api/v1/user/integrations
userRouter.get('/integrations', async (c) => {
  const userId = c.get('userId');
  
  const { results } = await c.env.DB.prepare(`
    SELECT integration_type, status, last_sync_at, created_at
    FROM integrations WHERE user_id = ?
  `).bind(userId).all();
  
  return c.json({ data: results || [] });
});

// DELETE /api/v1/user/integrations/:type
userRouter.delete('/integrations/:type', async (c) => {
  const userId = c.get('userId');
  const type = c.req.param('type');
  
  await c.env.DB.prepare(`
    DELETE FROM integrations WHERE user_id = ? AND integration_type = ?
  `).bind(userId, type).run();
  
  return c.json({ message: 'Integration removed' });
});

export { userRouter };
