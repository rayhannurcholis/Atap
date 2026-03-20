import { listingService } from "./listing.service.js";

export const listingController = {
 async create(c) {
  try {
    const user = c.get("user");
    const payload = c.req.valid("json");

    const ownerId = user?.id || user?.userId;

    if (!ownerId) {
      return c.json({
        message: "Authenticated user id not found in token",
        user
      }, 401);
    }

    const result = await listingService.create(ownerId, payload);

    return c.json({
      message: "Listing created successfully",
      data: result,
    }, 201);
  } catch (error) {
    return c.json({
      message: error.message || "Failed to create listing",
    }, 400);
  }
},

  async getOwnerListings(c) {
    try {
      const user = c.get("user");
      const result = await listingService.getOwnerListings(user.id);

      return c.json({
        message: "Success",
        data: result,
      });
    } catch (error) {
      return c.json({
        message: error.message || "Failed to fetch listings",
      }, 400);
    }
  },

  async getOwnerListingById(c) {
    try {
      const user = c.get("user");
      const listingId = c.req.param("id");

      const result = await listingService.getOwnerListingById(user.id, listingId);

      return c.json({
        message: "Success",
        data: result,
      });
    } catch (error) {
      return c.json({
        message: error.message || "Failed to fetch listing",
      }, 404);
    }
  },

  async update(c) {
    try {
      const user = c.get("user");
      const listingId = c.req.param("id");
      const payload = c.req.valid("json");

      const result = await listingService.update(user.id, listingId, payload);

      return c.json({
        message: "Listing updated successfully",
        data: result,
      });
    } catch (error) {
      return c.json({
        message: error.message || "Failed to update listing",
      }, 400);
    }
  },

  async deactivate(c) {
    try {
      const user = c.get("user");
      const listingId = c.req.param("id");

      const result = await listingService.deactivate(user.id, listingId);

      return c.json({
        message: "Listing deactivated successfully",
        data: result,
      });
    } catch (error) {
      return c.json({
        message: error.message || "Failed to deactivate listing",
      }, 400);
    }
  },

  async getPublicListings(c) {
    try {
      const result = await listingService.getPublicListings();

      return c.json({
        message: "Success",
        data: result,
      });
    } catch (error) {
      return c.json({
        message: error.message || "Failed to fetch listings",
      }, 400);
    }
  },

  async getPublicListingById(c) {
    try {
      const id = c.req.param("id");
      const result = await listingService.getPublicListingById(id);

      return c.json({
        message: "Success",
        data: result,
      });
    } catch (error) {
      return c.json({
        message: error.message || "Listing not found",
      }, 404);
    }
  },
};