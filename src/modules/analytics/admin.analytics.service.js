import db from '../../db.js'

export const adminAnalyticsService = {
  async getDashboardSummary() {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setHours(0, 0, 0, 0)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)

    const [
      totalListings,
      activeListings,
      totalStudents,
      totalOwners,
      newUsersThisWeek,
      totalViewsToday
    ] = await Promise.all([
      db.kostListing.count(),
      db.kostListing.count({
        where: { status: 'ACTIVE' }
      }),
      db.user.count({
        where: { role: 'USER' }
      }),
      db.user.count({
        where: { role: 'OWNER' }
      }),
      db.user.count({
        where: {
          createdAt: { gte: sevenDaysAgo }
        }
      }),
      db.listingView.count({
        where: {
          viewedAt: { gte: startOfToday }
        }
      })
    ])

    return {
      data: {
        totalListings,
        activeListings,
        totalStudents,
        totalOwners,
        newUsersThisWeek,
        totalViewsToday
      }
    }
  },

  async getTopListings(limit = 10) {
    const listings = await db.kostListing.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        ownerId: true,
        _count: {
          select: {
            views: true,
            chatThreads: true,
            favoritedBy: true
          }
        },
        owner: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    const sorted = listings
      .map((listing) => ({
        id: listing.id,
        name: listing.name,
        status: listing.status,
        owner: listing.owner
          ? {
              id: listing.owner.id,
              name: listing.owner.name
            }
          : null,
        totalViews: listing._count.views,
        totalLeads: listing._count.chatThreads,
        totalFavorites: listing._count.favoritedBy
      }))
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, limit)

    return {
      data: sorted
    }
  }
}