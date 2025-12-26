/// <reference types="@cloudflare/workers-types" />
import { createClerkClient } from '@clerk/backend';

export interface Env {
    DB: D1Database;
    R2: R2Bucket;
    CLERK_SECRET_KEY: string;
    CLERK_PUBLISHABLE_KEY: string;
}

// Clerk configuration
const AUTHORIZED_PARTIES = [
    "https://budgetwise-ai.pages.dev",
    "https://clerk.budgetwise.isaac-trinidad.com",
    "http://localhost:8081",
    "http://localhost:19006"
];

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method;

        // CORS Headers
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        };

        if (method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }

        // Root / Health check
        if (path === "/" || path === "/api/health") {
            return Response.json({ status: "ok", message: "Budgetwise AI API (Clerk Enabled)", version: "1.2.0" }, { headers: corsHeaders });
        }

        // Initialize Clerk Client
        const clerkClient = createClerkClient({
            secretKey: env.CLERK_SECRET_KEY,
            publishableKey: env.CLERK_PUBLISHABLE_KEY,
        });

        // Authenticate request
        let verifiedUserId: string | null = null;

        try {
            const requestState = await clerkClient.authenticateRequest(request, {
                authorizedParties: AUTHORIZED_PARTIES,
            });

            // Handshake & Interstitial Logic
            if (requestState.headers) {
                const headers = new Headers(requestState.headers);
                const location = headers.get('location');
                if (location) {
                    // Handle redirect handshake
                    return new Response(null, { status: 307, headers: { 'Location': location, ...corsHeaders } });
                }
                
                if (requestState.status === 'handshake') {
                    throw new Error('Clerk: unexpected handshake without redirect');
                }
            }

            const auth = requestState.toAuth();
            verifiedUserId = auth ? auth.userId : null;

        } catch (e: any) {
            console.error("Clerk authentication error:", e);
            // Allow public endpoints if needed, but for now we assume all API routes are protected except health
            // If we want to allow unauthenticated access to some routes, we should check path here.
            // For now, we'll just return 401 if auth fails and we are not on a public route.
        }

        if (!verifiedUserId) {
             // If authentication failed, return 401
            return new Response(JSON.stringify({ error: "Authentication failed" }), { status: 401, headers: corsHeaders });
        }

        try {
            // Profiles API
            if (path === "/api/profile") {
                if (method === "GET") {
                    const profile = await env.DB.prepare("SELECT * FROM profiles WHERE user_id = ?")
                        .bind(verifiedUserId)
                        .first();
                    return Response.json(profile || {}, { headers: corsHeaders });
                }

                if (method === "POST" || method === "PUT") {
                    const body = await request.json() as any;
                    console.log(`[API] Updating profile for user ${verifiedUserId}. Data:`, JSON.stringify(body));

                    const user_id = verifiedUserId;
                    const name = body.name || null;
                    const email = body.email || null;
                    const plan = body.plan || 'Starter';
                    const monthly_income = body.monthly_income !== undefined ? body.monthly_income : 0;
                    const savings_rate = body.savings_rate !== undefined ? body.savings_rate : 0;
                    const currency = body.currency || 'USD';
                    const bio = body.bio || null;
                    const business_industry = body.business_industry || 'General';
                    const onboarding_complete = (monthly_income > 0) ? 1 : 0;

                    await env.DB.prepare(`
            INSERT INTO profiles (user_id, name, email, plan, monthly_income, savings_rate, currency, bio, business_industry, onboarding_complete)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
              name = COALESCE(excluded.name, profiles.name),
              plan = COALESCE(excluded.plan, profiles.plan),
              monthly_income = COALESCE(excluded.monthly_income, profiles.monthly_income),
              savings_rate = COALESCE(excluded.savings_rate, profiles.savings_rate),
              currency = COALESCE(excluded.currency, profiles.currency),
              bio = COALESCE(excluded.bio, profiles.bio),
              business_industry = COALESCE(excluded.business_industry, profiles.business_industry),
              onboarding_complete = COALESCE(excluded.onboarding_complete, profiles.onboarding_complete),
              updated_at = CURRENT_TIMESTAMP
          `).bind(user_id, name, email, plan, monthly_income, savings_rate, currency, bio, business_industry, onboarding_complete).run();

                    return Response.json({ success: true, onboarding_complete: !!onboarding_complete }, { headers: corsHeaders });
                }
            }

            // Transactions API
            if (path === "/api/transactions") {
                if (method === "GET") {
                    const { results } = await env.DB.prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC")
                        .bind(verifiedUserId)
                        .all();
                    return Response.json(results, { headers: corsHeaders });
                }

                if (method === "POST") {
                    const body = await request.json() as any;
                    const id = body.id || crypto.randomUUID();
                    await env.DB.prepare(`
            INSERT INTO transactions (id, user_id, description, amount, category, type, date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).bind(id, verifiedUserId, body.description, body.amount, body.category, body.type, body.date).run();
                    return Response.json({ id, success: true }, { headers: corsHeaders });
                }
            }

            if (path.startsWith("/api/transactions/") && method === "DELETE") {
                const id = path.split("/").pop();
                await env.DB.prepare("DELETE FROM transactions WHERE id = ? AND user_id = ?")
                    .bind(id, verifiedUserId)
                    .run();
                return Response.json({ success: true }, { headers: corsHeaders });
            }

            // Budgets API
            if (path === "/api/budgets") {
                const month = url.searchParams.get("month");
                if (method === "GET") {
                    const { results } = await env.DB.prepare("SELECT * FROM budgets WHERE user_id = ? AND month = ?")
                        .bind(verifiedUserId, month)
                        .all();
                    return Response.json(results, { headers: corsHeaders });
                }

                if (method === "POST") {
                    const body = await request.json() as any;
                    const id = body.id || crypto.randomUUID();
                    await env.DB.prepare(`
            INSERT INTO budgets (id, user_id, category, budget_limit, spent, month)
            VALUES (?, ?, ?, ?, ?, ?)
          `).bind(id, verifiedUserId, body.category, body.budget_limit, body.spent || 0, body.month).run();
                    return Response.json({ id, success: true }, { headers: corsHeaders });
                }

                if (method === "PUT") {
                    const body = await request.json() as any;
                    await env.DB.prepare("UPDATE budgets SET spent = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?")
                        .bind(body.spent, body.id, verifiedUserId)
                        .run();
                    return Response.json({ success: true }, { headers: corsHeaders });
                }
            }

            // Investments API
            if (path === "/api/investments") {
                if (method === "GET") {
                    const { results } = await env.DB.prepare("SELECT * FROM investments WHERE user_id = ?")
                        .bind(verifiedUserId)
                        .all();
                    return Response.json(results, { headers: corsHeaders });
                }

                if (method === "POST") {
                    const body = await request.json() as any;
                    const id = body.id || crypto.randomUUID();
                    await env.DB.prepare(`
            INSERT INTO investments (id, user_id, name, symbol, quantity, purchase_price, current_price, purchase_date, type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(id, verifiedUserId, body.name, body.symbol, body.quantity, body.purchase_price, body.current_price, body.purchase_date, body.type).run();
                    return Response.json({ id, success: true }, { headers: corsHeaders });
                }
            }

            if (path.startsWith("/api/investments/") && method === "PUT") {
                const id = path.split("/").pop();
                const body = await request.json() as any;
                const fields = Object.keys(body).map(k => `${k} = ?`).join(", ");
                const values = Object.values(body);
                await env.DB.prepare(`UPDATE investments SET ${fields} WHERE id = ? AND user_id = ?`)
                    .bind(...values, id, verifiedUserId)
                    .run();
                return Response.json({ success: true }, { headers: corsHeaders });
            }

            if (path.startsWith("/api/investments/") && method === "DELETE") {
                const id = path.split("/").pop();
                await env.DB.prepare("DELETE FROM investments WHERE id = ? AND user_id = ?")
                    .bind(id, verifiedUserId)
                    .run();
                return Response.json({ success: true }, { headers: corsHeaders });
            }

            // Storage
            if (path.startsWith("/api/storage/upload")) {
                if (method === "POST") {
                    const filename = url.searchParams.get("filename") || `receipt_${Date.now()}.jpg`;
                    const key = `users/${verifiedUserId}/receipts/${filename}`;

                    await env.R2.put(key, request.body);
                    return Response.json({ key, url: `/api/storage/view?key=${key}` }, { headers: corsHeaders });
                }
            }

            if (path === "/api/storage/view") {
                const key = url.searchParams.get("key");
                // Safety check: ensure the key belongs to the verified user
                if (!key?.startsWith(`users/${verifiedUserId}/`)) {
                    return new Response("Forbidden", { status: 403, headers: corsHeaders });
                }

                const object = await env.R2.get(key);
                if (!object) return new Response("Not Found", { status: 404 });

                const headers = new Headers();
                object.writeHttpMetadata(headers);
                headers.set("Access-Control-Allow-Origin", "*");

                return new Response(object.body, { headers });
            }

            return new Response("Not Found", { status: 404, headers: corsHeaders });

        } catch (e: any) {
            return new Response(e.message, { status: 500, headers: corsHeaders });
        }
    },
};
