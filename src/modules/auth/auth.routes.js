import { Hono } from 'hono'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import db from '../../db.js'
import { env } from '../../env.js'
import { hashPassword, verifyPassword } from '../../utils/crypto.js'

const router = new Hono()

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  rememberMe: z.boolean().optional()
})

// USER REGISTER
router.post('/user/register', async (c) => {
  try {
    const body = await c.req.json()
    const data = registerSchema.parse(body)

    const existingUser = await db.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      return c.json({ error: 'Email already used' }, 409)
    }

    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: await hashPassword(data.password),
        role: 'USER',
        isEmailVerified: true
      }
    })

    return c.json({
      message: 'User registered successfully',
      userId: user.id
    }, 201)
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Failed to register user' }, 400)
  }
})

// USER LOGIN
router.post('/user/login', async (c) => {
  try {
    const body = await c.req.json()
    const data = loginSchema.parse(body)

    const user = await db.user.findUnique({
      where: { email: data.email }
    })

    if (!user || user.role !== 'USER') {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    const valid = await verifyPassword(data.password, user.passwordHash)

    if (!valid) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    const expiresInDays = data.rememberMe
      ? env.JWT_REMEMBER_EXPIRES_DAYS
      : env.JWT_EXPIRES_DAYS

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        email: user.email
      },
      env.JWT_SECRET,
      { expiresIn: `${expiresInDays}d` }
    )

    return c.json({
      message: 'Login success',
      token,
      expiresInDays
    })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Failed to login' }, 400)
  }
})

// ADMIN LOGIN
router.post('/admin/login', async (c) => {
  try {
    const body = await c.req.json()
    const data = loginSchema.parse(body)

    const admin = await db.user.findUnique({
      where: { email: data.email }
    })

    if (!admin || admin.role !== 'ADMIN') {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    const valid = await verifyPassword(data.password, admin.passwordHash)

    if (!valid) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    const token = jwt.sign(
      {
        userId: admin.id,
        role: admin.role,
        email: admin.email
      },
      env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    return c.json({
      message: 'Admin login success',
      token
    })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Failed to login admin' }, 400)
  }
})

export default router