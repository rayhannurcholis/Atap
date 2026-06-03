import 'dotenv/config'

export const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'change-me',
  JWT_EXPIRES_DAYS: Number(process.env.JWT_EXPIRES_DAYS ?? 7),
  JWT_REMEMBER_EXPIRES_DAYS: Number(process.env.JWT_REMEMBER_EXPIRES_DAYS ?? 30),
  /** Base URL untuk URL foto (proxy). Contoh: http://localhost:5173/api */
  API_PUBLIC_URL: process.env.API_PUBLIC_URL || 'http://localhost:8080',
}

for (const key of ['DATABASE_URL', 'JWT_SECRET']) {
  if (!env[key]) {
    throw new Error(`Missing env: ${key}`)
  }
}