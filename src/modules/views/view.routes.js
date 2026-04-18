import { Hono } from 'hono'
import { viewController } from './view.controller.js'
import { authRequired } from '../../middleware/auth.js'
import { requireRole } from '../../middleware/role.js'

const viewRoutes = new Hono()

// public/user/owner boleh track view
viewRoutes.post('/listings/:id/view', viewController.track)

// owner dashboard summary
viewRoutes.get(
  '/owner/listings/:id/views',
  authRequired(),
  requireRole('OWNER'),
  viewController.getOwnerSummary
)

export default viewRoutes