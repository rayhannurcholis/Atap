import jwt from 'jsonwebtoken'
import db from '../../db.js'
import { env } from '../../env.js'
import { hashPassword, verifyPassword } from '../../utils/crypto.js'
import { generateOtp, hashOtp, verifyOtp } from '../../utils/otp.js'
import { generateResetToken, hashToken, verifyToken } from '../../utils/token.js'

function signToken(user, expiresInDays) {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
      email: user.email
    },
    env.JWT_SECRET,
    { expiresIn: `${expiresInDays}d` }
  )
}

export async function registerUser(data) {
  const existingEmail = await db.user.findUnique({
    where: { email: data.email }
  })

  if (existingEmail) {
    return { error: 'Email already used', status: 409 }
  }

  const user = await db.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: await hashPassword(data.password),
      role: 'USER',
      isEmailVerified: false
    }
  })

  const otp = generateOtp()
  const codeHash = await hashOtp(otp)

  await db.emailOtp.create({
    data: {
      email: data.email,
      codeHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    }
  })

  console.log(`[EMAIL OTP] ${data.email} -> ${otp}`)

  return {
    status: 201,
    data: {
      message: 'Registration success. Please verify your email OTP.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    }
  }
}

export async function verifyUserEmail(data) {
  const user = await db.user.findUnique({
    where: { email: data.email }
  })

  if (!user || user.role !== 'USER') {
    return { error: 'User not found', status: 404 }
  }

  const latestOtp = await db.emailOtp.findFirst({
    where: {
      email: data.email,
      usedAt: null
    },
    orderBy: { createdAt: 'desc' }
  })

  if (!latestOtp) {
    return { error: 'OTP not found', status: 404 }
  }

  if (latestOtp.expiresAt < new Date()) {
    return { error: 'OTP expired', status: 400 }
  }

  const validOtp = await verifyOtp(data.otp, latestOtp.codeHash)

  if (!validOtp) {
    return { error: 'Invalid OTP', status: 400 }
  }

  await db.$transaction([
    db.user.update({
      where: { email: data.email },
      data: { isEmailVerified: true }
    }),
    db.emailOtp.update({
      where: { id: latestOtp.id },
      data: { usedAt: new Date() }
    })
  ])

  return {
    data: {
      message: 'Email verified successfully'
    }
  }
}

export async function resendUserOtp(data) {
  const user = await db.user.findUnique({
    where: { email: data.email }
  })

  if (!user || user.role !== 'USER') {
    return { error: 'User not found', status: 404 }
  }

  if (user.isEmailVerified) {
    return { error: 'Email already verified', status: 400 }
  }

  const otp = generateOtp()
  const codeHash = await hashOtp(otp)

  await db.emailOtp.create({
    data: {
      email: data.email,
      codeHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    }
  })

  console.log(`[RESEND EMAIL OTP] ${data.email} -> ${otp}`)

  return {
    data: {
      message: 'OTP resent successfully'
    }
  }
}

export async function loginUser(data) {
  const user = await db.user.findUnique({
    where: { email: data.email }
  })

  if (!user || user.role !== 'USER') {
    return { error: 'Invalid credentials', status: 401 }
  }

  if (!user.passwordHash) {
    return { error: 'Password not set', status: 400 }
  }

  const valid = await verifyPassword(data.password, user.passwordHash)

  if (!valid) {
    return { error: 'Invalid credentials', status: 401 }
  }

  if (!user.isEmailVerified) {
    return { error: 'Email not verified', status: 403 }
  }

  const expiresInDays = data.rememberMe
    ? env.JWT_REMEMBER_EXPIRES_DAYS
    : env.JWT_EXPIRES_DAYS

  const token = signToken(user, expiresInDays)

  return {
    data: {
      message: 'User login success',
      token,
      expiresInDays,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }
  }
}

export async function forgotUserPassword(data) {
  const user = await db.user.findUnique({
    where: { email: data.email }
  })

  if (!user || user.role !== 'USER') {
    return {
      data: {
        message: 'If the email is registered, a reset link has been sent.'
      }
    }
  }

  const rawToken = generateResetToken()
  const tokenHash = await hashToken(rawToken)

  await db.passwordResetToken.create({
    data: {
      email: data.email,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000)
    }
  })

  console.log(`[PASSWORD RESET] ${data.email} -> ${rawToken}`)

  return {
    data: {
      message: 'If the email is registered, a reset link has been sent.'
    }
  }
}

export async function resetUserPassword(data) {
  const user = await db.user.findUnique({
    where: { email: data.email }
  })

  if (!user || user.role !== 'USER') {
    return { error: 'User not found', status: 404 }
  }

  const latestToken = await db.passwordResetToken.findFirst({
    where: {
      email: data.email,
      usedAt: null
    },
    orderBy: { createdAt: 'desc' }
  })

  if (!latestToken) {
    return { error: 'Reset token not found', status: 404 }
  }

  if (latestToken.expiresAt < new Date()) {
    return { error: 'Reset token expired', status: 400 }
  }

  const validToken = await verifyToken(data.token, latestToken.tokenHash)

  if (!validToken) {
    return { error: 'Invalid reset token', status: 400 }
  }

  await db.$transaction([
    db.user.update({
      where: { email: data.email },
      data: {
        passwordHash: await hashPassword(data.newPassword)
      }
    }),
    db.passwordResetToken.update({
      where: { id: latestToken.id },
      data: { usedAt: new Date() }
    })
  ])

  console.log(`[PASSWORD RESET CONFIRMED] ${data.email}`)

  return {
    data: {
      message: 'Password reset successful'
    }
  }
}

export async function loginOwner(data) {
  const owner = await db.user.findUnique({
    where: { phone: data.phone },
    include: {
      ownerProfile: true,
      listings: true
    }
  })

  if (!owner || owner.role !== 'OWNER') {
    return { error: 'Owner not found', status: 404 }
  }

  const latestOtp = await db.emailOtp.findFirst({
    where: {
      email: owner.email ?? '',
      usedAt: null
    },
    orderBy: { createdAt: 'desc' }
  })

  if (!latestOtp) {
    return { error: 'OTP not found', status: 404 }
  }

  if (latestOtp.expiresAt < new Date()) {
    return { error: 'OTP expired', status: 400 }
  }

  const validOtp = await verifyOtp(data.otp, latestOtp.codeHash)

  if (!validOtp) {
    return { error: 'Invalid OTP', status: 400 }
  }

  await db.emailOtp.update({
    where: { id: latestOtp.id },
    data: { usedAt: new Date() }
  })

  const token = signToken(owner, 1)

  return {
    data: {
      message: 'Owner login success',
      token,
      expiresInDays: 1,
      user: {
        id: owner.id,
        name: owner.name,
        email: owner.email,
        phone: owner.phone,
        role: owner.role
      },
      ownerProfile: owner.ownerProfile,
      listings: owner.listings
    }
  }
}

export async function loginAdmin(data, meta) {
  const admin = await db.user.findUnique({
    where: { email: data.email }
  })

  if (!admin || admin.role !== 'ADMIN') {
    return { error: 'Invalid credentials', status: 401 }
  }

  if (!admin.passwordHash) {
    return { error: 'Password not set', status: 400 }
  }

  const valid = await verifyPassword(data.password, admin.passwordHash)

  if (!valid) {
    return { error: 'Invalid credentials', status: 401 }
  }

  const token = signToken(admin, 1)

  await db.adminSessionLog.create({
    data: {
      adminId: admin.id,
      ip: meta.ip,
      userAgent: meta.userAgent
    }
  })

  return {
    data: {
      message: 'Admin login success',
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    }
  }
}