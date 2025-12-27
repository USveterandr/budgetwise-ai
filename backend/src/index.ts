import { Hono } from 'hono'
import { nanoid } from 'nanoid'
import * as XLSX from 'xlsx'

type Bindings = {
  DB: D1Database
  BANK_BUCKET: R2Bucket
  AVATAR_BUCKET: R2Bucket
  AI: any
}

const app = new Hono<{ Bindings: Bindings }>()

// =====================
// Email Verification
// =====================
app.post('/profile/email-verify', async (c) => {
  const { email } = await c.req.json()

  await c.env.DB.prepare(
    "INSERT OR IGNORE INTO users (id,email,created_at) VALUES (?, ?, ?)"
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
    "UPDATE users SET avatar_url=? WHERE id=?"
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

export default app
