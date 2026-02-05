import { Hono } from 'hono';
import type { Env } from '../index';

const subscriptionsRouter = new Hono<{ Bindings: Env }>();

// GET /api/v1/subscriptions/status
subscriptionsRouter.get('/status', async (c) => {
  const userId = c.get('userId');
  
  const user = await c.env.DB.prepare(`
    SELECT subscription_tier, subscription_status, revenuecat_app_user_id
    FROM users WHERE id = ?
  `).bind(userId).first();
  
  return c.json({
    data: {
      tier: user?.subscription_tier || 'free',
      status: user?.subscription_status || 'active',
      is_premium: user?.subscription_tier === 'premium' || user?.subscription_tier === 'enterprise',
      features: getFeaturesForTier(user?.subscription_tier || 'free'),
    }
  });
});

// POST /api/v1/subscriptions/revenuecat-id
// Called from mobile app after RevenueCat initialization
subscriptionsRouter.post('/revenuecat-id', async (c) => {
  const userId = c.get('userId');
  const { revenuecat_app_user_id } = await c.req.json();
  
  await c.env.DB.prepare(`
    UPDATE users SET revenuecat_app_user_id = ? WHERE id = ?
  `).bind(revenuecat_app_user_id, userId).run();
  
  return c.json({ message: 'RevenueCat ID linked' });
});

// GET /api/v1/subscriptions/plans
subscriptionsRouter.get('/plans', async (c) => {
  return c.json({
    data: [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        features: [
          'Up to 50 tasks',
          'Up to 3 goals',
          'Basic AI suggestions',
          'Email reminders',
        ],
        limits: {
          tasks: 50,
          goals: 3,
          ai_requests_per_day: 5,
        }
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 9.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'Unlimited tasks',
          'Unlimited goals',
          'Advanced AI daily planning',
          'Calendar sync (Google, Apple, Outlook)',
          'Priority support',
          'Custom themes',
        ],
        limits: {
          tasks: -1, // unlimited
          goals: -1,
          ai_requests_per_day: 50,
        }
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 29.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'Everything in Premium',
          'Team collaboration',
          'Admin dashboard',
          'SSO integration',
          'Dedicated support',
          'Custom AI models',
        ],
        limits: {
          tasks: -1,
          goals: -1,
          ai_requests_per_day: -1,
        }
      }
    ]
  });
});

function getFeaturesForTier(tier: string): string[] {
  const features: Record<string, string[]> = {
    free: ['tasks_basic', 'goals_basic', 'ai_basic', 'email_reminders'],
    premium: [
      'tasks_unlimited', 'goals_unlimited', 'ai_advanced', 
      'calendar_sync', 'push_notifications', 'custom_themes', 'priority_support'
    ],
    enterprise: [
      'tasks_unlimited', 'goals_unlimited', 'ai_advanced',
      'calendar_sync', 'push_notifications', 'custom_themes',
      'team_collaboration', 'admin_dashboard', 'sso', 'dedicated_support'
    ],
  };
  return features[tier] || features.free;
}

export { subscriptionsRouter };
