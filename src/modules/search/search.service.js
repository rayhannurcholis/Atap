import db from '../../db.js'
import {
  collectListingPhotos,
  roomTypesWithPhotosInclude
} from '../../utils/listingPhotos.js'

function toRadians(value) {
  return (value * Math.PI) / 180
}

function distanceInKm(lat1, lng1, lat2, lng2) {
  const earthRadiusKm = 6371

  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadiusKm * c
}

const AREA_COORDINATES = {
  Kentingan: { lat: -7.556, lng: 110.856 },
  Gonilan: { lat: -7.555, lng: 110.769 },
  Pabelan: { lat: -7.552, lng: 110.777 },
  Jajar: { lat: -7.545, lng: 110.789 },
  Manahan: { lat: -7.557, lng: 110.805 }
}

export const searchService = {
  async search(params) {
    const {
      q,
      minPrice,
      maxPrice,
      genderType,
      sort = 'relevance',
      facilities = [],
      area,
      lat,
      lng,
      radiusKm = 2
    } = params

    const listings = await db.kostListing.findMany({
      where: {
        status: 'ACTIVE',
        ...(q && {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { address: { contains: q, mode: 'insensitive' } }
          ]
        }),
        ...(genderType && { genderType })
      },
      include: roomTypesWithPhotosInclude,
      orderBy:
        sort === 'relevance'
          ? [{ isPremium: 'desc' }, { createdAt: 'desc' }]
          : [{ createdAt: 'desc' }]
    })

    let results = listings.map((listing) => {
      const cheapestPrice =
        listing.roomTypes.length > 0
          ? Math.min(...listing.roomTypes.map((room) => Number(room.price)))
          : null

      const photos = collectListingPhotos(listing.roomTypes)
      const firstPhoto = photos[0] || null

      const allFacilities = listing.roomTypes.flatMap((room) =>
        Array.isArray(room.facilities) ? room.facilities : []
      )

      return {
        id: listing.id,
        name: listing.name,
        address: listing.address,
        genderType: listing.genderType,
        isPremium: listing.isPremium,
        latitude: listing.latitude !== null ? Number(listing.latitude) : null,
        longitude: listing.longitude !== null ? Number(listing.longitude) : null,
        createdAt: listing.createdAt,
        cheapestPrice,
        thumbnailUrl: firstPhoto?.url || null,
        photos,
        facilities: [...new Set(allFacilities)]
      }
    })

    if (minPrice !== undefined) {
      results = results.filter(
        (item) => item.cheapestPrice !== null && item.cheapestPrice >= minPrice
      )
    }

    if (maxPrice !== undefined) {
      results = results.filter(
        (item) => item.cheapestPrice !== null && item.cheapestPrice <= maxPrice
      )
    }

    if (facilities.length > 0) {
      const normalizedFacilities = facilities.map((item) => item.toLowerCase())

      results = results.filter((item) => {
        const itemFacilities = item.facilities.map((facility) =>
          String(facility).toLowerCase()
        )

        return normalizedFacilities.every((facility) =>
          itemFacilities.includes(facility)
        )
      })
    }

    let centerLat = lat
    let centerLng = lng

    if (
      (centerLat === undefined || centerLng === undefined) &&
      area &&
      AREA_COORDINATES[area]
    ) {
      centerLat = AREA_COORDINATES[area].lat
      centerLng = AREA_COORDINATES[area].lng
    }

    if (centerLat !== undefined && centerLng !== undefined) {
      results = results
        .map((item) => {
          if (item.latitude === null || item.longitude === null) {
            return { ...item, distanceKm: null }
          }

          const distanceKm = distanceInKm(
            centerLat,
            centerLng,
            item.latitude,
            item.longitude
          )

          return {
            ...item,
            distanceKm
          }
        })
        .filter((item) => item.distanceKm !== null && item.distanceKm <= radiusKm)
    }

    if (sort === 'lowest_price') {
      results.sort(
        (a, b) => (a.cheapestPrice ?? Infinity) - (b.cheapestPrice ?? Infinity)
      )
    }

    if (sort === 'highest_price') {
      results.sort(
        (a, b) => (b.cheapestPrice ?? -Infinity) - (a.cheapestPrice ?? -Infinity)
      )
    }

    if (sort === 'newest') {
      results.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    }

    return results
  }
}