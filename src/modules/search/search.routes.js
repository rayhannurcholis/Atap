import { Hono } from "hono";
import { searchController } from "./search.controller.js";

const searchRoutes = new Hono();

searchRoutes.get("/listings/search", searchController.search);

export default searchRoutes;