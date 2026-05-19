import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'

import { leadController } from './lead.controller.js'
import { createGuestLeadSchema } from './lead.schema.js'

import { authRequired } from '../../middleware/auth.js'
import { requireRole } from '../../middleware/role.js'

const leadRoutes = new Hono()

// ADMIN
leadRoutes.get(
  '/',
  authRequired(),
  requireRole('ADMIN'),
  leadController.listForAdmin
)

// PUBLIC
leadRoutes.post(
  '/:id',
  zValidator('json', createGuestLeadSchema),
  leadController.createGuestLead
)

// AUTH
leadRoutes.post(
  '/:id/auth',
  authRequired(),
  requireRole('USER'),
  leadController.createAuthLead
)

export default leadRoutes