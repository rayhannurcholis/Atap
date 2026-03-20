import jwt from 'jsonwebtoken'
import { env } from '../env.js'

export function authRequired() {
  return async (c, next) => {
    const authHeader = c.req.header('authorization') || ''

    // ambil token dari "Bearer xxx"
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null

    if (!token) {
      return c.json({ message: 'Unauthorized - no token' }, 401)
    }

    try {
      const payload = jwt.verify(token, env.JWT_SECRET)

      // 👉 PENTING: pakai 'user' biar konsisten
      c.set('user', payload)

      await next()
    } catch (err) {
      return c.json({ message: 'Invalid token' }, 401)
    }
  }
}