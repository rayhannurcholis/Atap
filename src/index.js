import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { swaggerUI } from '@hono/swagger-ui'

import './env.js'

import authRoutes from './modules/auth/auth.routes.js'
import listingsRoutes from './modules/listings/listing.routes.js'
import whatsappRoutes from './modules/whatsapp/whatsapp.routes.js'
import adminRoutes from './modules/admin/adminListing.routes.js'
import { swaggerDocument } from './docs/swagger.js'
import roomTypeRoutes from './modules/room-types/roomType.routes.js'
import photoRoutes from './modules/photos/photo.routes.js'
import searchRoutes from './modules/search/search.routes.js'
import favoriteRoutes from './modules/favorites/favorite.routes.js'
import chatRoutes from './modules/chat/chat.routes.js'
import viewRoutes from './modules/views/view.routes.js'
import reportRoutes from './modules/reports/report.routes.js'
import ownerRoutes from './modules/owner/owner.routes.js'
import adminAnalyticsRoutes from './modules/analytics/admin.routes.js'
import fonnteWebhook from './modules/whatsapp/fonnte.webhook.js'
import leadRoutes from './modules/leads/lead.routes.js'
import filesRoutes from './modules/files/files.routes.js'



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
app.route('/fonnte/webhook', fonnteWebhook)
app.route('/files', filesRoutes)
app.route('/api/files', filesRoutes)

app.route('/auth', authRoutes)
app.route('/listings', listingsRoutes)
app.route('/whatsapp', whatsappRoutes)
app.route('/admin', adminRoutes)
app.route('/owner', roomTypeRoutes)
app.route('/owner', photoRoutes)
app.route('/owner', ownerRoutes)
app.route('/search', searchRoutes)
app.route('/favorites', favoriteRoutes)
app.route('/chats', chatRoutes)
app.route('/', viewRoutes)
app.route('/', reportRoutes)
app.route('/admin', adminAnalyticsRoutes)
app.route('/leads', leadRoutes)


export default app

import { serve } from 'bun'

const port = process.env.PORT || 8080

serve({
  fetch: app.fetch,
  port
})

console.log(`Server running on port ${port}`)