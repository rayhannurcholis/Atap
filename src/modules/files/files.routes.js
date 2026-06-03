import { Hono } from 'hono'
import { getObjectFromR2 } from '../../utils/r2.js'

const filesRoutes = new Hono()

function getFileKey(c) {
  const pathname = new URL(c.req.url).pathname
  const key = pathname
    .replace(/^\/api\/files\/?/, '')
    .replace(/^\/files\/?/, '')

  return decodeURIComponent(key)
}

filesRoutes.get('/*', async (c) => {
  const key = getFileKey(c)

  if (!key) {
    return c.json({ message: 'File key is required' }, 400)
  }

  try {
    const object = await getObjectFromR2(key)

    const body = object.Body
    if (!body) {
      return c.json({ message: 'File not found' }, 404)
    }

    const bytes = await body.transformToByteArray()

    return new Response(bytes, {
      status: 200,
      headers: {
        'Content-Type': object.ContentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=86400'
      }
    })
  } catch (error) {
    if (error?.name === 'NoSuchKey' || error?.$metadata?.httpStatusCode === 404) {
      return c.json({ message: 'File not found' }, 404)
    }

    console.error('File proxy error:', error)
    return c.json({ message: 'Failed to load file' }, 500)
  }
})

export default filesRoutes
