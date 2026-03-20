import { Hono } from "hono";
import { authRequired } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/role.js";
import { adminListingController } from "./adminListing.controller.js";

const adminListingRoutes = new Hono();

adminListingRoutes.get(
  "/admin/listings/pending",
  authRequired(),
  requireRole("ADMIN"),
  adminListingController.getPending
);

adminListingRoutes.patch(
  "/admin/listings/:id/approve",
  authRequired(),
  requireRole("ADMIN"),
  adminListingController.approve
);

adminListingRoutes.patch(
  "/admin/listings/:id/reject",
  authRequired(),
  requireRole("ADMIN"),
  adminListingController.reject
);

adminListingRoutes.patch(
  "/admin/listings/:id/premium",
  authRequired(),
  requireRole("ADMIN"),
  adminListingController.setPremium
);

export default adminListingRoutes;