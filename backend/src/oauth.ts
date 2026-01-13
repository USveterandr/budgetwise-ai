import { Context } from 'hono'
import { googleAuth } from '@hono/oauth-providers/google'
import { SignJWT, jwtVerify } from 'jose'
import { nanoid } from 'nanoid'

type Bindings = {
  DB: D1Database
  AUTH_KV: KVNamespace
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  JWT_SECRET: string
}

interface GoogleUser {
  id: string
  email: string
  name: string
  picture?: string
}

/**
 * Generate JWT token for authenticated user
 */
export async function generateJWT(userId: string, email: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const secretKey = encoder.encode(secret)
  
  return await new SignJWT({ userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey)
}

/**
 * Verify JWT token
 */
export async function verifyJWT(token: string, secret: string) {
  const encoder = new TextEncoder()
  const secretKey = encoder.encode(secret)
  
  try {
    const { payload } = await jwtVerify(token, secretKey)
    return payload
  } catch (error) {
    return null
  }
}

/**
 * Get or create user from Google OAuth data
 */
export async function getOrCreateUser(
  db: D1Database,
  googleUser: GoogleUser
): Promise<{ id: string; email: string; name: string; isNewUser: boolean }> {
  // Check if user exists
  const existingUser = await db
    .prepare('SELECT id, email, name FROM users WHERE email = ?')
    .bind(googleUser.email)
    .first()

  if (existingUser) {
    return {
      id: existingUser.id as string,
      email: existingUser.email as string,
      name: existingUser.name as string,
      isNewUser: false
    }
  }

  // Create new user
  const userId = nanoid()
  await db
    .prepare(`
      INSERT INTO users (id, email, name, email_verified, avatar_url, created_at, updated_at)
      VALUES (?, ?, ?, 1, ?, ?, ?)
    `)
    .bind(
      userId,
      googleUser.email,
      googleUser.name,
      googleUser.picture || null,
      Date.now(),
      Date.now()
    )
    .run()

  return {
    id: userId,
    email: googleUser.email,
    name: googleUser.name,
    isNewUser: true
  }
}

/**
 * Setup Google OAuth middleware
 */
export function setupGoogleAuth(clientId: string, clientSecret: string) {
  return googleAuth({
    client_id: clientId,
    client_secret: clientSecret,
    scope: ['openid', 'email', 'profile']
  })
}

/**
 * Handle OAuth callback and generate session
 */
export async function handleOAuthCallback(
  c: Context<{ Bindings: Bindings }>,
  googleUser: any
) {
  try {
    // Get or create user in database
    const user = await getOrCreateUser(c.env.DB, {
      id: googleUser.sub || googleUser.id,
      email: googleUser.email,
      name: googleUser.name || googleUser.email.split('@')[0],
      picture: googleUser.picture
    })

    // Generate JWT token
    const token = await generateJWT(user.id, user.email, c.env.JWT_SECRET)

    // Store session in KV for additional verification (optional)
    const sessionId = nanoid()
    await c.env.AUTH_KV.put(
      `session:${sessionId}`,
      JSON.stringify({
        userId: user.id,
        email: user.email,
        createdAt: Date.now()
      }),
      { expirationTtl: 604800 } // 7 days
    )

    return {
      success: true,
      token,
      sessionId,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isNewUser: user.isNewUser
      }
    }
  } catch (error) {
    console.error('OAuth callback error:', error)
    throw error
  }
}

/**
 * Middleware to verify authentication
 */
export async function authMiddleware(c: Context<{ Bindings: Bindings }>, next: () => Promise<void>) {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = authHeader.substring(7)
  const payload = await verifyJWT(token, c.env.JWT_SECRET)
  
  if (!payload) {
    return c.json({ error: 'Invalid token' }, 401)
  }

  // Store user info in context for route handlers
  c.set('userId', payload.userId as string)
  c.set('userEmail', payload.email as string)
  
  await next()
}
