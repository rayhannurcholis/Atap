import { roomTypeService } from "./roomType.service.js";

export const roomTypeController = {
  async create(c) {
    try {
      const user = c.get("user");
      const listingId = c.req.param("id");
      const payload = c.req.valid("json");

      const result = await roomTypeService.create(user.id, listingId, payload);

      return c.json({
        message: "Room type created successfully",
        data: result,
      }, 201);
    } catch (error) {
      return c.json({
        message: error.message || "Failed to create room type",
      }, 400);
    }
  },

  async update(c) {
    try {
      const user = c.get("user");
      const roomTypeId = c.req.param("roomTypeId");
      const payload = c.req.valid("json");

      const result = await roomTypeService.update(user.id, roomTypeId, payload);

      return c.json({
        message: "Room type updated successfully",
        data: result,
      });
    } catch (error) {
      return c.json({
        message: error.message || "Failed to update room type",
      }, 400);
    }
  },

  async remove(c) {
    try {
      const user = c.get("user");
      const roomTypeId = c.req.param("roomTypeId");

      await roomTypeService.remove(user.id, roomTypeId);

      return c.json({
        message: "Room type deleted successfully",
      });
    } catch (error) {
      return c.json({
        message: error.message || "Failed to delete room type",
      }, 400);
    }
  },
};  