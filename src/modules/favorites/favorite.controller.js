import { favoriteService } from './favorite.service.js'

export const favoriteController = {
  async add(c) {
    try {
      const user = c.get('user')
      const listingId = c.req.param('listingId')

      const result = await favoriteService.add(user.id, listingId)

      return c.json({
        message: result.message
      })
    } catch (error) {
      return c.json(
        {
          message: error.message || 'Failed to add favorite'
        },
        400
      )
    }
  },

  async remove(c) {
    try {
      const user = c.get('user')
      const listingId = c.req.param('listingId')

      const result = await favoriteService.remove(user.id, listingId)

      return c.json({
        message: result.message
      })
    } catch (error) {
      return c.json(
        {
          message: error.message || 'Failed to remove favorite'
        },
        400
      )
    }
  },

  async getAll(c) {
    try {
      const user = c.get('user')

      const result = await favoriteService.getAll(user.id)

      return c.json({
        message: 'Success',
        data: result
      })
    } catch (error) {
      return c.json(
        {
          message: error.message || 'Failed to get favorites'
        },
        400
      )
    }
  }
}