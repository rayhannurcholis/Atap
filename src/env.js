import 'dotenv/config'

export const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'change-me',
  JWT_EXPIRES_DAYS: Number(process.env.JWT_EXPIRES_DAYS ?? 7),
  JWT_REMEMBER_EXPIRES_DAYS: Number(process.env.JWT_REMEMBER_EXPIRES_DAYS ?? 30),
}

for (const key of ['DATABASE_URL', 'JWT_SECRET']) {
  if (!env[key]) {
    throw new Error(`Missing env: ${key}`)
  }
}