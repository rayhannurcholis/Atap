import { adminReportService } from './admin.report.service.js'

export const adminReportController = {
  async getReports(c) {
    try {
      const status = c.req.query('status')
      const limit = Number(c.req.query('limit') || 20)

      const result = await adminReportService.getReports({
        status,
        limit
      })

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
          message: error.message || 'Failed to get reports'
        },
        400
      )
    }
  },

  async reviewReport(c) {
    try {
      const user = c.get('user')
      const reportId = c.req.param('id')
      const body = await c.req.json()

      const result = await adminReportService.reviewReport(
        user.id,
        reportId,
        body.action
      )

      if (result?.error) {
        return c.json({ message: result.error }, result.status || 400)
      }

      return c.json({
        message: result.data.message,
        data: {
          id: result.data.id,
          status: result.data.status,
          action: result.data.action,
          listingId: result.data.listingId
        }
      })
    } catch (error) {
      return c.json(
        {
          message: error.message || 'Failed to review report'
        },
        400
      )
    }
  }
}