import db from '../../db.js'

export const ownerDashboardService = {
  async getSummary(ownerId) {
    // ambil semua listing milik owner
    const listings = await db.kostListing.findMany({
      where: { ownerId },
      select: { id: true, status: true }
    })

    const listingIds = listings.map(l => l.id)

    if (listingIds.length === 0) {
      return {
        data: {
          totalListings: 0,
          activeListings: 0,
          totalViews: 0,
          todayViews: 0,
          weeklyViews: 0,
          totalLeads: 0,
          activeChats: 0
        }
      }
    }

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const [
      totalViews,
      todayViews,
      weeklyViews,
      totalLeads,
      activeChats
    ] = await Promise.all([
      db.listingView.count({
        where: {
          listingId: { in: listingIds }
        }
      }),
      db.listingView.count({
        where: {
          listingId: { in: listingIds },
          viewedAt: { gte: startOfToday }
        }
      }),
      db.listingView.count({
        where: {
          listingId: { in: listingIds },
          viewedAt: { gte: sevenDaysAgo }
        }
      }),
      db.chatThread.count({
        where: {
          listingId: { in: listingIds }
        }
      }),
      db.chatThread.count({
        where: {
          listingId: { in: listingIds },
          updatedAt: { gte: sevenDaysAgo }
        }
      })
    ])

    return {
      data: {
        totalListings: listings.length,
        activeListings: listings.filter(l => l.status === 'ACTIVE').length,
        totalViews,
        todayViews,
        weeklyViews,
        totalLeads,
        activeChats
      }
    }
  }
}