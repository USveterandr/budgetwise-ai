import { ExecutionContext, ScheduledEvent } from '@cloudflare/workers-types';

export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // CORS Headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const jsonResponse = (data: any, status = 200) => 
      new Response(JSON.stringify(data), { 
        status, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });

    try {
      // --- POST /api/subscribe ---
      // Handles starting a trial or a direct subscription
      if (url.pathname === '/api/subscribe' && request.method === 'POST') {
        const body = await request.json() as any;
        const { userId, tier, billingCycle, isTrial, email, name } = body;

        if (!userId || !tier) {
          return jsonResponse({ error: 'Missing required fields: userId, tier' }, 400);
        }

        const now = Date.now();
        let status = 'active';
        let trialEndsAt = null;

        if (isTrial) {
          status = 'trial';
          // 7 days in milliseconds
          trialEndsAt = now + (7 * 24 * 60 * 60 * 1000);
        }

        // Upsert user subscription data
        // We use ON CONFLICT to update existing users or insert new ones
        await env.DB.prepare(`
          INSERT INTO users (id, email, name, subscription_tier, subscription_status, billing_cycle, trial_ends_at, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            subscription_tier = excluded.subscription_tier,
            subscription_status = excluded.subscription_status,
            billing_cycle = excluded.billing_cycle,
            trial_ends_at = excluded.trial_ends_at,
            updated_at = excluded.updated_at
        `).bind(
          userId, 
          email || null, 
          name || null, 
          tier, 
          status, 
          billingCycle || 'monthly', 
          trialEndsAt, 
          now, 
          now
        ).run();

        return jsonResponse({ success: true, status, trialEndsAt });
      }

      // --- GET /api/subscription/status ---
      // Checks current status, including lazy expiration check
      if (url.pathname === '/api/subscription/status' && request.method === 'GET') {
        const userId = url.searchParams.get('userId');
        if (!userId) return jsonResponse({ error: 'UserId required' }, 400);

        const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
        
        if (!user) {
          return jsonResponse({ status: 'none', tier: 'none' });
        }

        // Lazy check: if trial expired but cron hasn't run yet, report as expired
        let status = user.subscription_status;
        if (status === 'trial' && user.trial_ends_at && user.trial_ends_at < Date.now()) {
          status = 'expired';
        }

        return jsonResponse({ ...user, subscription_status: status });
      }

      return jsonResponse({ error: 'Not Found' }, 404);

    } catch (e: any) {
      return jsonResponse({ error: e.message }, 500);
    }
  },

  // --- Scheduled Cron Job ---
  // Runs periodically (e.g., every hour) to expire trials
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const now = Date.now();
    
    // Find users with 'trial' status whose trial_ends_at is in the past
    // Reset their tier to 'none' and status to 'expired'
    const result = await env.DB.prepare(`
      UPDATE users 
      SET subscription_tier = 'none', subscription_status = 'expired', updated_at = ?
      WHERE subscription_status = 'trial' AND trial_ends_at < ?
    `).bind(now, now).run();

    console.log(`[Cron] Expired ${result.meta.changes} trials at ${new Date().toISOString()}`);
  }
};