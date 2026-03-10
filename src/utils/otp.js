import bcrypt from 'bcryptjs'

export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function hashOtp(code) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(code, salt)
}

export function verifyOtp(code, hash) {
  return bcrypt.compare(code, hash)
}