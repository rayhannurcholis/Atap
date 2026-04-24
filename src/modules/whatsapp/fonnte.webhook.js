import { Hono } from 'hono'
import { whatsappService } from './whatsapp.service.js'

const fonnteWebhook = new Hono()

fonnteWebhook.get('/', (c) => {
  console.log('🔥 FONNTE GET HIT')
  return c.text('ok', 200)
})

fonnteWebhook.post('/', async (c) => {
  try {
    const contentType = c.req.header('content-type') || ''
    let body

    if (contentType.includes('application/json')) {
      body = await c.req.json()
    } else {
      body = await c.req.parseBody()
    }

    console.log('🔥 FONNTE CONTENT-TYPE:', contentType)
    console.log('🔥 FONNTE RAW:', JSON.stringify(body, null, 2))

    const phone = body.sender || body.from || body.number || ''
    const text = body.message || body.text || body.body || ''

    console.log('🔥 FONNTE PARSED:', { phone, text })

    if (!phone || !text) {
      return c.json({ ok: true, ignored: true, body })
    }

    console.log('📩 Incoming Fonnte:', { phone, text })

    await whatsappService.handleIncomingMessage(phone, text)

    return c.json({ ok: true })
  } catch (error) {
    console.error('Fonnte webhook error:', error)
    return c.json({ ok: false, message: error.message }, 500)
  }
})

export default fonnteWebhook