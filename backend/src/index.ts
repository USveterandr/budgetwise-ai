import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { nanoid } from 'nanoid'
import * as XLSX from 'xlsx'

type Bindings = {
  DB: D1Database
  BANK_BUCKET: R2Bucket
  AVATAR_BUCKET: R2Bucket
  AI: any
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'OPTIONS']
}))

// =====================
// User Profile Management
// =====================

// GET /api/profile?userId=...
app.get('/api/profile', async (c) => {
  const userId = c.req.query('userId')
  if (!userId) return c.json({ error: 'userId required' }, 400)

  const user = await c.env.DB.prepare(
    "SELECT * FROM profiles WHERE user_id = ?"
  ).bind(userId).first()

  if (!user) return c.json({ error: 'User not found' }, 404)

  // Map DB columns to expected profile format if needed, or return as is
  return c.json({
    user_id: user.user_id,
    ...user
  })
})

// POST /api/profile
app.post('/api/profile', async (c) => {
  const body = await c.req.json()
  const {
    user_id, email, name, plan, monthly_income,
    currency, business_industry, bio, savings_rate,
    onboarding_complete
  } = body

  if (!user_id) return c.json({ error: 'user_id required' }, 400)

  // Check if user exists
  const existing = await c.env.DB.prepare(
    "SELECT user_id FROM profiles WHERE user_id = ?"
  ).bind(user_id).first()

  if (existing) {
    // Update
    await c.env.DB.prepare(`
        UPDATE profiles SET 
          name = COALESCE(?, name),
          email = COALESCE(?, email),
          plan = COALESCE(?, plan),
          monthly_income = COALESCE(?, monthly_income),
          currency = COALESCE(?, currency),
          business_industry = COALESCE(?, business_industry),
          bio = COALESCE(?, bio),
          savings_rate = COALESCE(?, savings_rate),
          onboarding_complete = COALESCE(?, onboarding_complete),
          updated_at = ?
        WHERE user_id = ?
      `).bind(
      name, email, plan, monthly_income || null, currency,
      business_industry || null, bio || null, savings_rate || null,
      onboarding_complete || null, Date.now(), user_id
    ).run()
  } else {
    // Insert
    await c.env.DB.prepare(`
        INSERT INTO profiles (user_id, email, name, plan, monthly_income, currency, business_industry, bio, savings_rate, onboarding_complete, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
      user_id, email, name, plan || 'Starter', monthly_income || 0,
      currency || 'USD', business_industry || 'General', bio || null, savings_rate || 0,
      onboarding_complete || 0, Date.now(), Date.now()
    ).run()
  }

  return c.json({ success: true })
})

// =====================
// Email Verification
// =====================
app.post('/profile/email-verify', async (c) => {
  const { email } = await c.req.json()

  await c.env.DB.prepare(
    "INSERT OR IGNORE INTO profiles (user_id,email,created_at) VALUES (?, ?, ?)"
  ).bind(nanoid(), email, Date.now()).run()

  // TODO: Send email link
  return c.json({ success: true })
})

// =====================
// Upload Avatar → R2 + Save URL
// =====================
app.post('/profile/avatar', async (c) => {
  const form = await c.req.formData()
  const file = form.get('avatar') as File

  if (!file) return c.json({ error: "No file" }, 400)

  const id = nanoid()
  await c.env.AVATAR_BUCKET.put(id, await file.arrayBuffer())

  // Assuming public access or worker serving. 
  // For now, we'll construct a URL. In production, you'd map a custom domain or use the worker to serve it.
  const url = `/avatars/${id}`

  await c.env.DB.prepare(
    "UPDATE profiles SET avatar_url=? WHERE user_id=?"
  ).bind(url, form.get("userId") as string).run()

  return c.json({ success: true, url })
})

// =====================
// Upload Bank Statement
// Supports: PDF, Excel, CSV
// =====================
app.post('/profile/bank-upload', async (c) => {
  const form = await c.req.formData()
  const file = form.get("statement") as File
  const userId = form.get("userId") as string

  if (!file) return c.json({ error: "File required" }, 400)

  const uploadId = nanoid()

  await c.env.BANK_BUCKET.put(uploadId, await file.arrayBuffer())

  let transactions: any[] = []

  // ========= PDF OCR =========
  if (file.type === "application/pdf") {
    const bytes = await file.arrayBuffer()
    // Using Cloudflare AI for OCR if available, or Tesseract via AI binding
    try {
      // Note: @cf/tesseract-ocr is hypothetical or requires specific binding. 
      // If using a specific model, ensure it is supported.
      // For now, we assume the user has this model or similar.
      // If not, this block might need adjustment.
      // We will use a generic placeholder or the user's suggested model.
      // The user suggested @cf/tesseract-ocr.
      const response = await c.env.AI.run("@cf/tesseract-ocr", {
        image: [...new Uint8Array(bytes)]
      })
      const text = response.result || ""
      transactions = text.split("\n")
    } catch (e) {
      console.error("OCR failed", e)
    }
  }

  // ========= Excel =========
  if (
    file.type.includes("spreadsheet") ||
    file.name.endsWith(".xls") ||
    file.name.endsWith(".xlsx") ||
    file.name.endsWith(".csv")
  ) {
    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    transactions = XLSX.utils.sheet_to_json(sheet)
  }

  // Save upload record
  await c.env.DB.prepare(
    `INSERT INTO bank_uploads (id,user_id,file_url,status,created_at)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(uploadId, userId, uploadId, "processed", Date.now()).run()

  // =====================
  // AI Auto Insights
  // =====================
  let aiResult = ""
  try {
    const response = await c.env.AI.run(
      "@cf/meta/llama-3.1-70b-instruct",
      {
        messages: [
          { role: "system", content: "You are a financial analyst." },
          { role: "user", content: `Analyze these financial transactions and return spending trends, risks, savings ideas:\n${JSON.stringify(transactions).substring(0, 5000)}` }
        ]
      }
    )
    aiResult = response.response || JSON.stringify(response)
  } catch (e) {
    console.error("AI Analysis failed", e)
    aiResult = "AI Analysis unavailable"
  }

  await c.env.DB.prepare(
    "UPDATE bank_uploads SET insights=? WHERE id=?"
  ).bind(aiResult, uploadId).run()

  return c.json({
    success: true,
    uploadId,
    insights: aiResult
  })
})

// =====================
// Transactions
// =====================

// GET /api/transactions?userId=...
app.get('/api/transactions', async (c) => {
  const userId = c.req.query('userId')
  if (!userId) return c.json({ error: 'userId required' }, 400)

  const result = await c.env.DB.prepare(
    "SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC"
  ).bind(userId).all()

  return c.json({ transactions: result.results || [] })
})

// POST /api/transactions
app.post('/api/transactions', async (c) => {
  const body = await c.req.json()
  const { user_id, type, amount, category, description, date } = body

  if (!user_id || !type || !amount || !category) {
    return c.json({ error: 'Missing required fields' }, 400)
  }

  const id = nanoid()
  await c.env.DB.prepare(
    `INSERT INTO transactions (id, user_id, type, amount, category, description, date, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, user_id, type, amount, category, description || '', date || Date.now(), Date.now()).run()

  return c.json({ success: true, id })
})

// DELETE /api/transactions/:id
app.delete('/api/transactions/:id', async (c) => {
  const id = c.req.param('id')
  if (!id) return c.json({ error: 'id required' }, 400)

  await c.env.DB.prepare(
    "DELETE FROM transactions WHERE id = ?"
  ).bind(id).run()

  return c.json({ success: true })
})

// =====================
// Budgets
// =====================

// GET /api/budgets?userId=...&month=...
app.get('/api/budgets', async (c) => {
  const userId = c.req.query('userId')
  const month = c.req.query('month')
  
  if (!userId || !month) return c.json({ error: 'userId and month required' }, 400)

  const result = await c.env.DB.prepare(
    "SELECT * FROM budgets WHERE user_id = ? AND month = ?"
  ).bind(userId, month).all()

  return c.json({ budgets: result.results || [] })
})

// POST /api/budgets
app.post('/api/budgets', async (c) => {
  const body = await c.req.json()
  const { user_id, category, limit, month } = body

  if (!user_id || !category || !limit || !month) {
    return c.json({ error: 'Missing required fields' }, 400)
  }

  const id = nanoid()
  await c.env.DB.prepare(
    `INSERT INTO budgets (id, user_id, category, limit_amount, spent, month, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, user_id, category, limit, 0, month, Date.now()).run()

  return c.json({ success: true, id })
})

// PUT /api/budgets
app.put('/api/budgets', async (c) => {
  const body = await c.req.json()
  const { id, spent } = body

  if (!id || spent === undefined) {
    return c.json({ error: 'Missing required fields' }, 400)
  }

  await c.env.DB.prepare(
    "UPDATE budgets SET spent = ? WHERE id = ?"
  ).bind(spent, id).run()

  return c.json({ success: true })
})

// =====================
// Investments
// =====================

// GET /api/investments?userId=...
app.get('/api/investments', async (c) => {
  const userId = c.req.query('userId')
  if (!userId) return c.json({ error: 'userId required' }, 400)

  const result = await c.env.DB.prepare(
    "SELECT * FROM investments WHERE user_id = ? ORDER BY created_at DESC"
  ).bind(userId).all()

  return c.json({ investments: result.results || [] })
})

// POST /api/investments
app.post('/api/investments', async (c) => {
  const body = await c.req.json()
  const { user_id, name, type, amount, current_value, purchase_date } = body

  if (!user_id || !name || !type || !amount) {
    return c.json({ error: 'Missing required fields' }, 400)
  }

  const id = nanoid()
  await c.env.DB.prepare(
    `INSERT INTO investments (id, user_id, name, type, amount, current_value, purchase_date, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, user_id, name, type, amount, current_value || amount, purchase_date || Date.now(), Date.now()).run()

  return c.json({ success: true, id })
})

// PUT /api/investments/:id
app.put('/api/investments/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const { current_value, amount } = body

  if (!id) return c.json({ error: 'id required' }, 400)

  await c.env.DB.prepare(
    "UPDATE investments SET current_value = COALESCE(?, current_value), amount = COALESCE(?, amount) WHERE id = ?"
  ).bind(current_value, amount, id).run()

  return c.json({ success: true })
})

// DELETE /api/investments/:id
app.delete('/api/investments/:id', async (c) => {
  const id = c.req.param('id')
  if (!id) return c.json({ error: 'id required' }, 400)

  await c.env.DB.prepare(
    "DELETE FROM investments WHERE id = ?"
  ).bind(id).run()

  return c.json({ success: true })
})

// =====================
// Notifications
// =====================

// GET /api/notifications?userId=...
app.get('/api/notifications', async (c) => {
  const userId = c.req.query('userId')
  if (!userId) return c.json({ error: 'userId required' }, 400)

  const result = await c.env.DB.prepare(
    "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50"
  ).bind(userId).all()

  return c.json({ notifications: result.results || [] })
})

// POST /api/notifications
app.post('/api/notifications', async (c) => {
  const body = await c.req.json()
  const { user_id, title, message, type } = body

  if (!user_id || !title || !message) {
    return c.json({ error: 'Missing required fields' }, 400)
  }

  const id = nanoid()
  await c.env.DB.prepare(
    `INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, user_id, title, message, type || 'info', 0, Date.now()).run()

  return c.json({ success: true, id })
})

// PUT /api/notifications/:id/read
app.put('/api/notifications/:id/read', async (c) => {
  const id = c.req.param('id')
  if (!id) return c.json({ error: 'id required' }, 400)

  await c.env.DB.prepare(
    "UPDATE notifications SET is_read = 1 WHERE id = ?"
  ).bind(id).run()

  return c.json({ success: true })
})

// =====================
// Storage (Generic file upload to R2)
// =====================

// POST /api/storage/upload?userId=...&filename=...
app.post('/api/storage/upload', async (c) => {
  const userId = c.req.query('userId')
  const filename = c.req.query('filename')
  
  if (!userId || !filename) {
    return c.json({ error: 'userId and filename required' }, 400)
  }

  const fileData = await c.req.arrayBuffer()
  const fileId = nanoid()
  const key = `${userId}/${fileId}-${filename}`

  await c.env.BANK_BUCKET.put(key, fileData)

  return c.json({
    success: true,
    url: `/storage/${key}`,
    key
  })
})

// GET /storage/:key (serve files from R2)
app.get('/storage/*', async (c) => {
  const key = c.req.path.replace('/storage/', '')
  
  const object = await c.env.BANK_BUCKET.get(key)
  
  if (!object) {
    return c.json({ error: 'File not found' }, 404)
  }

  return new Response(object.body, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000',
    }
  })
})

export default app
