import { reportService } from './report.service.js'

export const reportController = {
  async create(c) {
    try {
      const listingId = c.req.param('id')
      const user = c.get('user')

      const body = await c.req.json()

      const result = await reportService.create({
        listingId,
        userId: user.id,
        reason: body.reason,
        note: body.note
      })

      if (result?.error) {
        return c.json({ message: result.error }, result.status || 400)
      }

      return c.json({
        message: result.data.message,
        data: {
          id: result.data.id,
          listingId: result.data.listingId,
          reason: result.data.reason
        }
      })
    } catch (error) {
      return c.json(
        {
          message: error.message || 'Failed to report listing'
        },
        400
      )
    }
  }
}