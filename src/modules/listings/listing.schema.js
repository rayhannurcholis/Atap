import { z } from "zod";

export const createListingSchema = z.object({
  name: z.string().min(3).max(150),
  address: z.string().min(10),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  genderType: z.enum(["PUTRA", "PUTRI", "CAMPUR"]),
  description: z.string().min(20),
  rules: z.array(z.string().min(1)).min(1),
  contactNumber: z.string().min(8).max(20),
});

export const updateListingSchema = z.object({
  name: z.string().min(3).max(150).optional(),
  address: z.string().min(10).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  genderType: z.enum(["PUTRA", "PUTRI", "CAMPUR"]).optional(),
  description: z.string().min(20).optional(),
  rules: z.array(z.string().min(1)).min(1).optional(),
  contactNumber: z.string().min(8).max(20).optional(),
});