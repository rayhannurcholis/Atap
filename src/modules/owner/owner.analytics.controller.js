import { ownerAnalyticsService } from './owner.analytics.service.js'

export const ownerAnalyticsController = {
  async getListingAnalytics(c) {
    try {
      const user = c.get('user')
      const listingId = c.req.param('id')

      const result = await ownerAnalyticsService.getListingAnalytics(user.id, listingId)

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
          message: error.message || 'Failed to get listing analytics'
        },
        400
      )
    }
  }
}