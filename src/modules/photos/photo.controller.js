import { photoService } from "./photo.service.js";

function isUploadFile(value) {
  return (
    value &&
    typeof value === "object" &&
    typeof value.arrayBuffer === "function"
  );
}

/** Ambil semua file dari field photos / photos[] / photos[0] dll. */
function extractUploadFiles(body) {
  const files = [];

  for (const [key, value] of Object.entries(body)) {
    const isPhotoField =
      key === "photos" || key === "photos[]" || /^photos(\[\d*\])?$/.test(key);

    if (!isPhotoField) continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        if (isUploadFile(item)) files.push(item);
      }
    } else if (isUploadFile(value)) {
      files.push(value);
    }
  }

  return files;
}

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
      const files = extractUploadFiles(body);

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