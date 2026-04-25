import db from "../../db.js";
import { requestOwnerOtp, loginOwner } from "../auth/auth.service.js";
import {
  parseIncomingMessage,
  normalizeText,
  parseOtpCommand,
  parseUpdateProfileCommand,
  parseIndexedUpdateCommand,
} from "./whatsapp.parser.js";
import {
  menuReply,
  defaultReply,
  askNameReply,
  askKostNameReply,
  askLocationReply,
  askContactReply,
  ownerRegisteredReply,
  ownerAlreadyExistsReply,
  ownerNotRegisteredReply,
  ownerNotFoundReply,
  ownerProfileNotFoundReply,
  otpFormatReply,
  otpSuccessReply,
  updateProfileHelpReply,
  updateProfileUnknownFieldReply,
  updateProfileSuccessReply,
  emptyListingReply,
  indexedPriceFormatReply,
  indexedStockFormatReply,
  listingSessionNotFoundReply,
  invalidListingNumberReply,
  invalidRoomNumberReply,
  updatePriceSuccessReply,
  updateStockSuccessReply,
  listingReply,
} from "./whatsapp.reply.js";

const waSessionMap = new Map();
const greetedMap = new Map();

const ONBOARDING_TTL_MS = 30 * 60 * 1000;
const LISTING_SESSION_TTL_MS = 30 * 60 * 1000;

function isTooShort(value, min = 3) {
  return !value || value.trim().length < min;
}

function normalizePhone(value) {
  return (value || "").replace(/\D/g, "");
}

function confirmOwnerRegistrationReply(data) {
  return [
    "Konfirmasi data pendaftaran:",
    "",
    `Nama: ${data.name}`,
    `Nama Kost: ${data.kostName}`,
    `Lokasi: ${data.location}`,
    `Kontak: ${data.contact}`,
    "",
    "Balas YA untuk menyimpan.",
    "Balas TIDAK untuk membatalkan.",
  ].join("\n");
}

function registrationCancelledReply() {
  return "Pendaftaran dibatalkan. Ketik DAFTAR untuk mulai lagi.";
}

function confirmationFormatReply() {
  return "Balas YA untuk menyimpan atau TIDAK untuk membatalkan.";
}

function introReply() {
  return [
    "Halo 👋",
    "Saya bot KostSolo.",
    "",
    "Ketik MENU untuk melihat perintah.",
    "Ketik DAFTAR untuk daftar owner.",
  ].join("\n");
}

function isKnownCommand(normalized) {
  const knownCommands = [
    "MENU",
    "HELP",
    "DAFTAR",
    "LOGIN",
    "LISTING",
    "UPDATE",
    "BATAL",
    "CANCEL",
  ];

  return (
    knownCommands.includes(normalized) ||
    normalized.startsWith("OTP ") ||
    normalized.startsWith("UPDATE ") ||
    normalized.startsWith("BALAS ")
  );
}

