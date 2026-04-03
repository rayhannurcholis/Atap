import db from "../../db.js";
import { requestOwnerOtp, loginOwner } from "../auth/auth.service.js";

export const whatsappService = {
  async handleWebhookPayload(body) {
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message) return;

    const phone = message.from;
    const text = message.text?.body || "";

    console.log("📩 Incoming WA:", { phone, text });

    await this.handleIncomingMessage(phone, text);
  },

  async handleIncomingMessage(phone, text) {
  const normalized = text.trim().toUpperCase();

  const session = await db.whatsAppOnboardingSession.findUnique({
    where: { phone },
  });

  if (session && session.expiresAt > new Date()) {
    await this.handleOnboardingStep(session, phone, text);
    return;
  }

  if (normalized === "MENU") {
  await this.sendMessage(
    phone,
    "Halo 👋\n\nPerintah:\nDAFTAR - daftar owner\nLOGIN - minta OTP login\nLISTING - lihat listing\nUPDATE HARGA <roomTypeId> <harga>\nUPDATE STOK <roomTypeId> <jumlah>"
  );
  return;
}

  if (normalized === "DAFTAR") {
    await db.whatsAppOnboardingSession.upsert({
      where: { phone },
      update: {
        step: 1,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        lastMessageAt: new Date(),
        name: null,
        kostName: null,
        location: null,
        contact: null,
      },
      create: {
        phone,
        step: 1,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    });

    await this.sendMessage(phone, "Siapa nama Anda?");
    return;
  }

  if (normalized === "LOGIN") {
    const existingOwner = await db.user.findUnique({
      where: { phone },
    });

    if (!existingOwner || existingOwner.role !== "OWNER") {
      await this.sendMessage(
        phone,
        "Nomor ini belum terdaftar sebagai owner. Ketik DAFTAR untuk membuat akun."
      );
      return;
    }

    const result = await requestOwnerOtp({ phone });

    await this.sendMessage(
      phone,
      `OTP login Anda: ${result.data.otpPreview}\nKirim: OTP <kode>`
    );
    return;
  }

  if (normalized.startsWith("OTP ")) {
  const otp = text.trim().split(/\s+/)[1];

  if (!otp) {
    await this.sendMessage(phone, "Format salah. Gunakan: OTP 123456");
    return;
  }

  const result = await loginOwner({ phone, otp });

  if (result?.error) {
    await this.sendMessage(
      phone,
      result.error || "OTP tidak valid atau sudah expired."
    );
    return;
  }

  await this.sendMessage(phone, "Login berhasil ✅");

  console.log("Owner login success:", {
    phone,
    token: result?.data?.token,
  });

  return;
};

if (normalized.startsWith("UPDATE ")) {
  await this.handleUpdateCommand(phone, text);
  return;
};

if (normalized === "UPDATE") {
  await this.sendMessage(
    phone,
    "Gunakan:\nUPDATE NAMAKOST <nama>\nUPDATE LOKASI <alamat>\nUPDATE KONTAK <no>"
  );
  return;
};

if (normalized === "LISTING") {
  await this.handleListingCommand(phone);
  return;
}

if (normalized.startsWith("UPDATE HARGA ")) {
  await this.handleUpdatePrice(phone, text);
  return;
}

if (normalized.startsWith("UPDATE STOK ")) {
  await this.handleUpdateStock(phone, text);
  return;
}


  await this.sendMessage(
    phone,
    "Halo 👋\nKetik MENU untuk melihat perintah."
  );
},

  async handleOnboardingStep(session, phone, text) {
    if (session.step === 1) {
      await db.whatsAppOnboardingSession.update({
        where: { phone },
        data: {
          name: text,
          step: 2,
          lastMessageAt: new Date(),
        },
      });

      await this.sendMessage(phone, "Nama kost Anda?");
      return;
    }

    if (session.step === 2) {
      await db.whatsAppOnboardingSession.update({
        where: { phone },
        data: {
          kostName: text,
          step: 3,
          lastMessageAt: new Date(),
        },
      });

      await this.sendMessage(phone, "Lokasi kost Anda?");
      return;
    }

    if (session.step === 3) {
      await db.whatsAppOnboardingSession.update({
        where: { phone },
        data: {
          location: text,
          step: 4,
          lastMessageAt: new Date(),
        },
      });

      await this.sendMessage(phone, "Nomor kontak kost?");
      return;
    }

    if (session.step === 4) {
      const existingOwner = await db.user.findUnique({
        where: { phone },
      });

      if (existingOwner) {
        await this.sendMessage(
          phone,
          "Nomor ini sudah terdaftar sebagai owner."
        );
        return;
      }

      const updated = await db.whatsAppOnboardingSession.update({
        where: { phone },
        data: {
          contact: text,
          lastMessageAt: new Date(),
        },
      });

      await db.user.create({
  data: {
    name: updated.name,
    phone,
    role: "OWNER",
    isEmailVerified: true,
    ownerProfile: {
      create: {
        kostName: updated.kostName,
        location: updated.location,
        contact: text,
      },
    },
  },
});

await db.whatsAppOnboardingSession.delete({
  where: { phone },
});

await this.sendMessage(
  phone,
  "Pendaftaran selesai ✅\nAkun owner berhasil dibuat.\nKetik LOGIN untuk masuk."
);

return;
    }
  },

  async sendMessage(to, text) {
    console.log("📤 Send WA:", { to, text });
  },

  async handleUpdateCommand(phone, text) {
  const owner = await db.user.findUnique({
    where: { phone },
    include: { ownerProfile: true }
  });

  if (!owner || owner.role !== "OWNER") {
    await this.sendMessage(
      phone,
      "Nomor ini belum terdaftar sebagai owner."
    );
    return;
  }

  if (!owner.ownerProfile) {
    await this.sendMessage(
      phone,
      "Profil owner tidak ditemukan."
    );
    return;
  }

  const parts = text.split(" ");
  const field = parts[1]; // NAMAKOST / LOKASI / KONTAK
  const value = parts.slice(2).join(" ").trim();

  if (!field || !value) {
    await this.sendMessage(
      phone,
      "Format salah.\nGunakan:\nUPDATE NAMAKOST <nama>\nUPDATE LOKASI <alamat>\nUPDATE KONTAK <no>"
    );
    return;
  }

  // mapping field
  let data = {};

  if (field === "NAMAKOST") {
    data.kostName = value;
  } else if (field === "LOKASI") {
    data.location = value;
  } else if (field === "KONTAK") {
    data.contact = value;
  } else {
    await this.sendMessage(
      phone,
      "Field tidak dikenali.\nGunakan: NAMAKOST / LOKASI / KONTAK"
    );
    return;
  }

  await db.ownerProfile.update({
    where: { userId: owner.id },
    data,
  });

  await this.sendMessage(
    phone,
    `Berhasil update ${field} ✅`
  );
},

async handleListingCommand(phone) {
  const owner = await db.user.findUnique({
    where: { phone },
    include: {
      listings: {
        include: {
          roomTypes: true,
        },
      },
    },
  });

  if (!owner || owner.role !== "OWNER") {
    await this.sendMessage(phone, "Owner tidak ditemukan.");
    return;
  }

  if (!owner.listings || owner.listings.length === 0) {
    await this.sendMessage(phone, "Anda belum punya listing.");
    return;
  }

  let message = "Daftar listing Anda:\n";

  owner.listings.forEach((listing, index) => {
    message += `\n${index + 1}. ${listing.name}\n`;

    if (!listing.roomTypes || listing.roomTypes.length === 0) {
      message += "- Belum ada room type\n";
      return;
    }

    listing.roomTypes.forEach((room) => {
      message += `- ${room.id} | ${room.name} | Rp${room.price} | stok ${room.availableCount}\n`;
    });
  });

  await this.sendMessage(phone, message.trim());
},

async handleUpdatePrice(phone, text) {
  const parts = text.trim().split(/\s+/);

  const roomTypeId = parts[2];
  const price = Number(parts[3]);

  if (!roomTypeId || Number.isNaN(price)) {
    await this.sendMessage(
      phone,
      "Format salah.\nGunakan: UPDATE HARGA <roomTypeId> <harga>"
    );
    return;
  }

  const owner = await db.user.findUnique({
    where: { phone },
    include: {
      listings: {
        include: { roomTypes: true },
      },
    },
  });

  if (!owner || owner.role !== "OWNER") {
    await this.sendMessage(phone, "Owner tidak ditemukan.");
    return;
  }

  const ownedRoom = owner.listings
    .flatMap((listing) => listing.roomTypes || [])
    .find((room) => room.id === roomTypeId);

  if (!ownedRoom) {
    await this.sendMessage(phone, "Room type tidak ditemukan atau bukan milik Anda.");
    return;
  }

  await db.roomType.update({
    where: { id: roomTypeId },
    data: { price },
  });

  await this.sendMessage(phone, `Harga room ${roomTypeId} berhasil diupdate ✅`);
},

async handleUpdateStock(phone, text) {
  const parts = text.trim().split(/\s+/);

  const roomTypeId = parts[2];
  const stock = Number(parts[3]);

  if (!roomTypeId || Number.isNaN(stock) || stock < 0) {
    await this.sendMessage(
      phone,
      "Format salah.\nGunakan: UPDATE STOK <roomTypeId> <jumlah>"
    );
    return;
  }

  const owner = await db.user.findUnique({
    where: { phone },
    include: {
      listings: {
        include: { roomTypes: true },
      },
    },
  });

  if (!owner || owner.role !== "OWNER") {
    await this.sendMessage(phone, "Owner tidak ditemukan.");
    return;
  }

  const ownedRoom = owner.listings
    .flatMap((listing) => listing.roomTypes || [])
    .find((room) => room.id === roomTypeId);

  if (!ownedRoom) {
    await this.sendMessage(phone, "Room type tidak ditemukan atau bukan milik Anda.");
    return;
  }

  await db.roomType.update({
    where: { id: roomTypeId },
    data: { availableCount: stock },
  });

  await this.sendMessage(phone, `Stok room ${roomTypeId} berhasil diupdate ✅`);
}
};