import db from '../../db.js'

export const listingDetailService = {
  async getById(id) {
    const listing = await db.kostListing.findFirst({
      where: {
        id,
        status: 'ACTIVE'
      },
      include: {
        owner: {
          include: {
            ownerProfile: true
          }
        },
        roomTypes: {
          include: {
            photos: {
              orderBy: {
                sortOrder: 'asc'
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (!listing) {
      return {
        error: 'Listing not found',
        status: 404
      }
    }

    const allPhotos = listing.roomTypes
      .flatMap((room) =>
        room.photos.map((photo) => ({
          id: photo.id,
          roomTypeId: room.id,
          roomTypeName: room.name,
          url: photo.url,
          mimeType: photo.mimeType,
          sizeBytes: photo.sizeBytes,
          sortOrder: photo.sortOrder
        }))
      )
      .sort((a, b) => a.sortOrder - b.sortOrder)

    const allFacilities = [
      ...new Set(
        listing.roomTypes.flatMap((room) =>
          Array.isArray(room.facilities) ? room.facilities : []
        )
      )
    ]

    const cheapestPrice =
      listing.roomTypes.length > 0
        ? Math.min(...listing.roomTypes.map((room) => Number(room.price)))
        : null

    return {
      data: {
        id: listing.id,
        name: listing.name,
        address: listing.address,
        latitude: Number(listing.latitude),
        longitude: Number(listing.longitude),
        genderType: listing.genderType,
        description: listing.description,
        rules: listing.rules,
        contactNumber: listing.contactNumber,
        status: listing.status,
        isPremium: listing.isPremium,
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
        cheapestPrice,
        facilities: allFacilities,
        photos: allPhotos,
        owner: {
          id: listing.owner.id,
          name: listing.owner.name,
          kostName: listing.owner.ownerProfile?.kostName ?? null,
          location: listing.owner.ownerProfile?.location ?? null,
          contact: listing.owner.ownerProfile?.contact ?? null
        },
        roomTypes: listing.roomTypes.map((room) => ({
          id: room.id,
          name: room.name,
          price: room.price,
          size: room.size,
          facilities: room.facilities,
          availableCount: room.availableCount,
          createdAt: room.createdAt,
          updatedAt: room.updatedAt,
          photos: room.photos.map((photo) => ({
            id: photo.id,
            url: photo.url,
            mimeType: photo.mimeType,
            sizeBytes: photo.sizeBytes,
            sortOrder: photo.sortOrder
          }))
        }))
      }
    }
  }
}