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
  otpReply,
  listingReply,
} from "./whatsapp.reply.js";

const waSessionMap = new Map();

export const whatsappService = {
  async handleWebhookPayload(body) {
    const parsed = parseIncomingMessage(body);
    if (!parsed) return;

    const { phone, text } = parsed;

    console.log("📩 Incoming WA:", { phone, text });
    await this.handleIncomingMessage(phone, text);
  },

  async handleIncomingMessage(phone, text) {
    const normalized = normalizeText(text);

    const session = await db.whatsAppOnboardingSession.findUnique({
      where: { phone },
    });

    if (session && session.expiresAt > new Date()) {
      await this.handleOnboardingStep(session, phone, text);
      return;
    }

    if (normalized === "MENU" || normalized === "HELP") {
      await this.sendMessage(phone, menuReply());
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

      await this.sendMessage(phone, otpReply(result.data.otpPreview));
      return;
    }

    if (normalized.startsWith("OTP ")) {
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

    if (normalized === "UPDATE") {
      await this.sendMessage(phone, updateProfileHelpReply());
      return;
    }

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

    if (normalized.startsWith("UPDATE ")) {
      await this.handleUpdateCommand(phone, text);
      return;
    }

    await this.sendMessage(phone, defaultReply());
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

      await this.sendMessage(phone, askKostNameReply());
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

      await this.sendMessage(phone, askLocationReply());
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

      await this.sendMessage(phone, askContactReply());
      return;
    }

    if (session.step === 4) {
      const existingOwner = await db.user.findUnique({
        where: { phone },
      });

      if (existingOwner) {
        await this.sendMessage(phone, ownerAlreadyExistsReply());
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

      await this.sendMessage(phone, ownerRegisteredReply());
    }
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

    const { field, value } = parseUpdateProfileCommand(text);

    if (!field || !value) {
      await this.sendMessage(phone, updateProfileHelpReply());
      return;
    }

    let data = {};

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

  clearExpiredSession(phone) {
    const session = waSessionMap.get(phone);
    if (!session) return;

    const maxAge = 30 * 60 * 1000;
    if (Date.now() - session.createdAt > maxAge) {
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
    const url = `https://graph.facebook.com/v23.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: {
          body: text,
        },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("WA send failed:", result);
      throw new Error(
        result?.error?.message || "Failed to send WhatsApp message"
      );
    }

    console.log("WA sent:", result);
    return result;
  },
};