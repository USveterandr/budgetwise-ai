/// <reference types="@cloudflare/workers-types" />

export interface Env {
    DB: D1Database;
    R2: R2Bucket;
}

// Clerk configuration
const CLERK_ISSUER = "https://clerk.budgetwise.isaac-trinidad.com";
const CLERK_JWKS_URL = "https://clerk.budgetwise.isaac-trinidad.com/.well-known/jwks.json";
const AUTHORIZED_PARTIES = [
    "https://budgetwise-ai.pages.dev",
    "https://clerk.budgetwise.isaac-trinidad.com",
    "http://localhost:8081",
    "http://localhost:19006"
];

let cachedJWKs: any = null;
let lastFetchTime = 0;

async function fetchJWKs(jwksUrl: string) {
    const now = Date.now();
    if (!cachedJWKs || now - lastFetchTime > 3600000) { // Cache for 1 hour
        const response = await fetch(jwksUrl);
        cachedJWKs = await response.json();
        lastFetchTime = now;
    }
    return cachedJWKs;
}

async function verifyClerkToken(token: string, env: any): Promise<string | null> {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const [headerB64, payloadB64, signatureB64] = parts;
        const header = JSON.parse(atob(headerB64));
        const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));

        // Environment-specific configuration
        const issuer = env.CLERK_ISSUER || CLERK_ISSUER;
        const jwksUrl = env.CLERK_JWKS_URL || CLERK_JWKS_URL;
        const authorizedParties = env.AUTHORIZED_PARTIES ? JSON.parse(env.AUTHORIZED_PARTIES) : AUTHORIZED_PARTIES;

        // Basic claim validation
        const now = Math.floor(Date.now() / 1000);
        if (payload.iss !== issuer) {
            throw new Error(`Auth Error: Invalid token issuer. Expected: ${issuer}. Check your backend environment variables.`);
        }
        if (payload.exp < now) {
            throw new Error(`Auth Error: Token expired. Please refresh your session.`);
        }
        if (payload.nbf && payload.nbf > now) {
            throw new Error(`Auth Error: Token not yet valid.`);
        }

        // Secure request authorization (authorizedParties)
        if (payload.azp && !authorizedParties.includes(payload.azp)) {
            throw new Error(`Auth Error: Unauthorized origin (${payload.azp}). Please add this to AUTHORIZED_PARTIES in your backend.`);
        }

        // Full signature verification
        const jwks = await fetchJWKs(jwksUrl);
        const key = jwks.keys.find((k: any) => k.kid === header.kid);
        if (!key) return null;

        const cryptoKey = await crypto.subtle.importKey(
            "jwk",
            key,
            { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
            false,
            ["verify"]
        );

        const encoder = new TextEncoder();
        const data = encoder.encode(`${headerB64}.${payloadB64}`);
        const signature = Uint8Array.from(atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

        const isValid = await crypto.subtle.verify(
            "RSASSA-PKCS1-v1_5",
            cryptoKey,
            signature,
            data
        );

        return isValid ? payload.sub : null;
    } catch (e) {
        console.error("Clerk token verification error:", e);
        return null;
    }
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

        // Root / Health check
        if (path === "/" || path === "/api/health") {
            return Response.json({ status: "ok", message: "Budgetwise AI API (Clerk Enabled)", version: "1.1.0" }, { headers: corsHeaders });
        }

        // Authenticate request
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return new Response("Unauthorized", { status: 401, headers: corsHeaders });
        }

        const token = authHeader.split(" ")[1];
        let verifiedUserId: string | null = null;
        try {
            verifiedUserId = await verifyClerkToken(token, env);
        } catch (e: any) {
            return new Response(JSON.stringify({ error: e.message }), { status: 401, headers: corsHeaders });
        }

        if (!verifiedUserId) {
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
