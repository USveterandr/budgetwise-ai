import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { nanoid } from 'nanoid'
// @ts-ignore
import { hash, compare } from 'bcryptjs'
// @ts-ignore
import { sign, verify } from 'jsonwebtoken'
import * as XLSX from 'xlsx'

type Bindings = {
  DB: D1Database
  BANK_BUCKET: R2Bucket
  AVATAR_BUCKET: R2Bucket
  AI: any
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'OPTIONS']
}))

// Secret key for JWT (should be in .dev.vars or env)
const getJwtSecret = (c: any) => c.env.JWT_SECRET || 'dev_secret_budgetwise_123'

// =====================
// Auth Routes
// =====================

/**
 * SIGNUP
 * POST /api/auth/signup
 */
app.post('/api/auth/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json()

    if (!email || !password) {
      return c.json({ error: 'Email and password required' }, 400)
    }

    const existing = await c.env.DB.prepare(
      "SELECT id FROM users WHERE email = ?"
    ).bind(email).first()

    if (existing) {
      return c.json({ error: 'User already exists' }, 409)
    }

    const userId = nanoid()
    const hashedPassword = await hash(password, 8)

    // Transaction: Insert user + Insert initial profile
    const batch = await c.env.DB.batch([
      c.env.DB.prepare("INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)").bind(userId, email, hashedPassword),
      c.env.DB.prepare("INSERT INTO profiles (user_id, email, name) VALUES (?, ?, ?)").bind(userId, email, name || 'New User')
    ])

    const token = sign({ userId, email }, getJwtSecret(c), { expiresIn: '7d' })

    return c.json({ token, userId, email, name })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

/**
 * LOGIN
 * POST /api/auth/login
 */
app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    // Check if body is empty or invalid
    if (!email || !password) {
         return c.json({ error: 'Email and password required' }, 400);
    }
    
    const user: any = await c.env.DB.prepare(
      "SELECT * FROM users WHERE email = ?"
    ).bind(email).first()

    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    const valid = await compare(password, user.password_hash)
    if (!valid) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    const token = sign({ userId: user.id, email: user.email }, getJwtSecret(c), { expiresIn: '7d' })
    
    const profile = await c.env.DB.prepare(
        "SELECT * FROM profiles WHERE user_id = ?"
    ).bind(user.id).first()

    return c.json({ token, userId: user.id, profile })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// Middleware to verify token for protected routes
const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  const token = authHeader.split(' ')[1]
  try {
    const payload = verify(token, getJwtSecret(c))
    c.set('user', payload)
    await next()
  } catch (e) {
    return c.json({ error: 'Invalid token' }, 401)
  }
}

// =====================
// User Profile Management
// =====================

app.get('/api/profile', authMiddleware, async (c) => {
  const currentUser = c.get('user')
  const userId = currentUser.userId

  const user = await c.env.DB.prepare(
    "SELECT * FROM profiles WHERE user_id = ?"
  ).bind(userId).first()

  if (!user) return c.json({ error: 'Profile not found' }, 404)

  return c.json({
    user_id: user.user_id,
    ...user
  })
})

app.post('/api/profile', authMiddleware, async (c) => {
  const currentUser = c.get('user')
  const body = await c.req.json()
  const {
    email, name, plan, monthly_income,
    currency, business_industry, bio, savings_rate,
    onboarding_complete
  } = body
  
  const user_id = currentUser.userId

  const existing = await c.env.DB.prepare("SELECT user_id FROM profiles WHERE user_id = ?").bind(user_id).first()

  if (existing) {
    await c.env.DB.prepare(`
      UPDATE profiles SET 
        name = ?2, email = ?3, plan = ?4, monthly_income = ?5,
        currency = ?6, business_industry = ?7, bio = ?8,
        savings_rate = ?9, onboarding_complete = ?10, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?1
    `).bind(
      user_id, name, email, plan, monthly_income,
      currency, business_industry, bio, savings_rate, onboarding_complete
    ).run()
  } else {
    await c.env.DB.prepare(`
      INSERT INTO profiles (
        user_id, name, email, plan, monthly_income,
        currency, business_industry, bio, savings_rate, onboarding_complete
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user_id, name, email, plan, monthly_income,
      currency, business_industry, bio, savings_rate, onboarding_complete
    ).run()
  }

  return c.json({ success: true, user_id })
})


// POST /profile/avatar
app.post('/profile/avatar', authMiddleware, async (c) => {
  const currentUser = c.get('user')
  const formData = await c.req.parseBody()
  const file = formData['avatar']
  
  if (!file || !(file instanceof File)) {
    return c.json({ error: 'No file uploaded' }, 400)
  }

  const userId = currentUser.userId
  const key = `${userId}/avatar.jpg`

  await c.env.AVATAR_BUCKET.put(key, file.stream(), {
    httpMetadata: { contentType: file.type }
  })

  return c.json({ success: true, key })
})

export default app
