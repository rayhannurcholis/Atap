import db from '../../db.js'
import { env } from '../../env.js'
import {
  deleteFromR2,
  toProxiedFileUrl,
  uploadBufferToR2
} from '../../utils/r2.js'

const ALLOWED_PROOF_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_PROOF_SIZE = 5 * 1024 * 1024

function sanitizeFileName(name = 'proof') {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

export function getLeadPaymentInfo() {
  return {
    bankName: env.LEAD_PAYMENT_BANK_NAME,
    accountNumber: env.LEAD_PAYMENT_ACCOUNT_NUMBER,
    accountHolder: env.LEAD_PAYMENT_ACCOUNT_HOLDER,
    amount: env.LEAD_PAYMENT_AMOUNT,
    notes: env.LEAD_PAYMENT_NOTES,
    proofOptional: true
  }
}

export function formatLead(lead) {
  if (!lead) return lead

  return {
    ...lead,
    paymentProofUrl:
      lead.paymentProofKey || lead.paymentProofUrl
        ? toProxiedFileUrl(lead.paymentProofUrl, lead.paymentProofKey)
        : null
  }
}

async function createLeadRecord({ listingId, userId }) {
  const listing = await db.kostListing.findFirst({
    where: {
      id: listingId,
      status: 'ACTIVE'
    }
  })

  if (!listing) {
    throw new Error('Listing not found')
  }

  if (listing.ownerId === userId) {
    throw new Error('Cannot add own listing as lead')
  }

  const existing = await db.listingLead.findUnique({
    where: {
      listingId_userId: {
        listingId,
        userId
      }
    }
  })

  if (existing) {
    return {
      alreadyExists: true,
      lead: formatLead(existing),
      paymentInfo: getLeadPaymentInfo()
    }
  }

  const lead = await db.listingLead.create({
    data: {
      listingId,
      userId
    }
  })

  return {
    alreadyExists: false,
    lead: formatLead(lead),
    paymentInfo: getLeadPaymentInfo()
  }
}

async function findOrCreateGuestUser(payload) {
  const byPhone = await db.user.findFirst({
    where: { phone: payload.phone }
  })

  if (byPhone) {
    return byPhone
  }

  if (payload.email) {
    const byEmail = await db.user.findUnique({
      where: { email: payload.email }
    })

    if (byEmail) {
      if (!byEmail.phone) {
        return db.user.update({
          where: { id: byEmail.id },
          data: { phone: payload.phone }
        })
      }

      return byEmail
    }
  }

  return db.user.create({
    data: {
      role: 'USER',
      name: payload.name,
      phone: payload.phone,
      email: payload.email || null,
      passwordHash: null,
      isEmailVerified: false
    }
  })
}

async function assertLeadAccess(lead, { userId, phone }) {
  if (userId) {
    if (lead.userId !== userId) {
      throw new Error('Forbidden')
    }
    return
  }

  if (!phone) {
    throw new Error('Phone is required for guest payment proof upload')
  }

  if (lead.user.phone !== phone) {
    throw new Error('Invalid phone for this lead')
  }
}

export const leadService = {
  getPaymentInfo() {
    return getLeadPaymentInfo()
  },

  async listForAdmin({ listingId, limit = 20 }) {
    const where = {}

    if (listingId) {
      where.listingId = listingId
    }

    const leads = await db.listingLead.findMany({
      where,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true
          }
        },
        listing: {
          select: {
            id: true,
            name: true,
            status: true,
            ownerId: true,
            contactNumber: true
          }
        }
      }
    })

    return { data: leads.map(formatLead) }
  },

  async createAuthLead(listingId, userId) {
    return createLeadRecord({
      listingId,
      userId
    })
  },

  async createGuestLead(listingId, payload) {
    const user = await findOrCreateGuestUser(payload)

    return createLeadRecord({
      listingId,
      userId: user.id
    })
  },

  async uploadPaymentProof(leadId, file, { userId, phone }) {
    if (!file) {
      throw new Error('Payment proof file is required')
    }

    if (!ALLOWED_PROOF_TYPES.includes(file.type)) {
      throw new Error('Only JPG, PNG, and WEBP files are allowed')
    }

    if (file.size > MAX_PROOF_SIZE) {
      throw new Error('Payment proof must be at most 5MB')
    }

    const lead = await db.listingLead.findUnique({
      where: { id: leadId },
      include: {
        user: {
          select: {
            id: true,
            phone: true
          }
        }
      }
    })

    if (!lead) {
      throw new Error('Lead not found')
    }

    await assertLeadAccess(lead, { userId, phone })

    if (lead.paymentProofKey) {
      try {
        await deleteFromR2(lead.paymentProofKey)
      } catch (_) {}
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const key = `leads/${leadId}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`
    const url = await uploadBufferToR2({
      key,
      buffer,
      contentType: file.type
    })

    const updated = await db.listingLead.update({
      where: { id: leadId },
      data: {
        paymentProofUrl: url,
        paymentProofKey: key,
        paymentProofUploadedAt: new Date()
      }
    })

    return formatLead(updated)
  }
}
