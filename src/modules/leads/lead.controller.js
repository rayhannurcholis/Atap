import { leadService } from './lead.service.js'

export const leadController = {
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