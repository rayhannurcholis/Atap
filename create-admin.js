import db from './src/db.js'
import bcrypt from 'bcryptjs'

async function main() {
  const email = 'admin@kostsolo.id'

  // cek kalau sudah ada
  const existing = await db.user.findUnique({
    where: { email }
  })

  if (existing) {
    console.log('Admin already exists')
    return
  }

  const password = 'Admin12345'
  const passwordHash = await bcrypt.hash(password, 10)

  const admin = await db.user.create({
    data: {
      name: 'Admin',
      email,
      passwordHash,
      role: 'ADMIN',
      isEmailVerified: true
    }
  })

  console.log('✅ Admin created:')
  console.log({
    email,
    password // hanya untuk dev
  })
}

main()
  .catch(console.error)
  .finally(() => process.exit())