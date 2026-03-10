import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

export function generateResetToken() {
  return randomBytes(32).toString('hex')
}

export async function hashToken(token) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(token, salt)
}

export function verifyToken(token, hash) {
  return bcrypt.compare(token, hash)
}