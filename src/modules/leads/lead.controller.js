import { leadService } from './lead.service.js'

export const leadController = {
  async listForAdmin(c) {
    try {
      const listingId = c.req.query('listingId')
      const limit = Number(c.req.query('limit') || 20)

      const result = await leadService.listForAdmin({
        listingId: listingId || undefined,
        limit
      })

      return c.json({
        message: 'Success',
        data: result.data
      })
    } catch (error) {
      return c.json(
        {
          message: error.message || 'Failed to get leads'
        },
        400
      )
    }
  },

  async createGuestLead(c) {
    try {
        
      const listingId = c.req.param('id')
      const payload = c.req.valid('json')

      const result = await leadService.createGuestLead(
        listingId,
        payload
      )

      return c.json({
        message: result.alreadyExists
          ? 'Lead already exists'
          : 'Lead created successfully',
        data: result.lead
        
      })
    } catch (error) {
      return c.json({
        message: error.message
      }, 400)
    }
    
  },

  async createAuthLead(c) {
    try {
      const user = c.get('user')
      const listingId = c.req.param('id')

      const result = await leadService.createAuthLead(
        listingId,
        user.id
      )

      return c.json({
        message: result.alreadyExists
          ? 'Lead already exists'
          : 'Lead created successfully',
        data: result.lead
      })
    } catch (error) {
      return c.json({
        message: error.message
      }, 400)
    }
  }
}