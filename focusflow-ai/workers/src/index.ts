import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { clerkMiddleware, getAuth } from '@clerk/backend';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

// Import routes
import { tasksRouter } from './routes/tasks';
import { goalsRouter } from './routes/goals';
import { calendarRouter } from './routes/calendar';
import { aiRouter } from './routes/ai';
import { remindersRouter } from './routes/reminders';
import { subscriptionsRouter } from './routes/subscriptions';
import { userRouter } from './routes/user';

// Types
export interface Env {
  DB: D1Database;
  AVATARS_BUCKET: R2Bucket;
  ATTACHMENTS_BUCKET: R2Bucket;
  CACHE: KVNamespace;
  NOTIFICATION_QUEUE: Queue;
  ANALYTICS: AnalyticsEngineDataset;
  CLERK_SECRET_KEY: string;
  REVENUECAT_SECRET_API_KEY: string;
  GEMINI_API_KEY: string;
}

// Create app
const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', cors({
  origin: ['http://localhost:8081', 'https://focusflow.app'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  credentials: true,
}));

// Clerk authentication middleware
app.use('*', clerkMiddleware({
  secretKey: (c) => c.env.CLERK_SECRET_KEY,
  publishableKey: (c) => c.env.CLERK_PUBLISHABLE_KEY || '',
}));

// Request ID middleware
app.use('*', async (c, next) => {
  const requestId = crypto.randomUUID();
  c.header('X-Request-ID', requestId);
  c.set('requestId', requestId);
  await next();
});

// Logging middleware
app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  
  console.log({
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    duration: `${duration}ms`,
    requestId: c.get('requestId'),
    userId: getAuth(c)?.userId || 'anonymous',
  });
});

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    service: 'focusflow-api',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API v1 routes
app.route('/api/v1/tasks', tasksRouter);
app.route('/api/v1/goals', goalsRouter);
app.route('/api/v1/calendar', calendarRouter);
app.route('/api/v1/ai', aiRouter);
app.route('/api/v1/reminders', remindersRouter);
app.route('/api/v1/subscriptions', subscriptionsRouter);
app.route('/api/v1/user', userRouter);

// Webhook routes
app.post('/webhooks/revenuecat', async (c) => {
  const body = await c.req.json();
  
  // Process RevenueCat webhook
  // Update user subscription status in D1
  
  return c.json({ received: true });
});

app.post('/webhooks/clerk', async (c) => {
  const body = await c.req.json();
  const eventType = body.type;
  
  // Handle Clerk webhooks
  switch (eventType) {
    case 'user.created':
      // Create user record in D1
      await c.env.DB.prepare(`
        INSERT INTO users (id, email, first_name, last_name, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
      `).bind(
        body.data.id,
        body.data.email_addresses?.[0]?.email_address,
        body.data.first_name,
        body.data.last_name
      ).run();
      break;
      
    case 'user.updated':
      // Update user record
      await c.env.DB.prepare(`
        UPDATE users 
        SET email = ?, first_name = ?, last_name = ?, updated_at = datetime('now')
        WHERE id = ?
      `).bind(
        body.data.email_addresses?.[0]?.email_address,
        body.data.first_name,
        body.data.last_name,
        body.data.id
      ).run();
      break;
      
    case 'user.deleted':
      // Soft delete user and related data
      await c.env.DB.prepare(`
        UPDATE users SET deleted_at = datetime('now') WHERE id = ?
      `).bind(body.data.id).run();
      break;
  }
  
  return c.json({ received: true });
});

// Scheduled job handler
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return app.fetch(request, env, ctx);
  },
  
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    // Handle cron triggers
    const hour = new Date(event.scheduledTime).getUTCHours();
    
    if (hour === 6) {
      // Daily 6 AM - Generate AI daily plans
      ctx.waitUntil(generateDailyPlans(env));
    } else {
      // Every 4 hours - Send pending reminders
      ctx.waitUntil(processPendingReminders(env));
    }
  },
  
  async queue(batch: MessageBatch, env: Env, ctx: ExecutionContext): Promise<void> {
    // Process notification queue messages
    for (const message of batch.messages) {
      ctx.waitUntil(sendNotification(message.body as NotificationPayload, env));
    }
  },
};

// Helper functions
async function generateDailyPlans(env: Env) {
  // Get all users with pending tasks
  const { results } = await env.DB.prepare(`
    SELECT DISTINCT user_id FROM tasks 
    WHERE status != 'completed' 
    AND deleted_at IS NULL
    AND due_date >= date('now')
  `).all<{ user_id: string }>();
  
  for (const { user_id } of results || []) {
    // Generate AI daily plan for each user
    // This would call the Gemini API and store the plan
  }
}

async function processPendingReminders(env: Env) {
  // Get pending reminders that are due
  const { results } = await env.DB.prepare(`
    SELECT * FROM reminders 
    WHERE status = 'pending' 
    AND scheduled_at <= datetime('now')
  `).all();
  
  for (const reminder of results || []) {
    // Send to notification queue
    await env.NOTIFICATION_QUEUE.send(reminder);
  }
}

async function sendNotification(payload: NotificationPayload, env: Env) {
  // Send push notification via Expo Push API
  // Implementation details...
}

interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}
