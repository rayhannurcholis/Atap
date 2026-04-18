import { Hono } from 'hono'
import { authRequired } from '../../middleware/auth.js'
import { requireRole } from '../../middleware/role.js'
import { adminAnalyticsController } from './admin.analytics.controller.js'
import { adminReportController } from './admin.report.controller.js'

const adminAnalyticsRoutes = new Hono()

adminAnalyticsRoutes.use('*', authRequired(), requireRole('ADMIN'))

adminAnalyticsRoutes.get('/dashboard', adminAnalyticsController.getDashboard)
adminAnalyticsRoutes.get('/analytics/top-listings', adminAnalyticsController.getTopListings)

adminAnalyticsRoutes.get('/reports', adminReportController.getReports)
adminAnalyticsRoutes.patch('/reports/:id', adminReportController.reviewReport)

export default adminAnalyticsRoutes