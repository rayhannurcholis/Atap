import db from './db.js'
import { hashPassword } from './utils/crypto.js'

const run = async () => {
  try {
    const existing = await db.user.findUnique({
      where: { email: 'admin@kostsolo.id' }
    })

    if (existing) {
      console.log('Admin already exists')
      process.exit(0)
    }

    const passwordHash = await hashPassword('Admin12345')

    await db.user.create({
      data: {
        name: 'Super Admin',
        email: 'admin@kostsolo.id',
        passwordHash,
        role: 'ADMIN',
        isEmailVerified: true
      }
    })

    console.log('Admin created')
    process.exit(0)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

run()