import jwt from 'jsonwebtoken'
import { env } from '../../env.js'
import { leadService } from './lead.service.js'

function getOptionalUser(c) {
  const authHeader = c.req.header('authorization') || ''
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null

  if (!token) return null

  try {
    return jwt.verify(token, env.JWT_SECRET)
  } catch {
    return null
  }
}

function isUploadFile(value) {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.arrayBuffer === 'function'
  )
}

function extractProofFile(body) {
  const candidates = [body.proof, body.paymentProof, body.file]

  for (const value of candidates) {
    if (Array.isArray(value)) {
      const file = value.find(isUploadFile)
      if (file) return file
    } else if (isUploadFile(value)) {
      return value
    }
  }

  return null
}

export const leadController = {
  async getPaymentInfo(c) {
    try {
      return c.json({
        message: 'Success',
        data: leadService.getPaymentInfo()
      })
    } catch (error) {
      return c.json(
        {
          message: error.message || 'Failed to get payment info'
        },
        400
      )
    }
  },

  async listForAdmin(c) {
    try {
      const listingId = c.req.query('listingId')
      const limit = Number(c.req.query('limit') || 20)

      const result = await leadService.listForAdmin({
        listingId: listingId || undefined,
        limit
      })

      return c.json({
        message: 'Success',
        data: result.data
      })
    } catch (error) {
      return c.json(
        {
          message: error.message || 'Failed to get leads'
        },
        400
      )
    }
  },

  async createGuestLead(c) {
    try {
      const listingId = c.req.param('id')
      const payload = c.req.valid('json')

      const result = await leadService.createGuestLead(listingId, payload)

      return c.json({
        message: result.alreadyExists
          ? 'Lead already exists'
          : 'Lead created successfully',
        data: result.lead,
        paymentInfo: result.paymentInfo
      })
    } catch (error) {
      return c.json(
        {
          message: error.message
        },
        400
      )
    }
  },

  async createAuthLead(c) {
    try {
      const user = c.get('user')
      const listingId = c.req.param('id')

      const result = await leadService.createAuthLead(listingId, user.id)

      return c.json({
        message: result.alreadyExists
          ? 'Lead already exists'
          : 'Lead created successfully',
        data: result.lead,
        paymentInfo: result.paymentInfo
      })
    } catch (error) {
      return c.json(
        {
          message: error.message
        },
        400
      )
    }
  },

  async uploadPaymentProof(c) {
    try {
      const leadId = c.req.param('leadId')
      const body = await c.req.parseBody()
      const file = extractProofFile(body)
      const phone =
        typeof body.phone === 'string' && body.phone.trim()
          ? body.phone.trim()
          : undefined
      const user = getOptionalUser(c)
      const userId = user?.id || user?.userId || undefined

      const result = await leadService.uploadPaymentProof(leadId, file, {
        userId,
        phone
      })

      return c.json({
        message: 'Payment proof uploaded successfully',
        data: result
      })
    } catch (error) {
      const status =
        error.message === 'Forbidden'
          ? 403
          : error.message === 'Lead not found'
            ? 404
            : 400

      return c.json(
        {
          message: error.message || 'Failed to upload payment proof'
        },
        status
      )
    }
  }
}
