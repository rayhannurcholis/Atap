import { photoService } from "./photo.service.js";

export const photoController = {
  async upload(c) {
    try {
      const user = c.get("user");
      const ownerId = user?.id || user?.userId;
      const roomTypeId = c.req.param("roomTypeId");

      if (!ownerId) {
        return c.json(
          {
            message: "Authenticated user id not found in token",
          },
          401
        );
      }

      const body = await c.req.parseBody();
      const rawFiles = body.photos;

      const files = Array.isArray(rawFiles)
        ? rawFiles
        : rawFiles
        ? [rawFiles]
        : [];

      const result = await photoService.upload(ownerId, roomTypeId, files);

      return c.json(
        {
          message: "Photos uploaded successfully",
          data: result,
        },
        201
      );
    } catch (error) {
      return c.json(
        {
          message: error.message || "Failed to upload photos",
        },
        400
      );
    }
  },

  async remove(c) {
    try {
      const user = c.get("user");
      const ownerId = user?.id || user?.userId;
      const photoId = c.req.param("photoId");

      if (!ownerId) {
        return c.json(
          {
            message: "Authenticated user id not found in token",
          },
          401
        );
      }

      await photoService.remove(ownerId, photoId);

      return c.json({
        message: "Photo deleted successfully",
      });
    } catch (error) {
      return c.json(
        {
          message: error.message || "Failed to delete photo",
        },
        400
      );
    }
  },
};