import { Hono } from 'hono'
import { favoriteController } from './favorite.controller.js'
import { authRequired } from '../../middleware/auth.js'

const favoriteRoutes = new Hono()

favoriteRoutes.use('*', authRequired())

favoriteRoutes.get('/', favoriteController.getAll)
favoriteRoutes.post('/:listingId', favoriteController.add)
favoriteRoutes.delete('/:listingId', favoriteController.remove)

export default favoriteRoutes