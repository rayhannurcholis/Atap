import { z } from "zod";

export const searchListingQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  genderType: z.enum(["PUTRA", "PUTRI", "CAMPUR"]).optional(),
  sort: z.enum(["relevance", "lowest_price", "highest_price", "newest"]).optional(),
});

















