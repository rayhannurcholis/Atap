import db from '../../db.js'

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
      lead: existing
    }
  }

  const lead = await db.listingLead.create({
    data: {
      listingId,
      userId,
      source: 'WEB'
    }
  })

  return {
    alreadyExists: false,
    lead
  }
}

export const leadService = {
  async createAuthLead(listingId, userId) {
    return createLeadRecord({
      listingId,
      userId
    })
  },

  async createGuestLead(listingId, payload) {
    let user = await db.user.findFirst({
      where: {
        phone: payload.phone
      }
    })

    if (!user) {
      user = await db.user.create({
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

    return createLeadRecord({
      listingId,
      userId: user.id
    })
  }
}