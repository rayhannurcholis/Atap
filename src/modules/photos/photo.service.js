import db from "../../db.js";
import { deleteFromR2, uploadBufferToR2 } from "../../utils/r2.js";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_PHOTOS_PER_ROOM_TYPE = 8;

function sanitizeFileName(name = "file") {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export const photoService = {
  async upload(ownerId, roomTypeId, files) {
    const roomType = await db.roomType.findFirst({
      where: {
        id: roomTypeId,
        listing: {
          ownerId,
        },
      },
      include: {
        photos: true,
      },
    });

    if (!roomType) {
      throw new Error("Room type not found");
    }

    if (!files || files.length === 0) {
      throw new Error("At least one photo is required");
    }

    const existingCount = roomType.photos.length;
    if (existingCount + files.length > MAX_PHOTOS_PER_ROOM_TYPE) {
      throw new Error("Maximum 8 photos per room type");
    }

    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        throw new Error("Only JPG, PNG, and WEBP files are allowed");
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new Error("Each photo must be at most 5MB");
      }
    }

    const uploadedFiles = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const key = `room-types/${roomTypeId}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
        const url = await uploadBufferToR2({
          key,
          buffer,
          contentType: file.type,
        });

        uploadedFiles.push({
          roomTypeId,
          key,
          url,
          mimeType: file.type,
          sizeBytes: file.size,
          sortOrder: existingCount + i,
        });
      }

      const created = await db.$transaction(async (tx) => {
        const results = [];
        for (const item of uploadedFiles) {
          const photo = await tx.roomPhoto.create({
            data: item,
          });
          results.push(photo);
        }
        return results;
      });

      return created;
    } catch (error) {
      for (const item of uploadedFiles) {
        try {
          await deleteFromR2(item.key);
        } catch (_) {}
      }
      throw error;
    }
  },

  async remove(ownerId, photoId) {
    const photo = await db.roomPhoto.findFirst({
      where: {
        id: photoId,
        roomType: {
          listing: {
            ownerId,
          },
        },
      },
    });

    if (!photo) {
      throw new Error("Photo not found");
    }

    await deleteFromR2(photo.key);

    await db.roomPhoto.delete({
      where: {
        id: photoId,
      },
    });

    return true;
  },
};