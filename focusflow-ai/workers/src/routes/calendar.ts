import { Hono } from 'hono';
import type { Env } from '../index';

const calendarRouter = new Hono<{ Bindings: Env }>();

// GET /api/v1/calendar/events
calendarRouter.get('/events', async (c) => {
  const userId = c.get('userId');
  const start = c.req.query('start');
  const end = c.req.query('end');
  
  let query = `
    SELECT * FROM calendar_events 
    WHERE user_id = ? AND deleted_at IS NULL
  `;
  const params: (string | null)[] = [userId];
  
  if (start) {
    query += ' AND start_time >= ?';
    params.push(start);
  }
  if (end) {
    query += ' AND end_time <= ?';
    params.push(end);
  }
  
  query += ' ORDER BY start_time ASC';
  
  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  
  return c.json({ data: results || [] });
});

// POST /api/v1/calendar/events
calendarRouter.post('/events', async (c) => {
  const userId = c.get('userId');
  const data = await c.req.json();
  const eventId = crypto.randomUUID();
  
  await c.env.DB.prepare(`
    INSERT INTO calendar_events (
      id, user_id, title, description, location,
      start_time, end_time, all_day, recurrence_rule, event_type
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    eventId,
    userId,
    data.title,
    data.description || null,
    data.location || null,
    data.start_time,
    data.end_time,
    data.all_day || 0,
    data.recurrence_rule || null,
    data.event_type || 'general'
  ).run();
  
  return c.json({ data: { id: eventId, ...data }, message: 'Event created' }, 201);
});

// PATCH /api/v1/calendar/events/:id
calendarRouter.patch('/events/:id', async (c) => {
  const userId = c.get('userId');
  const eventId = c.req.param('id');
  const data = await c.req.json();
  
  await c.env.DB.prepare(`
    UPDATE calendar_events 
    SET title = COALESCE(?, title),
        description = COALESCE(?, description),
        start_time = COALESCE(?, start_time),
        end_time = COALESCE(?, end_time),
        updated_at = datetime('now')
    WHERE id = ? AND user_id = ?
  `).bind(data.title, data.description, data.start_time, data.end_time, eventId, userId).run();
  
  return c.json({ message: 'Event updated' });
});

// DELETE /api/v1/calendar/events/:id
calendarRouter.delete('/events/:id', async (c) => {
  const userId = c.get('userId');
  const eventId = c.req.param('id');
  
  await c.env.DB.prepare(`
    UPDATE calendar_events SET deleted_at = datetime('now') 
    WHERE id = ? AND user_id = ?
  `).bind(eventId, userId).run();
  
  return c.json({ message: 'Event deleted' });
});

// POST /api/v1/calendar/sync
calendarRouter.post('/sync', async (c) => {
  const userId = c.get('userId');
  const { provider } = await c.req.json(); // google, apple, outlook
  
  // Get integration credentials
  const integration = await c.env.DB.prepare(`
    SELECT * FROM integrations 
    WHERE user_id = ? AND integration_type = ?
  `).bind(userId, `${provider}_calendar`).first();
  
  if (!integration) {
    return c.json({ error: `No ${provider} calendar connected` }, 400);
  }
  
  // Trigger sync (would call provider API)
  // For now, return success
  
  return c.json({ 
    message: 'Sync initiated',
    provider,
    last_sync: integration.last_sync_at 
  });
});

export { calendarRouter };
