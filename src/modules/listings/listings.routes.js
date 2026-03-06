import { Hono } from 'hono'

const router = new Hono()

router.get('/', async (c) => {
  return c.json({
    message: 'Listings route ready'
  })
})

export default router