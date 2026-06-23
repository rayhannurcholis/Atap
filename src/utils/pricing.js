/**
 * Markup harga untuk tampilan PUBLIK (user).
 *
 * Harga yang disimpan owner adalah harga asli. Untuk user, harga ditampilkan
 * lebih tinggi sebesar markup (default Rp50.000) — selisih ini menjadi bagian admin.
 * Endpoint owner/admin TIDAK memakai markup ini.
 */
export const USER_PRICE_MARKUP = Number(process.env.PRICE_MARKUP || 50000)

/** Tambahkan markup ke satu nilai harga. Mengembalikan number, atau null bila tidak valid. */
export function applyPriceMarkup(price) {
  if (price === null || price === undefined) return price
  const n = Number(price)
  if (!Number.isFinite(n)) return price
  return n + USER_PRICE_MARKUP
}
