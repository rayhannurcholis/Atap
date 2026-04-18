import db from '../../db.js'

export const viewService = {
  async track({ listingId, userId = null, sessionKey = null }) {
    const listing = await db.kostListing.findFirst({
      where: {
        id: listingId,
        status: 'ACTIVE'
      }
    })

    if (!listing) {
      return { error: 'Listing not found', status: 404 }
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

    const dedupWhere = userId
      ? {
          listingId,
          userId,
          viewedAt: {
            gte: oneHourAgo
          }
        }
      : {
          listingId,
          sessionKey,
          viewedAt: {
            gte: oneHourAgo
          }
        }

    const existing = await db.listingView.findFirst({
      where: dedupWhere
    })

    if (existing) {
      return {
        data: {
          counted: false,
          message: 'View already counted within 1 hour'
        }
      }
    }

    await db.listingView.create({
      data: {
        listingId,
        userId,
        sessionKey
      }
    })

    return {
      data: {
        counted: true,
        message: 'View counted successfully'
      }
    }
  },

  async getOwnerListingViewSummary(ownerId, listingId) {
    const listing = await db.kostListing.findFirst({
      where: {
        id: listingId,
        ownerId
      }
    })

    if (!listing) {
      return { error: 'Listing not found', status: 404 }
    }

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const [totalViews, todayViews] = await Promise.all([
      db.listingView.count({
        where: { listingId }
      }),
      db.listingView.count({
        where: {
          listingId,
          viewedAt: {
            gte: startOfToday
          }
        }
      })
    ])

    return {
      data: {
        listingId,
        totalViews,
        todayViews
      }
    }
  }
}