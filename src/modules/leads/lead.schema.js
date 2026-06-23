import { z } from 'zod'

export const createGuestLeadSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional()
})

export const lookupRequestOtpSchema = z.object({
  phone: z.string().min(8)
})

export const lookupVerifyOtpSchema = z.object({
  phone: z.string().min(8),
  otp: z.string().min(4)
})
