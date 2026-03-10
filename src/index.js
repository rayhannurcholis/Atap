import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { swaggerUI } from '@hono/swagger-ui'

import './env.js'

import authRoutes from './modules/auth/auth.routes.js'
import listingsRoutes from './modules/listings/listings.routes.js'
import whatsappRoutes from './modules/whatsapp/whatsapp.routes.js'
import adminRoutes from './modules/admin/admin.routes.js'
import { swaggerDocument } from './docs/swagger.js'

const app = new Hono()

app.use('*', logger())
app.use('*', cors())

app.get('/', (c) => {
  return c.json({
    ok: true,
    message: 'KostSolo backend running'
  })
})

app.get('/swagger.json', (c) => {
  return c.json(swaggerDocument)
})

app.get('/docs', swaggerUI({ url: '/swagger.json' }))

app.route('/auth', authRoutes)
app.route('/listings', listingsRoutes)
app.route('/whatsapp', whatsappRoutes)
app.route('/admin', adminRoutes)

export default app