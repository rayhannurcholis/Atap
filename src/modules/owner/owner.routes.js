import { Hono } from 'hono'
import { authRequired } from '../../middleware/auth.js'
import { requireRole } from '../../middleware/role.js'
import { ownerDashboardController } from './owner.dashboard.controller.js'
import { ownerAnalyticsController } from './owner.analytics.controller.js'

const ownerRoutes = new Hono()

ownerRoutes.use('*', authRequired(), requireRole('OWNER'))

ownerRoutes.get('/dashboard', ownerDashboardController.getSummary)

ownerRoutes.get(
  '/listings/:id/analytics',
  ownerAnalyticsController.getListingAnalytics
)
export default ownerRoutes