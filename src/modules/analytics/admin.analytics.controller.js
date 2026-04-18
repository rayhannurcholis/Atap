import { adminAnalyticsService } from './admin.analytics.service.js'

export const adminAnalyticsController = {
  async getDashboard(c) {
    try {
      const result = await adminAnalyticsService.getDashboardSummary()

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
          message: error.message || 'Failed to get admin dashboard summary'
        },
        400
      )
    }
  },

  async getTopListings(c) {
    try {
      const limit = Number(c.req.query('limit') || 10)

      const result = await adminAnalyticsService.getTopListings(limit)

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
          message: error.message || 'Failed to get top listings'
        },
        400
      )
    }
  }
}