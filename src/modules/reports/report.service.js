import db from '../../db.js'

export const reportService = {
  async create({ listingId, userId, reason, note = null }) {
    const listing = await db.kostListing.findFirst({
      where: {
        id: listingId,
        status: 'ACTIVE'
      }
    })

    if (!listing) {
      return { error: 'Listing not found', status: 404 }
    }

    // optional: prevent spam (same user same reason in 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const existing = await db.listingReport.findFirst({
      where: {
        listingId,
        userId,
        reason,
        createdAt: {
          gte: oneDayAgo
        }
      }
    })

    if (existing) {
      return {
        data: {
          message: 'You already reported this listing recently'
        }
      }
    }

    const report = await db.listingReport.create({
      data: {
        listingId,
        userId,
        reason,
        note
      }
    })

    return {
      data: {
        id: report.id,
        listingId: report.listingId,
        reason: report.reason,
        message: 'Listing reported successfully'
      }
    }
  }
}