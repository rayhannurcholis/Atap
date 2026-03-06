import { Hono } from 'hono'

const router = new Hono()

router.get('/webhook', (c) => {
  return c.text('WhatsApp webhook ready')
})

router.post('/webhook', async (c) => {
  const body = await c.req.json()
  return c.json({
    message: 'Incoming WhatsApp webhook received',
    body
  })
})

export default router