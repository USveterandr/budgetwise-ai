/**
 * Budgetwise AI - Cloudflare Worker API
 * Handles interactions with D1 Database and R2 Storage
 */

export interface Env {
    DB: D1Database;
    R2: R2Bucket;
}

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

        try {
            // Profiles API
            if (path === "/api/profile") {
                if (method === "GET") {
                    const userId = url.searchParams.get("userId");
                    const profile = await env.DB.prepare("SELECT * FROM profiles WHERE user_id = ?")
                        .bind(userId)
                        .first();
                    return Response.json(profile || {}, { headers: corsHeaders });
                }

                if (method === "POST" || method === "PUT") {
                    const body = await request.json();
                    const user_id = body.user_id;
                    const name = body.name || null;
                    const email = body.email || null;
                    const plan = body.plan || null;
                    const monthly_income = body.monthly_income !== undefined ? body.monthly_income : null;
                    const savings_rate = body.savings_rate !== undefined ? body.savings_rate : null;
                    const currency = body.currency || 'USD';
                    const bio = body.bio || null;
                    const business_industry = body.business_industry || 'General';

                    await env.DB.prepare(`
            INSERT INTO profiles (user_id, name, email, plan, monthly_income, savings_rate, currency, bio, business_industry)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
              name = COALESCE(excluded.name, profiles.name),
              plan = COALESCE(excluded.plan, profiles.plan),
              monthly_income = COALESCE(excluded.monthly_income, profiles.monthly_income),
              savings_rate = COALESCE(excluded.savings_rate, profiles.savings_rate),
              currency = COALESCE(excluded.currency, profiles.currency),
              bio = COALESCE(excluded.bio, profiles.bio),
              business_industry = COALESCE(excluded.business_industry, profiles.business_industry),
              updated_at = CURRENT_TIMESTAMP
          `).bind(user_id, name, email, plan, monthly_income, savings_rate, currency, bio, business_industry).run();

                    return Response.json({ success: true }, { headers: corsHeaders });
                }
            }

            // Transactions API
            if (path === "/api/transactions") {
                const userId = url.searchParams.get("userId");
                if (method === "GET") {
                    const { results } = await env.DB.prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC")
                        .bind(userId)
                        .all();
                    return Response.json(results, { headers: corsHeaders });
                }

                if (method === "POST") {
                    const body = await request.json();
                    const id = crypto.randomUUID();
                    await env.DB.prepare(`
            INSERT INTO transactions (id, user_id, description, amount, category, type, date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).bind(id, body.user_id, body.description, body.amount, body.category, body.type, body.date).run();
                    return Response.json({ id, success: true }, { headers: corsHeaders });
                }
            }

            if (path.startsWith("/api/transactions/") && method === "DELETE") {
                const id = path.split("/").pop();
                await env.DB.prepare("DELETE FROM transactions WHERE id = ?").bind(id).run();
                return Response.json({ success: true }, { headers: corsHeaders });
            }

            // Budgets API
            if (path === "/api/budgets") {
                const userId = url.searchParams.get("userId");
                const month = url.searchParams.get("month");
                if (method === "GET") {
                    const { results } = await env.DB.prepare("SELECT * FROM budgets WHERE user_id = ? AND month = ?")
                        .bind(userId, month)
                        .all();
                    return Response.json(results, { headers: corsHeaders });
                }

                if (method === "POST") {
                    const body = await request.json();
                    const id = crypto.randomUUID();
                    await env.DB.prepare(`
            INSERT INTO budgets (id, user_id, category, budget_limit, spent, month)
            VALUES (?, ?, ?, ?, ?, ?)
          `).bind(id, body.user_id, body.category, body.budget_limit, body.spent, body.month).run();
                    return Response.json({ id, success: true }, { headers: corsHeaders });
                }

                if (method === "PUT") {
                    const body = await request.json();
                    await env.DB.prepare("UPDATE budgets SET spent = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
                        .bind(body.spent, body.id)
                        .run();
                    return Response.json({ success: true }, { headers: corsHeaders });
                }
            }

            // Investments API
            if (path === "/api/investments") {
                const userId = url.searchParams.get("userId");
                if (method === "GET") {
                    const { results } = await env.DB.prepare("SELECT * FROM investments WHERE user_id = ?")
                        .bind(userId)
                        .all();
                    return Response.json(results, { headers: corsHeaders });
                }

                if (method === "POST") {
                    const body = await request.json();
                    const id = crypto.randomUUID();
                    await env.DB.prepare(`
            INSERT INTO investments (id, user_id, name, symbol, quantity, purchase_price, current_price, purchase_date, type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(id, body.user_id, body.name, body.symbol, body.quantity, body.purchase_price, body.current_price, body.purchase_date, body.type).run();
                    return Response.json({ id, success: true }, { headers: corsHeaders });
                }
            }

            if (path.startsWith("/api/investments/") && method === "PUT") {
                const id = path.split("/").pop();
                const body = await request.json();
                const fields = Object.keys(body).map(k => `${k} = ?`).join(", ");
                const values = Object.values(body);
                await env.DB.prepare(`UPDATE investments SET ${fields} WHERE id = ?`)
                    .bind(...values, id)
                    .run();
                return Response.json({ success: true }, { headers: corsHeaders });
            }

            if (path.startsWith("/api/investments/") && method === "DELETE") {
                const id = path.split("/").pop();
                await env.DB.prepare("DELETE FROM investments WHERE id = ?").bind(id).run();
                return Response.json({ success: true }, { headers: corsHeaders });
            }

            // Notifications API
            if (path === "/api/notifications") {
                const userId = url.searchParams.get("userId");
                if (method === "GET") {
                    const { results } = await env.DB.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC")
                        .bind(userId)
                        .all();
                    return Response.json(results, { headers: corsHeaders });
                }

                if (method === "POST") {
                    const body = await request.json();
                    const id = crypto.randomUUID();
                    await env.DB.prepare(`
            INSERT INTO notifications (id, user_id, title, message, category, read)
            VALUES (?, ?, ?, ?, ?, ?)
          `).bind(id, body.user_id, body.title, body.message, body.category, body.read ? 1 : 0).run();
                    return Response.json({ id, success: true }, { headers: corsHeaders });
                }
            }

            if (path.endsWith("/read") && method === "PUT") {
                const parts = path.split("/");
                const id = parts[parts.length - 2];
                await env.DB.prepare("UPDATE notifications SET read = 1 WHERE id = ?").bind(id).run();
                return Response.json({ success: true }, { headers: corsHeaders });
            }

            // R2 Storage (Receipts)
            if (path.startsWith("/api/storage/upload")) {
                if (method === "POST") {
                    const filename = url.searchParams.get("filename") || `receipt_${Date.now()}.jpg`;
                    const userId = url.searchParams.get("userId");
                    const key = `users/${userId}/receipts/${filename}`;

                    await env.R2.put(key, request.body);
                    return Response.json({ key, url: `/api/storage/view?key=${key}` }, { headers: corsHeaders });
                }
            }

            if (path === "/api/storage/view") {
                const key = url.searchParams.get("key");
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