export const whatsappService = {
  async handleWebhookPayload(body) {
    const parsed = parseIncomingMessage(body);

    if (!parsed) {
      console.log("WA webhook non-message:", JSON.stringify(body, null, 2));
      return;
    }

    const { phone, text, rawMessage } = parsed;

    if (rawMessage?.type && rawMessage.type !== "text") {
      console.log("Ignoring non-text WA message:", rawMessage.type);
      return;
    }

    if (!text || !text.trim()) {
      console.log("Ignoring empty WA text");
      return;
    }

    console.log("📩 Incoming WA:", { phone, text });
    await this.handleIncomingMessage(phone, text);
  },

  async handleIncomingMessage(phone, text) {
    const normalized = normalizeText(text);

    if (normalized === "MENU" || normalized === "HELP") {
      await this.sendMessage(phone, menuReply());
      return;
    }

    if (normalized === "BATAL" || normalized === "CANCEL") {
      await db.whatsAppOnboardingSession.deleteMany({
        where: { phone },
      });

      this.clearSession(phone);
      await this.sendMessage(phone, "Session dibatalkan ✅");
      return;
    }

    if (normalized === "DAFTAR") {
      const existingOwner = await db.user.findUnique({
        where: { phone },
      });

      if (existingOwner && existingOwner.role === "OWNER") {
        await this.sendMessage(phone, ownerAlreadyExistsReply());
        return;
      }

      await db.whatsAppOnboardingSession.upsert({
        where: { phone },
        update: {
          step: 1,
          expiresAt: new Date(Date.now() + ONBOARDING_TTL_MS),
          lastMessageAt: new Date(),
          name: null,
          kostName: null,
          location: null,
          contact: null,
        },
        create: {
          phone,
          step: 1,
          expiresAt: new Date(Date.now() + ONBOARDING_TTL_MS),
          lastMessageAt: new Date(),
        },
      });

      await this.sendMessage(phone, askNameReply());
      return;
    }

    if (normalized === "LOGIN") {
      const existingOwner = await db.user.findUnique({
        where: { phone },
      });

      if (!existingOwner || existingOwner.role !== "OWNER") {
        await this.sendMessage(phone, ownerNotRegisteredReply());
        return;
      }

      const result = await requestOwnerOtp({ phone });

      if (result?.error) {
        await this.sendMessage(phone, result.error);
        return;
      }

      await this.sendMessage(
        phone,
        `OTP login Anda: ${result.data.otpPreview}\nKirim: OTP <kode>`
      );
      return;
    }

    if (normalized.startsWith("OTP")) {
      const otp = parseOtpCommand(text);

      if (!otp) {
        await this.sendMessage(phone, otpFormatReply());
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

      await this.sendMessage(phone, otpSuccessReply());

      console.log("Owner login success:", {
        phone,
        token: result?.data?.token,
      });

      return;
    }

    const session = await db.whatsAppOnboardingSession.findUnique({
      where: { phone },
    });

    if (session) {
      if (session.expiresAt <= new Date()) {
        await db.whatsAppOnboardingSession.deleteMany({
          where: { phone },
        });

        await this.sendMessage(
          phone,
          "Session pendaftaran sudah expired. Ketik DAFTAR untuk mulai lagi."
        );
        return;
      }

      await this.handleOnboardingStep(session, phone, text);
      return;
    }
    
    if (normalized.startsWith('BALAS ')) {
  await this.handleReplyChatCommand(phone, text)
  return
}

    if (!isKnownCommand(normalized)) {
      if (!greetedMap.has(phone)) {
  greetedMap.set(phone, Date.now())

  const user = await db.user.findUnique({
    where: { phone }
  })

  // belum daftar
  if (!user || user.role !== 'OWNER') {
    await this.sendMessage(
      phone,
      [
        'Halo 👋',
        'Selamat datang di *KostSolo Bot*!',
        '',
        '👉 Ketik *DAFTAR* untuk mulai sebagai owner',
      ].join('\n')
    )
    return
  }

  // sudah owner
  await this.sendMessage(
    phone,
    [
      'Halo 👋',
      'Selamat datang kembali di *KostSolo*!',
      '',
      '👉 Ketik *LISTING* untuk melihat kost Anda',
      '👉 Ketik *MENU* untuk perintah lengkap',
    ].join('\n')
  )

  return
}

      return;
    }

    if (normalized === "UPDATE") {
      await this.sendMessage(phone, updateProfileHelpReply());
      return;
    }

    if (normalized === "LISTING") {
      await this.handleListingCommand(phone);
      return;
    }

    if (normalized === 'STAT') {
  await this.handleStatCommand(phone)
  return
}

    if (normalized.startsWith("UPDATE HARGA ")) {
      await this.handleUpdatePrice(phone, text);
      return;
    }

    if (normalized.startsWith("UPDATE STOK ")) {
      await this.handleUpdateStock(phone, text);
      return;
    }

    if (normalized.startsWith("UPDATE ")) {
      await this.handleUpdateCommand(phone, text);
      return;
    }

    await this.sendMessage(phone, defaultReply());

    

  },

  async handleOnboardingStep(session, phone, text) {
    const cleanText = text.trim();

    if (session.step === 1) {
      if (isTooShort(cleanText, 3)) {
        await this.sendMessage(
          phone,
          "Nama terlalu pendek. Masukkan nama lengkap Anda."
        );
        return;
      }

      await db.whatsAppOnboardingSession.update({
        where: { phone },
        data: {
          name: cleanText,
          step: 2,
          lastMessageAt: new Date(),
        },
      });

      await this.sendMessage(phone, askKostNameReply());
      return;
    }

    if (session.step === 2) {
      if (isTooShort(cleanText, 3)) {
        await this.sendMessage(
          phone,
          "Nama kost terlalu pendek. Masukkan nama kost yang benar."
        );
        return;
      }

      await db.whatsAppOnboardingSession.update({
        where: { phone },
        data: {
          kostName: cleanText,
          step: 3,
          lastMessageAt: new Date(),
        },
      });

      await this.sendMessage(phone, askLocationReply());
      return;
    }

    if (session.step === 3) {
      if (isTooShort(cleanText, 5)) {
        await this.sendMessage(
          phone,
          "Lokasi terlalu pendek. Masukkan alamat/lokasi kost yang lebih jelas."
        );
        return;
      }

      await db.whatsAppOnboardingSession.update({
        where: { phone },
        data: {
          location: cleanText,
          step: 4,
          lastMessageAt: new Date(),
        },
      });

      await this.sendMessage(phone, askContactReply());
      return;
    }

    if (session.step === 4) {
      const contact = normalizePhone(cleanText);

      if (contact.length < 8) {
        await this.sendMessage(
          phone,
          "Nomor kontak tidak valid. Masukkan nomor kontak yang benar."
        );
        return;
      }

      const updated = await db.whatsAppOnboardingSession.update({
        where: { phone },
        data: {
          contact,
          step: 5,
          lastMessageAt: new Date(),
        },
      });

      await this.sendMessage(
        phone,
        confirmOwnerRegistrationReply({
          name: updated.name,
          kostName: updated.kostName,
          location: updated.location,
          contact: updated.contact,
        })
      );

      return;
    }

    if (session.step === 5) {
      const answer = normalizeText(cleanText);

      if (answer === "TIDAK" || answer === "NO" || answer === "BATAL") {
        await db.whatsAppOnboardingSession.deleteMany({
          where: { phone },
        });

        await this.sendMessage(phone, registrationCancelledReply());
        return;
      }

      if (answer !== "YA" && answer !== "YES") {
        await this.sendMessage(phone, confirmationFormatReply());
        return;
      }

      const latestSession = await db.whatsAppOnboardingSession.findUnique({
        where: { phone },
      });

      if (!latestSession) {
        await this.sendMessage(
          phone,
          "Session pendaftaran tidak ditemukan. Ketik DAFTAR untuk mulai lagi."
        );
        return;
      }

      const existingOwner = await db.user.findUnique({
        where: { phone },
      });

      if (existingOwner) {
        await db.whatsAppOnboardingSession.deleteMany({
          where: { phone },
        });

        await this.sendMessage(phone, ownerAlreadyExistsReply());
        return;
      }

      await db.user.create({
        data: {
          name: latestSession.name,
          phone,
          role: "OWNER",
          isEmailVerified: true,
          ownerProfile: {
            create: {
              kostName: latestSession.kostName,
              location: latestSession.location,
              contact: latestSession.contact,
            },
          },
        },
      });

      await db.whatsAppOnboardingSession.delete({
        where: { phone },
      });

      await this.sendMessage(phone, ownerRegisteredReply());
      return;
    }

    await this.sendMessage(
      phone,
      "Session pendaftaran tidak valid. Ketik BATAL lalu DAFTAR untuk mulai ulang."
    );
  },

  async handleUpdateCommand(phone, text) {
    const owner = await db.user.findUnique({
      where: { phone },
      include: { ownerProfile: true },
    });

    if (!owner || owner.role !== "OWNER") {
      await this.sendMessage(phone, ownerNotRegisteredReply());
      return;
    }

    if (!owner.ownerProfile) {
      await this.sendMessage(phone, ownerProfileNotFoundReply());
      return;
    }

    const parsed = parseUpdateProfileCommand(text);
    const field = (parsed.field || "").toUpperCase();
    const value = parsed.value?.trim();

    if (!field || !value) {
      await this.sendMessage(phone, updateProfileHelpReply());
      return;
    }

    const data = {};

    if (field === "NAMAKOST") {
      data.kostName = value;
    } else if (field === "LOKASI") {
      data.location = value;
    } else if (field === "KONTAK") {
      data.contact = value;
    } else {
      await this.sendMessage(phone, updateProfileUnknownFieldReply());
      return;
    }

    await db.ownerProfile.update({
      where: { userId: owner.id },
      data,
    });

    await this.sendMessage(phone, updateProfileSuccessReply(field));
  },

  async handleListingCommand(phone) {
    const owner = await db.user.findUnique({
      where: { phone },
      include: {
        listings: {
          include: {
            roomTypes: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!owner || owner.role !== "OWNER") {
      await this.sendMessage(phone, ownerNotFoundReply());
      return;
    }

    if (!owner.listings || owner.listings.length === 0) {
      await this.sendMessage(phone, emptyListingReply());
      return;
    }

    const listingRefs = owner.listings.map((listing, listingIndex) => ({
      index: listingIndex + 1,
      id: listing.id,
      name: listing.name,
      rooms: (listing.roomTypes || []).map((room, roomIndex) => ({
        index: roomIndex + 1,
        id: room.id,
        name: room.name,
        price: room.price,
        availableCount: room.availableCount,
      })),
    }));

    this.setSession(phone, { listingRefs });
    await this.sendMessage(phone, listingReply(listingRefs));
  },

  async handleUpdatePrice(phone, text) {
    const { listingNumber, roomNumber, value: price } =
      parseIndexedUpdateCommand(text);

    if (
      Number.isNaN(listingNumber) ||
      Number.isNaN(roomNumber) ||
      Number.isNaN(price)
    ) {
      await this.sendMessage(phone, indexedPriceFormatReply());
      return;
    }

    const found = this.findRoomFromSession(phone, listingNumber, roomNumber);

    if (found.error) {
      await this.sendMessage(phone, found.error);
      return;
    }

    const { room } = found;

    await db.roomType.update({
      where: { id: room.id },
      data: { price },
    });

    await this.sendMessage(phone, updatePriceSuccessReply(room.name, price));
  },

  async handleUpdateStock(phone, text) {
    const { listingNumber, roomNumber, value: stock } =
      parseIndexedUpdateCommand(text);

    if (
      Number.isNaN(listingNumber) ||
      Number.isNaN(roomNumber) ||
      Number.isNaN(stock) ||
      stock < 0
    ) {
      await this.sendMessage(phone, indexedStockFormatReply());
      return;
    }

    const found = this.findRoomFromSession(phone, listingNumber, roomNumber);

    if (found.error) {
      await this.sendMessage(phone, found.error);
      return;
    }

    const { room } = found;

    await db.roomType.update({
      where: { id: room.id },
      data: { availableCount: stock },
    });

    await this.sendMessage(phone, updateStockSuccessReply(room.name, stock));
  },

  getSession(phone) {
    return waSessionMap.get(phone);
  },

  setSession(phone, data) {
    waSessionMap.set(phone, {
      ...data,
      createdAt: Date.now(),
    });
  },

  clearSession(phone) {
    waSessionMap.delete(phone);
  },

  clearExpiredSession(phone) {
    const session = waSessionMap.get(phone);
    if (!session) return;

    if (Date.now() - session.createdAt > LISTING_SESSION_TTL_MS) {
      waSessionMap.delete(phone);
    }
  },

  findRoomFromSession(phone, listingNumber, roomNumber) {
    this.clearExpiredSession(phone);

    const session = this.getSession(phone);

    if (!session?.listingRefs?.length) {
      return { error: listingSessionNotFoundReply() };
    }

    const listing = session.listingRefs.find(
      (item) => item.index === listingNumber
    );

    if (!listing) {
      return { error: invalidListingNumberReply() };
    }

    const room = listing.rooms.find((item) => item.index === roomNumber);

    if (!room) {
      return { error: invalidRoomNumberReply() };
    }

    return { listing, room };
  },

  async sendMessage(to, text) {
    const token = process.env.FONNTE_TOKEN;

    if (!token) {
      throw new Error("FONNTE_TOKEN is not configured");
    }

    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target: to,
        message: text,
        typing: true,
      }),
    });

    const result = await response.json();

    if (!response.ok || result?.status === false) {
      console.error("Fonnte send failed:", result);
      throw new Error(
        result?.reason ||
          result?.detail ||
          result?.message ||
          "Failed to send WhatsApp message via Fonnte"
      );
    }

    console.log("Fonnte sent:", result);
    return result;
  },

  async handleStatCommand(phone) {
  const owner = await db.user.findUnique({
    where: { phone },
    include: {
      listings: {
        include: {
          views: true,
        },
      },
    },
  })

  if (!owner || owner.role !== 'OWNER') {
    await this.sendMessage(phone, ownerNotRegisteredReply())
    return
  }

  if (!owner.listings || owner.listings.length === 0) {
    await this.sendMessage(phone, 'Anda belum punya listing.')
    return
  }

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  let message = ['📊 *Statistik Kost Anda*', '']

  for (const listing of owner.listings) {
    const totalViews = listing.views.length

    const todayViews = listing.views.filter(
      (v) => new Date(v.viewedAt) >= startOfToday
    ).length

    message.push(`🏠 *${listing.name}*`)
    message.push(`👁️ Total: ${totalViews}`)
    message.push(`📅 Hari ini: ${todayViews}`)
    message.push('') // spacing
  }

  await this.sendMessage(phone, message.join('\n'))
},

async handleReplyChatCommand(phone, text) {
  const parts = text.trim().split(/\s+/)
  const code = parts[1]?.toUpperCase()
  const message = parts.slice(2).join(' ').trim()

  if (!code || !message) {
    await this.sendMessage(
      phone,
      'Format salah.\nGunakan: BALAS <kode> <pesan>'
    )
    return
  }

  const owner = await db.user.findUnique({
    where: { phone }
  })

  if (!owner || owner.role !== 'OWNER') {
    await this.sendMessage(phone, ownerNotRegisteredReply())
    return
  }

  const thread = await db.chatThread.findFirst({
    where: {
      ownerId: owner.id,
      id: {
        endsWith: code.toLowerCase()
      }
    },
    include: {
      listing: true,
      student: true,
      owner: {
        include: {
          ownerProfile: true
        }
      }
    }
  })

  if (!thread) {
    await this.sendMessage(
      phone,
      'Chat tidak ditemukan. Pastikan kode chat benar.'
    )
    return
  }

  await db.chatMessage.create({
    data: {
      threadId: thread.id,
      senderId: owner.id,
      message
    }
  })

  await db.chatThread.update({
    where: { id: thread.id },
    data: {
      updatedAt: new Date()
    }
  })

  await this.sendMessage(
    phone,
    [
      '✅ Balasan terkirim',
      '',
      `🏠 ${thread.listing?.name || '-'}`,
      `👤 ${thread.student?.name || 'Calon penyewa'}`,
      '',
      `"${message}"`
    ].join('\n')
  )
}
};