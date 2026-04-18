import { viewService } from './view.service.js'

function getClientIp(c) {
  const forwardedFor = c.req.header('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = c.req.header('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }

  return 'unknown-ip'
}

function buildSessionKey(c) {
  const explicitSessionKey = c.req.header('x-session-key')
  if (explicitSessionKey) return explicitSessionKey

  const ip = getClientIp(c)
  const userAgent = c.req.header('user-agent') || 'unknown-ua'

  return `${ip}:${userAgent}`
}

export const viewController = {
  async track(c) {
    try {
      const listingId = c.req.param('id')
      const user = c.get('user')

      const result = await viewService.track({
        listingId,
        userId: user?.id ?? null,
        sessionKey: buildSessionKey(c)
      })

      if (result?.error) {
        return c.json({ message: result.error }, result.status || 400)
      }

      return c.json({
        message: result.data.message,
        data: {
          counted: result.data.counted
        }
      })
    } catch (error) {
      return c.json(
        {
          message: error.message || 'Failed to track listing view'
        },
        400
      )
    }
  },

  async getOwnerSummary(c) {
    try {
      const user = c.get('user')
      const listingId = c.req.param('id')

      const result = await viewService.getOwnerListingViewSummary(user.id, listingId)

      if (result?.error) {
        return c.json({ message: result.error }, result.status || 400)
      }

      return c.json({
        message: 'Success',
        data: result.data
      })
    } catch (error) {
      return c.json(
        {
          message: error.message || 'Failed to get listing view summary'
        },
        400
      )
    }
  }
}