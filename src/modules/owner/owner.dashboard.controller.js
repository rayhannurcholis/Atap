import { ownerDashboardService } from './owner.dashboard.service.js'

export const ownerDashboardController = {
  async getSummary(c) {
    try {
      const user = c.get('user')

      const result = await ownerDashboardService.getSummary(user.id)

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
          message: error.message || 'Failed to get dashboard summary'
        },
        400
      )
    }
  }
}