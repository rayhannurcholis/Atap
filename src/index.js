import { Hono } from 'hono'
import { cors } from 'hono/cors'
import './env.js'

import authRoutes from './modules/auth/auth.routes.js'
import listingsRoutes from './modules/listings/listings.routes.js'
import whatsappRoutes from './modules/whatsapp/whatsapp.routes.js'

const app = new Hono()

app.use('*', cors())

app.get('/', (c) => {
  return c.json({
    ok: true,
    message: 'KostSolo backend running'
  })
})

app.route('/auth', authRoutes)
app.route('/listings', listingsRoutes)
app.route('/whatsapp', whatsappRoutes)

export default app