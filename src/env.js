import 'dotenv/config'

export const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'change-me',
  JWT_EXPIRES_DAYS: Number(process.env.JWT_EXPIRES_DAYS ?? 7),
  JWT_REMEMBER_EXPIRES_DAYS: Number(process.env.JWT_REMEMBER_EXPIRES_DAYS ?? 30),
  /** Base URL untuk URL foto (proxy). Contoh: http://localhost:5173/api */
  API_PUBLIC_URL: process.env.API_PUBLIC_URL || 'http://localhost:8080',
  LEAD_PAYMENT_BANK_NAME: process.env.LEAD_PAYMENT_BANK_NAME || 'BCA',
  LEAD_PAYMENT_ACCOUNT_NUMBER:
    process.env.LEAD_PAYMENT_ACCOUNT_NUMBER || '1234567890',
  LEAD_PAYMENT_ACCOUNT_HOLDER:
    process.env.LEAD_PAYMENT_ACCOUNT_HOLDER || 'PT Kost Solo',
  LEAD_PAYMENT_AMOUNT: process.env.LEAD_PAYMENT_AMOUNT || '50000',
  LEAD_PAYMENT_NOTES:
    process.env.LEAD_PAYMENT_NOTES ||
    'Transfer biaya admin pemesanan. Bukti pembayaran opsional.',
}

for (const key of ['DATABASE_URL', 'JWT_SECRET']) {
  if (!env[key]) {
    throw new Error(`Missing env: ${key}`)
  }
}