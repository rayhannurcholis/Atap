import { adminListingService } from "./adminListing.service.js";

export const adminListingController = {
  async getPending(c) {
    try {
      const result = await adminListingService.getPending();

      return c.json({
        message: "Success",
        data: result,
      });
    } catch (error) {
      return c.json({
        message: error.message || "Failed to fetch pending listings",
      }, 400);
    }
  },

  async approve(c) {
    try {
      const listingId = c.req.param("id");
      const result = await adminListingService.approve(listingId);

      return c.json({
        message: "Listing approved successfully",
        data: result,
      });
    } catch (error) {
      return c.json({
        message: error.message || "Failed to approve listing",
      }, 400);
    }
  },

  async reject(c) {
    try {
      const listingId = c.req.param("id");
      const body = await c.req.json();

      const result = await adminListingService.reject(
        listingId,
        body.rejectionReason || null
      );

      return c.json({
        message: "Listing rejected successfully",
        data: result,
      });
    } catch (error) {
      return c.json({
        message: error.message || "Failed to reject listing",
      }, 400);
    }
  },

  async setPremium(c) {
    try {
      const listingId = c.req.param("id");
      const body = await c.req.json();

      const result = await adminListingService.setPremium(
        listingId,
        Boolean(body.isPremium)
      );

      return c.json({
        message: "Premium status updated successfully",
        data: result,
      });
    } catch (error) {
      return c.json({
        message: error.message || "Failed to update premium status",
      }, 400);
    }
  },
};