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

// PUBLIC — info rekening transfer (sebelum/sesudah klik minat)
leadRoutes.get('/payment-info', leadController.getPaymentInfo)

// PUBLIC — upload bukti transfer (opsional, setelah lead dibuat)
leadRoutes.post(
  '/records/:leadId/payment-proof',
  leadController.uploadPaymentProof
)

// PUBLIC — buat lead guest
leadRoutes.post(
  '/:id',
  zValidator('json', createGuestLeadSchema),
  leadController.createGuestLead
)

// AUTH — buat lead user login
leadRoutes.post(
  '/:id/auth',
  authRequired(),
  requireRole('USER'),
  leadController.createAuthLead
)

export default leadRoutes
