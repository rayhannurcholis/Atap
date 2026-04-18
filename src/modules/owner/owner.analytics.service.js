import db from '../../db.js'

function formatDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function buildLastNDays(days) {
  const dates = []
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - i)
    dates.push(d)
  }

  return dates
}

export const ownerAnalyticsService = {
  async getListingAnalytics(ownerId, listingId) {
    const listing = await db.kostListing.findFirst({
      where: {
        id: listingId,
        ownerId
      },
      select: {
        id: true,
        name: true,
        
        status: true
      }
    })

    if (!listing) {
      return { error: 'Listing not found', status: 404 }
    }

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setHours(0, 0, 0, 0)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)

    const [
      totalViews,
      todayViews,
      weeklyViews,
      totalLeads,
      activeChats,
      recentViews
    ] = await Promise.all([
      db.listingView.count({
        where: { listingId }
      }),
      db.listingView.count({
        where: {
          listingId,
          viewedAt: { gte: startOfToday }
        }
      }),
      db.listingView.count({
        where: {
          listingId,
          viewedAt: { gte: sevenDaysAgo }
        }
      }),
      db.chatThread.count({
        where: { listingId }
      }),
      db.chatThread.count({
        where: {
          listingId,
          updatedAt: { gte: sevenDaysAgo }
        }
      }),
      db.listingView.findMany({
        where: {
          listingId,
          viewedAt: { gte: sevenDaysAgo }
        },
        select: {
          viewedAt: true
        },
        orderBy: {
          viewedAt: 'asc'
        }
      })
    ])

    const last7Days = buildLastNDays(7)
    const dailyMap = Object.fromEntries(
      last7Days.map((date) => [formatDateKey(date), 0])
    )

    for (const view of recentViews) {
      const key = formatDateKey(new Date(view.viewedAt))
      if (dailyMap[key] !== undefined) {
        dailyMap[key] += 1
      }
    }

    const viewsPerDay = last7Days.map((date) => {
      const key = formatDateKey(date)
      return {
        date: key,
        views: dailyMap[key]
      }
    })

    return {
      data: {
        listingId: listing.id,
        listingName: listing.name || listing.title || null,
        status: listing.status,
        totalViews,
        todayViews,
        weeklyViews,
        totalLeads,
        activeChats,
        viewsPerDay
      }
    }
  }
}