import { Hono } from 'hono'
import { searchController } from './search.controller.js'

const searchRoutes = new Hono()

// GET /search/listings
searchRoutes.get('/listings', searchController.search)

export default searchRoutes