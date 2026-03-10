import { z } from 'zod'

export const userRegisterSchema = z.object({
  name: z.string().min(2, 'Name minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter')
})

export const verifyEmailSchema = z.object({
  email: z.string().email('Email tidak valid'),
  otp: z.string().length(6, 'OTP harus 6 digit')
})

export const resendOtpSchema = z.object({
  email: z.string().email('Email tidak valid')
})

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  rememberMe: z.boolean().optional()
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email tidak valid')
})

export const resetPasswordSchema = z.object({
  email: z.string().email('Email tidak valid'),
  token: z.string().min(10, 'Token tidak valid'),
  newPassword: z.string().min(6, 'Password minimal 6 karakter')
})

export const ownerLoginSchema = z.object({
  phone: z.string().min(8, 'Nomor telepon tidak valid'),
  otp: z.string().length(6, 'OTP harus 6 digit')
})