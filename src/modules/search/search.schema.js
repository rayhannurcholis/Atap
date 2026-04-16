import { z } from 'zod'

export const searchListingQuerySchema = z
  .object({
    q: z.string().trim().optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    genderType: z.enum(['PUTRA', 'PUTRI', 'CAMPUR']).optional(),
    sort: z
      .enum(['relevance', 'lowest_price', 'highest_price', 'newest'])
      .default('relevance'),

    // bisa dikirim "WiFi,AC" atau array
    facilities: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .transform((val) => {
        if (!val) return []
        if (Array.isArray(val)) {
          return val.map((item) => item.trim()).filter(Boolean)
        }
        return val
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      }),

    // preset area
    area: z.enum(['Kentingan', 'Gonilan', 'Pabelan', 'Jajar', 'Manahan']).optional(),

    // alternatif pakai titik koordinat langsung
    lat: z.coerce.number().optional(),
    lng: z.coerce.number().optional(),
    radiusKm: z.coerce.number().positive().default(2)
  })
  .refine(
    (data) => {
      if (data.minPrice !== undefined && data.maxPrice !== undefined) {
        return data.minPrice <= data.maxPrice
      }
      return true
    },
    {
      message: 'minPrice tidak boleh lebih besar dari maxPrice',
      path: ['minPrice']
    }
  )