import db from "../../db.js";

export const searchService = {
  async search(params) {
    const { q, minPrice, maxPrice, genderType, sort = "relevance" } = params;

    const listings = await db.kostListing.findMany({
      where: {
        status: "ACTIVE",
        ...(q && {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { address: { contains: q, mode: "insensitive" } },
          ],
        }),
        ...(genderType && { genderType }),
      },
      include: {
        roomTypes: {
          include: {
            photos: {
              orderBy: {
                sortOrder: "asc",
              },
            },
          },
        },
      },
      orderBy:
        sort === "relevance"
          ? [{ isPremium: "desc" }, { createdAt: "desc" }]
          : [{ createdAt: "desc" }],
    });

    let results = listings.map((listing) => {
      const cheapestPrice =
        listing.roomTypes.length > 0
          ? Math.min(...listing.roomTypes.map((room) => room.price))
          : null;

      const firstPhoto =
        listing.roomTypes
          .flatMap((room) => room.photos)
          .sort((a, b) => a.sortOrder - b.sortOrder)[0] || null;

      return {
        id: listing.id,
        name: listing.name,
        address: listing.address,
        genderType: listing.genderType,
        isPremium: listing.isPremium,
        latitude: Number(listing.latitude),
        longitude: Number(listing.longitude),
        createdAt: listing.createdAt,
        cheapestPrice,
        thumbnailUrl: firstPhoto?.url || null,
      };
    });

    if (minPrice !== undefined) {
      results = results.filter(
        (item) => item.cheapestPrice !== null && item.cheapestPrice >= minPrice
      );
    }

    if (maxPrice !== undefined) {
      results = results.filter(
        (item) => item.cheapestPrice !== null && item.cheapestPrice <= maxPrice
      );
    }

    if (sort === "lowest_price") {
      results.sort(
        (a, b) => (a.cheapestPrice ?? Infinity) - (b.cheapestPrice ?? Infinity)
      );
    }

    if (sort === "highest_price") {
      results.sort(
        (a, b) => (b.cheapestPrice ?? -Infinity) - (a.cheapestPrice ?? -Infinity)
      );
    }

    if (sort === "newest") {
      results.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return results;
  },
};