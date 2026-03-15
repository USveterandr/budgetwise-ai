import { Hono } from 'hono'
import { jwt, sign, verify } from 'hono/jwt'

type Env = {
  DB: D1Database
  AI: any
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Env }>()

/* ---------- AUTH HELPERS ---------- */
async function hashPassword(password: string) {
  const enc = new TextEncoder().encode(password)
  const hash = await crypto.subtle.digest('SHA-256', enc)
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('')
}

/* ---------- AUTH ROUTES ---------- */
app.post('/auth/register', async c => {
  const { email, password } = await c.req.json()
  const hash = await hashPassword(password)
  const id = crypto.randomUUID()

  await c.env.DB.prepare(
    `INSERT INTO users (id,email,password_hash) VALUES (?,?,?)`
  ).bind(id, email, hash).run()

  return c.json({ success: true })
})

app.post('/auth/login', async c => {
  const { email, password } = await c.req.json()
  const hash = await hashPassword(password)

  const user = await c.env.DB.prepare(
    `SELECT id FROM users WHERE email=? AND password_hash=?`
  ).bind(email, hash).first()

  if (!user) return c.json({ error: 'Invalid credentials' }, 401)

  const token = await sign(
    { sub: user.id },
    c.env.JWT_SECRET
  )

  return c.json({ token })
})

/* ---------- AUTH MIDDLEWARE ---------- */
app.use('/api/*', jwt({ secret: (c) => c.env.JWT_SECRET }))

/* ---------- TRANSACTIONS ---------- */
app.post('/api/transactions', async c => {
  const { merchant, amount, occurred_at } = await c.req.json()
  const userId = c.get('jwtPayload').sub
  const id = crypto.randomUUID()

  await c.env.DB.prepare(
    `INSERT INTO transactions (id,user_id,merchant,amount,occurred_at)
     VALUES (?,?,?,?,?)`
  ).bind(id, userId, merchant, amount, occurred_at).run()

  return c.json({ success: true })
})

app.get('/api/transactions', async c => {
  const userId = c.get('jwtPayload').sub
  const rows = await c.env.DB.prepare(
    `SELECT * FROM transactions WHERE user_id=? ORDER BY occurred_at DESC`
  ).bind(userId).all()

  return c.json(rows.results)
})

/* ---------- AI: EXPENSE CATEGORIZATION ---------- */
app.post('/api/ai/categorize', async c => {
  const { merchant, amount } = await c.req.json()

  const res = await c.env.AI.run(
    '@cf/meta/llama-3-8b-instruct',
    {
      prompt: `Categorize this expense: ${merchant}, $${amount}.
      Return JSON { category, confidence, reasoning }.`
    }
  )

  return c.json(res)
})

/* ---------- AI: MONTHLY INSIGHTS ---------- */
app.post('/api/ai/monthly-report', async c => {
  const userId = c.get('jwtPayload').sub

  const tx = await c.env.DB.prepare(
    `SELECT merchant,amount,category FROM transactions WHERE user_id=?`
  ).bind(userId).all()

  const ai = await c.env.AI.run(
    '@cf/meta/llama-3-8b-instruct',
    {
      prompt: `
      Analyze these transactions and generate:
      - spending summary
      - 3 risks
      - 3 recommendations
      Data: ${JSON.stringify(tx.results)}
      `
    }
  )

  const id = crypto.randomUUID()
  await c.env.DB.prepare(
    `INSERT INTO ai_insights (id,user_id,type,content)
     VALUES (?,?,?,?)`
  ).bind(id, userId, 'monthly', JSON.stringify(ai)).run()

  return c.json(ai)
})

export default app
