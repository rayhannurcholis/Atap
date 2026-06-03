import { toProxiedFileUrl } from './r2.js'

/** Prisma include: semua foto per room type, urut sortOrder */
export const roomPhotosInclude = {
  orderBy: { sortOrder: 'asc' }
}

export const roomTypesWithPhotosInclude = {
  roomTypes: {
    include: {
      photos: roomPhotosInclude
    },
    orderBy: { createdAt: 'asc' }
  }
}

/**
 * Gabungkan semua foto dari semua room type (untuk galeri listing).
 */
export function collectListingPhotos(roomTypes = []) {
  return roomTypes
    .flatMap((room) =>
      (room.photos || []).map((photo) => ({
        id: photo.id,
        roomTypeId: room.id,
        roomTypeName: room.name,
        url: toProxiedFileUrl(photo.url, photo.key),
        mimeType: photo.mimeType ?? null,
        sizeBytes: photo.sizeBytes ?? null,
        sortOrder: photo.sortOrder ?? 0
      }))
    )
    .sort((a, b) => {
      if (a.roomTypeId !== b.roomTypeId) {
        return String(a.roomTypeName).localeCompare(String(b.roomTypeName))
      }
      return a.sortOrder - b.sortOrder
    })
}

export function mapRoomTypePhotos(room) {
  return (room.photos || []).map((photo) => ({
    id: photo.id,
    url: toProxiedFileUrl(photo.url, photo.key),
    mimeType: photo.mimeType ?? null,
    sizeBytes: photo.sizeBytes ?? null,
    sortOrder: photo.sortOrder ?? 0
  }))
}
