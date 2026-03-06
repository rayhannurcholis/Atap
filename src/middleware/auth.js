import jwt from 'jsonwebtoken'
import { env } from '../env.js'

export function authRequired() {
  return async (c, next) => {
    const authHeader = c.req.header('authorization') || ''
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null

    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    try {
      const payload = jwt.verify(token, env.JWT_SECRET)
      c.set('auth', payload)
      await next()
    } catch {
      return c.json({ error: 'Invalid token' }, 401)
    }
  }
}