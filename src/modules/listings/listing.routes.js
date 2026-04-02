import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { listingController } from "./listing.controller.js";
import { searchController } from "../search/search.controller.js";
import { createListingSchema, updateListingSchema } from "./listing.schema.js";
import { authRequired } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/role.js";


const listingsRoutes = new Hono();

// owner listing
listingsRoutes.post(
  "/owner",
  authRequired(),
  requireRole("OWNER"),
  zValidator("json", createListingSchema),
  listingController.create
);

listingsRoutes.get(
  "/owner",
  authRequired(),
  requireRole("OWNER"),
  listingController.getOwnerListings
);

listingsRoutes.get(
  "/owner/:id",
  authRequired(),
  requireRole("OWNER"),
  listingController.getOwnerListingById
);

listingsRoutes.patch(
  "/owner/:id",
  authRequired(),
  requireRole("OWNER"),
  zValidator("json", updateListingSchema),
  listingController.update
);

listingsRoutes.patch(
  "/owner/:id/deactivate",
  authRequired(),
  requireRole("OWNER"),
  listingController.deactivate
);

// public
listingsRoutes.get("/search", searchController.search);
listingsRoutes.get("/", listingController.getPublicListings);
listingsRoutes.get("/:id", listingController.getPublicListingById);

export default listingsRoutes;