import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { roomTypeController } from "./roomType.controller.js";
import { createRoomTypeSchema, updateRoomTypeSchema } from "./roomType.schema.js";
import { authRequired } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/role.js";

const roomTypeRoutes = new Hono();

roomTypeRoutes.post(
  "/listings/:id/room-types",
  authRequired(),
  requireRole("OWNER"),
  zValidator("json", createRoomTypeSchema),
  roomTypeController.create
);

roomTypeRoutes.patch(
  "/room-types/:roomTypeId",
  authRequired(),
  requireRole("OWNER"),
  zValidator("json", updateRoomTypeSchema),
  roomTypeController.update
);

roomTypeRoutes.delete(
  "/room-types/:roomTypeId",
  authRequired(),
  requireRole("OWNER"),
  roomTypeController.remove
);

export default roomTypeRoutes;