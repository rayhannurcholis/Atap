import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'

import { leadController } from './lead.controller.js'
import {
  createGuestLeadSchema,
  lookupRequestOtpSchema,
  lookupVerifyOtpSchema
} from './lead.schema.js'

import { authRequired } from '../../middleware/auth.js'
import { requireRole } from '../../middleware/role.js'

const leadRoutes = new Hono()

// ADMIN — semua lead
leadRoutes.get(
  '/',
  authRequired(),
  requireRole('ADMIN'),
  leadController.listForAdmin
)

// AUTH USER — kos yang diminati oleh user yang login
leadRoutes.get(
  '/me',
  authRequired(),
  requireRole('USER'),
  leadController.listMine
)

// PUBLIC — guest minta OTP untuk melihat minatnya via nomor WA
leadRoutes.post(
  '/lookup/request-otp',
  zValidator('json', lookupRequestOtpSchema),
  leadController.requestLookupOtp
)

// PUBLIC — guest verifikasi OTP lalu dapat daftar kos yang diminati
leadRoutes.post(
  '/lookup',
  zValidator('json', lookupVerifyOtpSchema),
  leadController.verifyLookupOtp
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
