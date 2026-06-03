import db from '../../db.js'
import {
  collectListingPhotos,
  mapRoomTypePhotos,
  roomTypesWithPhotosInclude
} from '../../utils/listingPhotos.js'

function formatListingWithPhotos(listing) {
  const photos = collectListingPhotos(listing.roomTypes)
  const thumbnailUrl = photos[0]?.url || null

  return {
    ...listing,
    photos,
    thumbnailUrl,
    roomTypes: listing.roomTypes.map((room) => ({
      ...room,
      photos: mapRoomTypePhotos(room)
    }))
  }
}

export const listingService = {
  async create(ownerId, payload) {
  const listing = await db.kostListing.create({
    data: {
      ownerId,
      name: payload.name,
      address: payload.address,
      latitude: String(payload.latitude),
      longitude: String(payload.longitude),
      genderType: payload.genderType,
      description: payload.description,
      rules: payload.rules,
      contactNumber: payload.contactNumber,
      status: "PENDING",
    },
  });

  return listing;
},

  async getOwnerListings(ownerId) {
    const listings = await db.kostListing.findMany({
      where: { ownerId },
      include: roomTypesWithPhotosInclude,
      orderBy: {
        createdAt: "desc",
      },
    });

    return listings.map(formatListingWithPhotos);
  },

  async getOwnerListingById(ownerId, listingId) {
    const listing = await db.kostListing.findFirst({
      where: {
        id: listingId,
        ownerId,
      },
      include: roomTypesWithPhotosInclude,
    });

    if (!listing) {
      throw new Error("Listing not found");
    }

    return formatListingWithPhotos(listing);
  },

  async update(ownerId, listingId, payload) {
  const existing = await db.kostListing.findFirst({
    where: {
      id: listingId,
      ownerId,
    },
  });

  if (!existing) {
    throw new Error("Listing not found");
  }

  const updated = await db.kostListing.update({
    where: { id: listingId },
    data: {
      ...payload,
      ...(payload.latitude !== undefined && { latitude: String(payload.latitude) }),
      ...(payload.longitude !== undefined && { longitude: String(payload.longitude) }),
    },
  });

  return updated;
},

  async deactivate(ownerId, listingId) {
    const existing = await db.kostListing.findFirst({
      where: {
        id: listingId,
        ownerId,
      },
    });

    if (!existing) {
      throw new Error("Listing not found");
    }

    if (existing.status !== "ACTIVE") {
      throw new Error("Only active listings can be deactivated");
    }

    return db.kostListing.update({
      where: { id: listingId },
      data: {
        status: "INACTIVE",
      },
    });
  },

  async requestReactivation(ownerId, listingId) {
    const existing = await db.kostListing.findFirst({
      where: {
        id: listingId,
        ownerId,
      },
    });

    if (!existing) {
      throw new Error("Listing not found");
    }

    if (existing.status !== "INACTIVE") {
      throw new Error("Only inactive listings can be reactivated");
    }

    return db.kostListing.update({
      where: { id: listingId },
      data: {
        status: "PENDING",
        rejectionReason: null,
      },
    });
  },

  async getPublicListings() {
    const listings = await db.kostListing.findMany({
      where: {
        status: "ACTIVE",
      },
      include: roomTypesWithPhotosInclude,
      orderBy: [
        { isPremium: "desc" },
        { createdAt: "desc" },
      ],
    });

    return listings.map(formatListingWithPhotos);
  },

  async getPublicListingById(id) {
    const listing = await db.kostListing.findFirst({
      where: {
        id,
        status: "ACTIVE",
      },
      include: roomTypesWithPhotosInclude,
    });

    if (!listing) {
      throw new Error("Listing not found");
    }

    return formatListingWithPhotos(listing);
  },
};