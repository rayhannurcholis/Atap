import db from '../../db.js'
import {
  collectListingPhotos,
  roomTypesWithPhotosInclude
} from '../../utils/listingPhotos.js'

export const favoriteService = {
  async add(userId, listingId) {
    const existing = await db.favoriteListing.findUnique({
      where: {
        userId_listingId: {
          userId,
          listingId
        }
      }
    })

    if (existing) {
      return { message: 'Already in favorites' }
    }

    await db.favoriteListing.create({
      data: {
        userId,
        listingId
      }
    })

    return { message: 'Added to favorites' }
  },

  async remove(userId, listingId) {
    await db.favoriteListing.deleteMany({
      where: {
        userId,
        listingId
      }
    })

    return { message: 'Removed from favorites' }
  },

  async getAll(userId) {
    const favorites = await db.favoriteListing.findMany({
      where: { userId },
      include: {
        listing: {
          include: roomTypesWithPhotosInclude
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return favorites.map((fav) => {
      const listing = fav.listing

      const cheapestPrice =
        listing.roomTypes.length > 0
          ? Math.min(...listing.roomTypes.map((r) => r.price))
          : null

      const photos = collectListingPhotos(listing.roomTypes)
      const firstPhoto = photos[0] || null

      return {
        id: listing.id,
        name: listing.name,
        address: listing.address,
        genderType: listing.genderType,
        isPremium: listing.isPremium,
        latitude: Number(listing.latitude),
        longitude: Number(listing.longitude),
        cheapestPrice,
        thumbnailUrl: firstPhoto?.url || null,
        photos
      }
    })
  }
}