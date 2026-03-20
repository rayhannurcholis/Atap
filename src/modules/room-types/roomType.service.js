import db from '../../db.js'

export const roomTypeService = {
  async create(ownerId, listingId, payload) {
    const listing = await db.kostListing.findFirst({
      where: {
        id: listingId,
        ownerId,
      },
    });

    if (!listing) {
      throw new Error("Listing not found");
    }

    const roomType = await db.roomType.create({
      data: {
        listingId,
        name: payload.name,
        price: payload.price,
        size: payload.size,
        facilities: payload.facilities,
        availableCount: payload.availableCount,
      },
    });

    return roomType;
  },

  async update(ownerId, roomTypeId, payload) {
    const roomType = await db.roomType.findFirst({
      where: {
        id: roomTypeId,
        listing: {
          ownerId,
        },
      },
      include: {
        listing: true,
      },
    });

    if (!roomType) {
      throw new Error("Room type not found");
    }

    return db.roomType.update({
      where: { id: roomTypeId },
      data: {
        ...payload,
      },
    });
  },

  async remove(ownerId, roomTypeId) {
    const roomType = await db.roomType.findFirst({
      where: {
        id: roomTypeId,
        listing: {
          ownerId,
        },
      },
    });

    if (!roomType) {
      throw new Error("Room type not found");
    }

    await db.roomType.delete({
      where: { id: roomTypeId },
    });

    return true;
  },
};