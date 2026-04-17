import { z } from 'zod'
import { listingDetailService } from './listing.detail.service.js'

const listingIdParamSchema = z.object({
  id: z.string().min(1, 'Listing id is required')
})

export const listingDetailController = {
  async getById(c) {
    try {
      const params = {
        id: c.req.param('id')
      }

      const parsed = listingIdParamSchema.parse(params)
      const result = await listingDetailService.getById(parsed.id)

      if (result?.error) {
        return c.json(
          {
            message: result.error
          },
          result.status || 400
        )
      }

      return c.json({
        message: 'Success',
        data: result.data
      })
    } catch (error) {
      return c.json(
        {
          message: error.message || 'Failed to get listing detail'
        },
        400
      )
    }
  }
}