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
  RESEND_API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'OPTIONS']
}))

// Secret key for JWT (should be in .dev.vars or env)
const getJwtSecret = (c: any) => c.env.JWT_SECRET || 'dev_secret_budgetwise_123'

async function sendEmail(apiKey: string, to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev', // Default testing domain
      to,
      subject,
      html
    })
  })
  if (!res.ok) {
     const text = await res.text()
     console.error('Email API Error:', text)
     // Don't throw - allow graceful degradation
  }
}


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
    const trialStartDate = new Date().toISOString()

    // Transaction: Insert user + Insert initial profile with Trial Info
    const batch = await c.env.DB.batch([
      c.env.DB.prepare("INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)").bind(userId, email, hashedPassword),
      c.env.DB.prepare("INSERT INTO profiles (user_id, email, name, subscription_status, trial_start_date) VALUES (?, ?, ?, 'trial', ?)").bind(userId, email, name || 'New User', trialStartDate)
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

/**
 * RESET PASSWORD
 * POST /api/auth/reset-password
 */
app.post('/api/auth/reset-password', async (c) => {
  try {
    const { email } = await c.req.json()
    if (!email) return c.json({ error: 'Email required' }, 400)
    
    // Check if user exists
    const user = await c.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first()
    if (!user) {
        // Return success even if user not found to prevent enumeration
        return c.json({ success: true, message: 'If this email exists, a reset link has been sent.' })
    }

    // Generate Reset Token (valid for 1 hour)
    const resetToken = sign({ email, type: 'reset' }, getJwtSecret(c), { expiresIn: '1h' })
    const resetLink = `https://budgetwise-ai.pages.dev/reset-password?token=${resetToken}`

    const apiKey = c.env.RESEND_API_KEY
    
    if (apiKey) {
        await sendEmail(apiKey, email, 'Reset your BudgetWise Password', 
            `<p>You requested a password reset.</p><p><a href="${resetLink}">Click here to reset your password</a></p>`
        )
    } else {
        console.log("Mock Email Sent to:", email) 
        console.log("Reset Link:", resetLink)
        // In dev mode/without key, we can return the link for testing, but in prod we shouldn't.
        // However, user is blocked. I will return it in a debug field.
        return c.json({ 
            success: true, 
            message: 'Email service not configured. See debug_link.',
            debug_link: resetLink 
        })
    }

    return c.json({ success: true, message: 'If this email exists, a reset link has been sent.' })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

/**
 * UPDATE PASSWORD (from Reset Link)
 * POST /api/auth/update-password
 */
app.post('/api/auth/update-password', async (c) => {
  try {
    const { token, newPassword } = await c.req.json()
    if (!token || !newPassword) return c.json({ error: 'Token and password required' }, 400)

    // Verify token
    let payload: any
    try {
        payload = verify(token, getJwtSecret(c))
    } catch (e) {
        return c.json({ error: 'Invalid or expired token' }, 401)
    }

    if (payload.type !== 'reset') {
        return c.json({ error: 'Invalid token type' }, 401)
    }

    const email = payload.email
    const hashedPassword = await hash(newPassword, 8)

    // Update password
    const res = await c.env.DB.prepare(
        "UPDATE users SET password_hash = ? WHERE email = ?"
    ).bind(hashedPassword, email).run()

    if (res.meta.changes === 0) {
        return c.json({ error: 'User not found' }, 404)
    }

    return c.json({ success: true })
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
    onboarding_complete, avatar_url
  } = body
  
  const user_id = currentUser.userId

  const existing = await c.env.DB.prepare("SELECT user_id FROM profiles WHERE user_id = ?").bind(user_id).first()

  if (existing) {
    // Dynamically build update query or just update all
    // Now including avatar_url
    await c.env.DB.prepare(`
      UPDATE profiles SET 
        name = ?2, email = ?3, plan = ?4, monthly_income = ?5,
        currency = ?6, business_industry = ?7, bio = ?8,
        savings_rate = ?9, onboarding_complete = ?10, avatar_url = ?11, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?1
    `).bind(
      user_id, name, email, plan, monthly_income,
      currency, business_industry, bio, savings_rate, onboarding_complete, avatar_url
    ).run()
  } else {
    await c.env.DB.prepare(`
      INSERT INTO profiles (
        user_id, name, email, plan, monthly_income,
        currency, business_industry, bio, savings_rate, onboarding_complete, avatar_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user_id, name, email, plan, monthly_income,
      currency, business_industry, bio, savings_rate, onboarding_complete, avatar_url
    ).run()
  }

  return c.json({ success: true, user_id })
})


// POST /api/profile/avatar
// Uploads avatar to R2 and updates profile
app.post('/api/profile/avatar', authMiddleware, async (c) => {
  const currentUser = c.get('user')
  const formData = await c.req.parseBody()
  const file = formData['avatar']
  
  if (!file || !(file instanceof File)) {
    return c.json({ error: 'No file uploaded' }, 400)
  }

  const userId = currentUser.userId
  const timestamp = Date.now()
  const key = `${userId}/avatar_${timestamp}.jpg` // Cache busting key

  await c.env.AVATAR_BUCKET.put(key, file.stream(), {
    httpMetadata: { contentType: file.type }
  })
  
  // Construct the URL (Using a GET route we will make below)
  // Or assuming we set up a domain. For now, let's point to a helper route.
  // We'll use the worker's own URL origin if possible, but for now relative path for API.
  const avatarUrl = `/api/assets/avatar/${userId}`

  // Update DB
  await c.env.DB.prepare("UPDATE profiles SET avatar_url = ? WHERE user_id = ?")
    .bind(avatarUrl, userId)
    .run()

  return c.json({ success: true, avatar_url: avatarUrl })
})

// GET /api/assets/avatar/:userId
// Serves the avatar from R2
app.get('/api/assets/avatar/:userId', async (c) => {
    const userId = c.req.param('userId')
    
    // We list objects to find the latest or just use the known pattern if we stored the key.
    // Since we stored a generic URL, we need to know the KEY. 
    // Ideally we should store the KEY in the DB or look it up.
    // Let's assume we fetch the LATEST file for that user from the bucket.
    
    const list = await c.env.AVATAR_BUCKET.list({ prefix: userId + '/avatar_' })
    if (!list.objects || list.objects.length === 0) {
        // Return default avatar or 404
        return c.text('No avatar', 404)
    }
    
    // Sort by uploaded time (key has timestamp) or verify logic
    // list.objects is usually sorted by key.
    const latest = list.objects[list.objects.length - 1]
    
    const object = await c.env.AVATAR_BUCKET.get(latest.key)
    
    if (object === null) {
      return c.text('Object Not Found', 404)
    }
  
    const headers = new Headers()
    object.writeHttpMetadata(headers)
    headers.set('etag', object.httpEtag)
  
    return new Response(object.body, {
      headers,
    })
})

// =====================
// Transactions
// =====================

app.get('/api/transactions', authMiddleware, async (c) => {
  const currentUser = c.get('user')
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC"
  ).bind(currentUser.userId).all()
  return c.json(results)
})

app.post('/api/transactions', authMiddleware, async (c) => {
  const currentUser = c.get('user')
  const { description, amount, category, type, date } = await c.req.json()
  
  const id = nanoid()
  
  await c.env.DB.prepare(
    "INSERT INTO transactions (id, user_id, description, amount, category, type, date) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).bind(id, currentUser.userId, description, amount, category, type, date).run()
  
  return c.json({ success: true, id })
})

app.delete('/api/transactions/:id', authMiddleware, async (c) => {
  const currentUser = c.get('user')
  const id = c.req.param('id')
  
  await c.env.DB.prepare(
    "DELETE FROM transactions WHERE id = ? AND user_id = ?"
  ).bind(id, currentUser.userId).run()
  
  return c.json({ success: true })
})

// =====================
// Budgets
// =====================

app.get('/api/budgets', authMiddleware, async (c) => {
  const currentUser = c.get('user')
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM budgets WHERE user_id = ?"
  ).bind(currentUser.userId).all()
  return c.json(results)
})

app.post('/api/budgets', authMiddleware, async (c) => {
  const currentUser = c.get('user')
  const { category, budget_limit } = await c.req.json()
  const id = nanoid()

  // Check if budget for category already exists
  const existing = await c.env.DB.prepare(
      "SELECT id FROM budgets WHERE user_id = ? AND category = ?"
  ).bind(currentUser.userId, category).first()

  if (existing) {
       await c.env.DB.prepare(
           "UPDATE budgets SET budget_limit = ? WHERE id = ?"
       ).bind(budget_limit, existing.id).run()
       return c.json({ success: true, id: existing.id, updated: true })
  }

  await c.env.DB.prepare(
    "INSERT INTO budgets (id, user_id, category, budget_limit) VALUES (?, ?, ?, ?)"
  ).bind(id, currentUser.userId, category, budget_limit).run()
  
  return c.json({ success: true, id })
})

export default app
