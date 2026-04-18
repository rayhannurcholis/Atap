import { Hono } from 'hono'
import { authRequired } from '../../middleware/auth.js'
import { requireRole } from '../../middleware/role.js'
import { reportController } from './report.controller.js'

const reportRoutes = new Hono()

reportRoutes.use('*', authRequired())

reportRoutes.post(
  '/listings/:id/report',
  requireRole('USER'),
  reportController.create
)

export default reportRoutes