export function menuReply() {
  return [
    '🏠 *KostSolo Bot*',
    '',
    'Halo! Saya bantu Anda mengelola kost lewat WhatsApp.',
    '',
    '━━━━━━━━━━━━━━━',
    '📌 *PERINTAH UTAMA*',
    '━━━━━━━━━━━━━━━',
    '',
    '📝 *DAFTAR*',
    'Daftar sebagai owner',
    '',
    '🔐 *LOGIN*',
    'Minta OTP login',
    '',
    '🏘️ *LISTING*',
    'Lihat kost & kamar',
    '',
    '━━━━━━━━━━━━━━━',
    '⚙️ *UPDATE DATA*',
    '━━━━━━━━━━━━━━━',
    '',
    '💰 *UPDATE HARGA*',
    'Contoh:',
    'UPDATE HARGA 1 1 750000',
    '',
    '📦 *UPDATE STOK*',
    'Contoh:',
    'UPDATE STOK 1 1 3',
    '',
    '━━━━━━━━━━━━━━━',
    '💡 *TIPS*',
    '━━━━━━━━━━━━━━━',
    '',
    '• Ketik *LISTING* dulu sebelum update',
    '• Gunakan angka sesuai nomor listing & kamar',
  ].join('\n')
}

export function defaultReply() {
  return "Halo 👋\nKetik MENU untuk melihat perintah.";
}

export function askNameReply() {
  return "Siapa nama Anda?";
}

export function askKostNameReply() {
  return "Nama kost Anda?";
}

export function askLocationReply() {
  return "Lokasi kost Anda?";
}

export function askContactReply() {
  return "Nomor kontak kost?";
}

export function ownerRegisteredReply() {
  return "Pendaftaran selesai ✅\nAkun owner berhasil dibuat.\nKetik LOGIN untuk masuk.";
}

export function ownerAlreadyExistsReply() {
  return "Nomor ini sudah terdaftar sebagai owner.";
}

export function ownerNotRegisteredReply() {
  return "Nomor ini belum terdaftar sebagai owner. Ketik DAFTAR untuk membuat akun.";
}

export function ownerNotFoundReply() {
  return "Owner tidak ditemukan.";
}

export function ownerProfileNotFoundReply() {
  return "Profil owner tidak ditemukan.";
}

export function otpFormatReply() {
  return "Format salah. Gunakan: OTP 123456";
}

export function otpSuccessReply() {
  return "Login berhasil ✅";
}

export function updateProfileHelpReply() {
  return "Gunakan:\nUPDATE NAMAKOST <nama>\nUPDATE LOKASI <alamat>\nUPDATE KONTAK <no>";
}

export function updateProfileUnknownFieldReply() {
  return "Field tidak dikenali.\nGunakan: NAMAKOST / LOKASI / KONTAK";
}

export function updateProfileSuccessReply(field) {
  return `Berhasil update ${field} ✅`;
}

export function emptyListingReply() {
  return "Anda belum punya listing.";
}

export function indexedPriceFormatReply() {
  return "Format salah.\nGunakan: UPDATE HARGA <noListing> <noRoom> <harga>";
}

export function indexedStockFormatReply() {
  return "Format salah.\nGunakan: UPDATE STOK <noListing> <noRoom> <jumlah>";
}

export function listingSessionNotFoundReply() {
  return "Session listing tidak ditemukan. Ketik LISTING dulu ya 👍";
}

export function invalidListingNumberReply() {
  return "Nomor listing tidak valid. Ketik LISTING dulu ya 👍";
}

export function invalidRoomNumberReply() {
  return "Nomor room tidak valid. Ketik LISTING dulu ya 👍";
}

export function updatePriceSuccessReply(roomName, price) {
  return `Harga ${roomName} berhasil diupdate jadi Rp${price} ✅`;
}

export function updateStockSuccessReply(roomName, stock) {
  return `Stok ${roomName} berhasil diupdate jadi ${stock} ✅`;
}

export function otpReply(otp) {
  return `OTP login Anda: ${otp}\nKirim: OTP <kode>`;
}

export function listingReply(listingRefs) {
  const lines = ["Daftar listing Anda:", ""];

  listingRefs.forEach((listing) => {
    lines.push(`${listing.index}. ${listing.name}`);

    if (!listing.rooms.length) {
      lines.push("   - Belum ada room type");
      return;
    }

    listing.rooms.forEach((room) => {
      lines.push(
        `   ${room.index}. ${room.name} - Rp${room.price} - stok ${room.availableCount}`
      );
    });

    lines.push("");
  });

  return lines.join("\n").trim();
}