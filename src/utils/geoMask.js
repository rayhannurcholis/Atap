import crypto from 'crypto'

/**
 * Masking lokasi untuk konsumsi PUBLIK — "random offset + fixed-radius circle".
 *
 * Titik asli TIDAK pernah dikirim ke client. Sebagai gantinya:
 *  - Ambil bearing acak (0..2π) dan jarak acak (0..radius) — pakai sqrt agar
 *    distribusi seragam di seluruh area lingkaran (tidak menumpuk di tengah).
 *  - Geser titik asli dengan vektor itu untuk mendapat "center" tampilan.
 *  - Titik asli berada di suatu tempat di dalam lingkaran, bukan di tengahnya.
 *
 * Keacakan di-seed dari listing id (SHA-256) agar offset KONSISTEN setiap load.
 * Kalau offset regenerate tiap load, penyerang bisa load berkali-kali lalu
 * merata-ratakan center untuk konvergen ke titik asli. Seed stabil mencegahnya.
 */
const RADIUS_M = 150
const EARTH_R = 6371000

export function fuzzLocation(lat, lng, seed = '') {
  const la = Number(lat)
  const ln = Number(lng)
  if (!Number.isFinite(la) || !Number.isFinite(ln)) return null

  const hash = crypto.createHash('sha256').update(String(seed)).digest()
  const r1 = hash.readUInt32BE(0) / 0xffffffff // 0..1
  const r2 = hash.readUInt32BE(4) / 0xffffffff // 0..1

  const bearing = r1 * 2 * Math.PI
  // sqrt → distribusi seragam pada luas lingkaran, bukan menumpuk di tengah.
  const distance = Math.sqrt(r2) * RADIUS_M

  const dLat = (distance * Math.cos(bearing)) / EARTH_R
  const dLng =
    (distance * Math.sin(bearing)) / (EARTH_R * Math.cos((la * Math.PI) / 180))

  return {
    centerLat: la + dLat * (180 / Math.PI),
    centerLng: ln + dLng * (180 / Math.PI),
    radiusM: RADIUS_M
  }
}
