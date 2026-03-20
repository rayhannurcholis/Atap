import db from '../../db.js'

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
    return db.kostListing.findMany({
      where: { ownerId },
      include: {
        roomTypes: {
          include: {
            photos: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async getOwnerListingById(ownerId, listingId) {
    const listing = await db.kostListing.findFirst({
      where: {
        id: listingId,
        ownerId,
      },
      include: {
        roomTypes: {
          include: {
            photos: true,
          },
        },
      },
    });

    if (!listing) {
      throw new Error("Listing not found");
    }

    return listing;
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

    return db.kostListing.update({
      where: { id: listingId },
      data: {
        status: "INACTIVE",
      },
    });
  },

  async getPublicListings() {
    return db.kostListing.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        roomTypes: {
          include: {
            photos: true,
          },
        },
      },
      orderBy: [
        { isPremium: "desc" },
        { createdAt: "desc" },
      ],
    });
  },

  async getPublicListingById(id) {
    const listing = await db.kostListing.findFirst({
      where: {
        id,
        status: "ACTIVE",
      },
      include: {
        roomTypes: {
          include: {
            photos: true,
          },
        },
      },
    });

    if (!listing) {
      throw new Error("Listing not found");
    }

    return listing;
  },
};