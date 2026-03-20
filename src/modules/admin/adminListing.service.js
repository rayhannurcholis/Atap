import db from '../../db.js'


export const adminListingService = {
  async getPending() {
    return db.kostListing.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        owner: true,
        roomTypes: {
          include: {
            photos: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  },

  async approve(listingId) {
    const listing = await db.kostListing.findUnique({
      where: { id: listingId },
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

    if (listing.roomTypes.length < 1) {
      throw new Error("Listing must have at least 1 room type");
    }

    const totalPhotos = listing.roomTypes.reduce((acc, room) => {
      return acc + room.photos.length;
    }, 0);

    if (totalPhotos < 1) {
      throw new Error("At least 1 photo is required for approval");
    }

    return db.kostListing.update({
      where: { id: listingId },
      data: {
        status: "ACTIVE",
        rejectionReason: null,
      },
    });
  },

  async reject(listingId, rejectionReason) {
    const listing = await db.kostListing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new Error("Listing not found");
    }

    return db.kostListing.update({
      where: { id: listingId },
      data: {
        status: "REJECTED",
        rejectionReason,
      },
    });
  },

  async setPremium(listingId, isPremium) {
    const listing = await db.kostListing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new Error("Listing not found");
    }

    return db.kostListing.update({
      where: { id: listingId },
      data: {
        isPremium,
      },
    });
  },
};