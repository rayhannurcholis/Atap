import db from '../src/db.js'
import { hashPassword } from '../src/utils/crypto.js'

const email = process.env.ADMIN_EMAIL || 'admin@kostsolo.id'
const password = process.env.ADMIN_PASSWORD || 'Admin12345'

const passwordHash = await hashPassword(password)

const admin = await db.user.update({
  where: { email },
  data: {
    passwordHash,
    role: 'ADMIN',
    isEmailVerified: true
  }
})

console.log(`Password reset for ${admin.email}`)

await db.$disconnect()
