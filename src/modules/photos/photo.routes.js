import { Hono } from "hono";
import { authRequired } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/role.js";
import { photoController } from "./photo.controller.js";

const photoRoutes = new Hono();

photoRoutes.use("*", authRequired(), requireRole("OWNER"));

photoRoutes.post("/room-types/:roomTypeId/photos", photoController.upload);
photoRoutes.delete("/photos/:photoId", photoController.remove);

export default photoRoutes;