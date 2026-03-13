import { ZodError } from 'zod'
import {
  userRegisterSchema,
  verifyEmailSchema,
  resendOtpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  ownerLoginSchema
} from './auth.validator.js'
import {
  registerUser,
  verifyUserEmail,
  resendUserOtp,
  loginUser,
  forgotUserPassword,
  resetUserPassword,
  loginOwner,
  loginAdmin
} from './auth.service.js'

function handleZodError(c, error) {
  return c.json(
    {
      error: 'Validation error',
      details: error.flatten()
    },
    400
  )
}

function handleServiceResult(c, result) {
  if (result?.error) {
    return c.json({ error: result.error }, result.status || 400)
  }

  return c.json(result.data, result.status || 200)
}

export async function registerUserController(c) {
  try {
    const body = await c.req.json()
    const data = userRegisterSchema.parse(body)
    const result = await registerUser(data)
    return handleServiceResult(c, result)
  } catch (error) {
    if (error instanceof ZodError) return handleZodError(c, error)

    console.error('REGISTER ERROR:', error)

    return c.json(
      {
        error: 'Failed to register user',
        detail: error?.message || String(error)
      },
      500
    )
  }
}

export async function verifyUserEmailController(c) {
  try {
    const body = await c.req.json()
    const data = verifyEmailSchema.parse(body)
    const result = await verifyUserEmail(data)
    return handleServiceResult(c, result)
  } catch (error) {
    if (error instanceof ZodError) return handleZodError(c, error)
    console.error(error)
    return c.json({ error: 'Failed to verify email' }, 500)
  }
}

export async function resendUserOtpController(c) {
  try {
    const body = await c.req.json()
    const data = resendOtpSchema.parse(body)
    const result = await resendUserOtp(data)
    return handleServiceResult(c, result)
  } catch (error) {
    if (error instanceof ZodError) return handleZodError(c, error)
    console.error(error)
    return c.json({ error: 'Failed to resend OTP' }, 500)
  }
}

export async function loginUserController(c) {
  try {
    const body = await c.req.json()
    const data = loginSchema.parse(body)
    const result = await loginUser(data)
    return handleServiceResult(c, result)
  } catch (error) {
    if (error instanceof ZodError) return handleZodError(c, error)
    console.error(error)
    return c.json({ error: 'Failed to login user' }, 500)
  }
}

export async function forgotUserPasswordController(c) {
  try {
    const body = await c.req.json()
    const data = forgotPasswordSchema.parse(body)
    const result = await forgotUserPassword(data)
    return handleServiceResult(c, result)
  } catch (error) {
    if (error instanceof ZodError) return handleZodError(c, error)
    console.error(error)
    return c.json({ error: 'Failed to process forgot password' }, 500)
  }
}

export async function resetUserPasswordController(c) {
  try {
    const body = await c.req.json()
    const data = resetPasswordSchema.parse(body)
    const result = await resetUserPassword(data)
    return handleServiceResult(c, result)
  } catch (error) {
    if (error instanceof ZodError) return handleZodError(c, error)
    console.error(error)
    return c.json({ error: 'Failed to reset password' }, 500)
  }
}

export async function loginOwnerController(c) {
  try {
    const body = await c.req.json()
    const data = ownerLoginSchema.parse(body)
    const result = await loginOwner(data)
    return handleServiceResult(c, result)
  } catch (error) {
    if (error instanceof ZodError) return handleZodError(c, error)
    console.error(error)
    return c.json({ error: 'Failed to login owner' }, 500)
  }
}

export async function loginAdminController(c) {
  try {
    const body = await c.req.json()
    const data = loginSchema.parse(body)

    const meta = {
      ip: c.req.header('x-forwarded-for') || null,
      userAgent: c.req.header('user-agent') || null
    }

    const result = await loginAdmin(data, meta)
    return handleServiceResult(c, result)
  } catch (error) {
    if (error instanceof ZodError) return handleZodError(c, error)
    console.error(error)
    return c.json({ error: 'Failed to login admin' }, 500)
  }
}