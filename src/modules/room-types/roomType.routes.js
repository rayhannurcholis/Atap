import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { roomTypeController } from "./roomType.controller.js";
import { createRoomTypeSchema, updateRoomTypeSchema } from "./roomType.schema.js";
import { authMiddleware } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/role.js";

const roomTypeRoutes = new Hono();

roomTypeRoutes.post(
  "/owner/listings/:id/room-types",
  authMiddleware,
  requireRole("OWNER"),
  zValidator("json", createRoomTypeSchema),
  roomTypeController.create
);

roomTypeRoutes.patch(
  "/owner/room-types/:roomTypeId",
  authMiddleware,
  requireRole("OWNER"),
  zValidator("json", updateRoomTypeSchema),
  roomTypeController.update
);

roomTypeRoutes.delete(
  "/owner/room-types/:roomTypeId",
  authMiddleware,
  requireRole("OWNER"),
  roomTypeController.remove
);

export default roomTypeRoutes;