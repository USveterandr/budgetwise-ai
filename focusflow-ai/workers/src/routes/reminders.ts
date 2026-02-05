import { Hono } from 'hono';
import type { Env } from '../index';

const remindersRouter = new Hono<{ Bindings: Env }>();

// GET /api/v1/reminders
remindersRouter.get('/', async (c) => {
  const userId = c.get('userId');
  const status = c.req.query('status') || 'pending';
  
  const { results } = await c.env.DB.prepare(`
    SELECT * FROM reminders 
    WHERE user_id = ? AND status = ?
    ORDER BY scheduled_at ASC
  `).bind(userId, status).all();
  
  return c.json({ data: results || [] });
});

// POST /api/v1/reminders
remindersRouter.post('/', async (c) => {
  const userId = c.get('userId');
  const data = await c.req.json();
  const reminderId = crypto.randomUUID();
  
  await c.env.DB.prepare(`
    INSERT INTO reminders (id, user_id, type, title, body, scheduled_at, related_entity_type, related_entity_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    reminderId,
    userId,
    data.type,
    data.title,
    data.body,
    data.scheduled_at,
    data.related_entity_type || null,
    data.related_entity_id || null
  ).run();
  
  return c.json({ data: { id: reminderId, ...data }, message: 'Reminder created' }, 201);
});

// POST /api/v1/reminders/:id/dismiss
remindersRouter.post('/:id/dismiss', async (c) => {
  const userId = c.get('userId');
  const reminderId = c.req.param('id');
  
  await c.env.DB.prepare(`
    UPDATE reminders 
    SET status = 'dismissed', dismissed_at = datetime('now')
    WHERE id = ? AND user_id = ?
  `).bind(reminderId, userId).run();
  
  return c.json({ message: 'Reminder dismissed' });
});

// GET /api/v1/reminders/preferences
remindersRouter.get('/preferences', async (c) => {
  const userId = c.get('userId');
  
  const { results } = await c.env.DB.prepare(`
    SELECT * FROM notification_preferences 
    WHERE user_id = ?
  `).bind(userId).all();
  
  return c.json({ data: results || [] });
});

// PUT /api/v1/reminders/preferences/:type
remindersRouter.put('/preferences/:type', async (c) => {
  const userId = c.get('userId');
  const type = c.req.param('type');
  const data = await c.req.json();
  
  await c.env.DB.prepare(`
    INSERT INTO notification_preferences (id, user_id, reminder_type, enabled, channels, quiet_hours_start, quiet_hours_end)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, reminder_type) DO UPDATE SET
      enabled = excluded.enabled,
      channels = excluded.channels,
      quiet_hours_start = excluded.quiet_hours_start,
      quiet_hours_end = excluded.quiet_hours_end,
      updated_at = datetime('now')
  `).bind(
    crypto.randomUUID(),
    userId,
    type,
    data.enabled ? 1 : 0,
    JSON.stringify(data.channels),
    data.quiet_hours_start || null,
    data.quiet_hours_end || null
  ).run();
  
  return c.json({ message: 'Preferences updated' });
});

export { remindersRouter };
