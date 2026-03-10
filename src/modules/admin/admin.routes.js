import { Hono } from 'hono'
import { authRequired } from '../../middleware/auth.js'
import { requireRole } from '../../middleware/rbac.js'

const router = new Hono()

router.use('*', authRequired(), requireRole('ADMIN'))

router.get('/dashboard', async (c) => {
  return c.json({
    message: 'Welcome admin',
    auth: c.get('auth')
  })
})

export default router