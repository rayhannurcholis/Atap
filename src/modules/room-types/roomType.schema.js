import { z } from "zod";

export const createRoomTypeSchema = z.object({
  name: z.string().min(2).max(100),
  price: z.number().int().positive(),
  size: z.string().min(1).max(50),
  facilities: z.array(z.string().min(1)).min(1),
  availableCount: z.number().int().min(0),
});

export const updateRoomTypeSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  price: z.number().int().positive().optional(),
  size: z.string().min(1).max(50).optional(),
  facilities: z.array(z.string().min(1)).min(1).optional(),
  availableCount: z.number().int().min(0).optional(),
});