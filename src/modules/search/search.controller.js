import { searchListingQuerySchema } from './search.schema.js'
import { searchService } from './search.service.js'

export const searchController = {
  async search(c) {
    try {
      const query = {
        q: c.req.query('q'),
        minPrice: c.req.query('minPrice'),
        maxPrice: c.req.query('maxPrice'),
        genderType: c.req.query('genderType'),
        sort: c.req.query('sort'),
        facilities: c.req.query('facilities'),
        area: c.req.query('area'),
        lat: c.req.query('lat'),
        lng: c.req.query('lng'),
        radiusKm: c.req.query('radiusKm')
      }

      const parsed = searchListingQuerySchema.parse(query)
      const result = await searchService.search(parsed)

      return c.json({
        message: 'Success',
        data: result
      })
    } catch (error) {
      return c.json(
        {
          message: error.message || 'Failed to search listings'
        },
        400
      )
    }
  }
}