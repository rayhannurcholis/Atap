import db from '../../db.js'
import {
  collectListingPhotos,
  mapRoomTypePhotos,
  roomTypesWithPhotosInclude
} from '../../utils/listingPhotos.js'
import { fuzzLocation } from '../../utils/geoMask.js'
import { applyPriceMarkup } from '../../utils/pricing.js'

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
        ...roomTypesWithPhotosInclude
      }
    })

    if (!listing) {
      return {
        error: 'Listing not found',
        status: 404
      }
    }

    const allPhotos = collectListingPhotos(listing.roomTypes)

    const allFacilities = [
      ...new Set(
        listing.roomTypes.flatMap((room) =>
          Array.isArray(room.facilities) ? room.facilities : []
        )
      )
    ]

    const cheapestPrice =
      listing.roomTypes.length > 0
        ? applyPriceMarkup(
            Math.min(...listing.roomTypes.map((room) => Number(room.price)))
          )
        : null

    // Lokasi publik di-masking: kirim center lingkaran + radius, bukan titik asli.
    const fuzz = fuzzLocation(listing.latitude, listing.longitude, listing.id)

    return {
      data: {
        id: listing.id,
        name: listing.name,
        address: listing.address,
        latitude: fuzz?.centerLat ?? null,
        longitude: fuzz?.centerLng ?? null,
        locationRadiusM: fuzz?.radiusM ?? null,
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
          price: applyPriceMarkup(room.price),
          size: room.size,
          facilities: room.facilities,
          availableCount: room.availableCount,
          createdAt: room.createdAt,
          updatedAt: room.updatedAt,
          photos: mapRoomTypePhotos(room)
        }))
      }
    }
  }
}