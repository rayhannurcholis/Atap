import db from '../../db.js'
import { generateOtp, hashOtp, verifyOtp } from '../../utils/otp.js'
import { whatsappService } from '../whatsapp/whatsapp.service.js'
import {
  collectListingPhotos,
  roomTypesWithPhotosInclude
} from '../../utils/listingPhotos.js'
import { applyPriceMarkup } from '../../utils/pricing.js'

const OTP_TTL_MS = 10 * 60 * 1000

/** Bentuk kanonik nomor: hanya digit, awalan 0 -> 62. */
function canonicalPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('0')) return `62${digits.slice(1)}`
  if (digits.startsWith('62')) return digits
  if (digits.startsWith('8')) return `62${digits}`
  return digits
}

/** Semua kemungkinan format nomor agar cocok dengan data tersimpan. */
function phoneVariants(phone) {
  const variants = new Set()
  const trimmed = String(phone || '').trim()
  if (trimmed) variants.add(trimmed)

  const digits = trimmed.replace(/\D/g, '')
  if (digits) {
    variants.add(digits)
    const canon = canonicalPhone(trimmed)
    if (canon) {
      variants.add(canon)
      variants.add(`+${canon}`)
      if (canon.startsWith('62')) variants.add(`0${canon.slice(2)}`)
    }
  }

  return [...variants].filter(Boolean)
}

export function formatLead(lead) {
  return lead
}

/** Ubah lead+listing menjadi kartu untuk halaman "Kos Diminati". */
function toDiminatiCard(lead) {
  const listing = lead.listing
  if (!listing) return null

  const photos = collectListingPhotos(listing.roomTypes)
  const prices = (listing.roomTypes || [])
    .map((room) => Number(room.price))
    .filter((n) => Number.isFinite(n) && n > 0)

  return {
    leadId: lead.id,
    leadAt: lead.createdAt,
    id: listing.id,
    name: listing.name,
    status: listing.status,
    address: listing.address ?? null,
    genderType: listing.genderType ?? null,
    thumbnailUrl: photos[0]?.url ?? null,
    cheapestPrice: prices.length ? applyPriceMarkup(Math.min(...prices)) : null
  }
}

async function createLeadRecord({ listingId, userId }) {
  const listing = await db.kostListing.findFirst({
    where: {
      id: listingId,
      status: 'ACTIVE'
    }
  })

  if (!listing) {
    throw new Error('Listing not found')
  }

  const existing = await db.listingLead.findUnique({
    where: {
      listingId_userId: {
        listingId,
        userId
      }
    }
  })

  if (existing) {
    return {
      alreadyExists: true,
      lead: formatLead(existing)
    }
  }

  const lead = await db.listingLead.create({
    data: {
      listingId,
      userId
    }
  })

  return {
    alreadyExists: false,
    lead: formatLead(lead)
  }
}

async function findOrCreateGuestUser(payload) {
  const byPhone = await db.user.findFirst({
    where: { phone: payload.phone }
  })

  if (byPhone) {
    return byPhone
  }

  if (payload.email) {
    const byEmail = await db.user.findUnique({
      where: { email: payload.email }
    })

    if (byEmail) {
      if (!byEmail.phone) {
        return db.user.update({
          where: { id: byEmail.id },
          data: { phone: payload.phone }
        })
      }

      return byEmail
    }
  }

  return db.user.create({
    data: {
      role: 'USER',
      name: payload.name,
      phone: payload.phone,
      email: payload.email || null,
      passwordHash: null,
      isEmailVerified: false
    }
  })
}

export const leadService = {
  async listForAdmin({ listingId, limit = 20 }) {
    const where = {}

    if (listingId) {
      where.listingId = listingId
    }

    const leads = await db.listingLead.findMany({
      where,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true
          }
        },
        listing: {
          select: {
            id: true,
            name: true,
            status: true,
            ownerId: true,
            contactNumber: true
          }
        }
      }
    })

    return { data: leads.map(formatLead) }
  },

  async createAuthLead(listingId, userId) {
    return createLeadRecord({
      listingId,
      userId
    })
  },

  async createGuestLead(listingId, payload) {
    const user = await findOrCreateGuestUser(payload)

    return createLeadRecord({
      listingId,
      userId: user.id
    })
  },

  /** Daftar kos yang diminati oleh user yang login. */
  async listForUser(userId) {
    const leads = await db.listingLead.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        listing: {
          include: roomTypesWithPhotosInclude
        }
      }
    })

    return {
      data: leads.map(toDiminatiCard).filter(Boolean)
    }
  },

  /** Kirim OTP ke nomor WhatsApp untuk verifikasi guest sebelum melihat minatnya. */
  async requestLookupOtp(phone) {
    const variants = phoneVariants(phone)
    const user = await db.user.findFirst({
      where: { phone: { in: variants } }
    })

    // Demi privasi, balas sukses walau nomor tak ditemukan — tapi tak kirim OTP.
    if (!user) {
      return { data: { message: 'Jika nomor terdaftar, OTP telah dikirim.' } }
    }

    const otp = generateOtp()
    const codeHash = await hashOtp(otp)
    const key = `lead-lookup:${canonicalPhone(phone)}`

    await db.emailOtp.create({
      data: {
        email: key,
        codeHash,
        expiresAt: new Date(Date.now() + OTP_TTL_MS)
      }
    })

    let waSent = true
    try {
      await whatsappService.sendMessage(
        phone,
        `🔐 *Kode Verifikasi Kos Diminati*\n\nKode OTP Anda: *${otp}*\n\nKode berlaku 10 menit.`
      )
    } catch (error) {
      waSent = false
      console.error('Failed to send lead lookup OTP via WhatsApp:', error)
    }

    return {
      data: {
        message: waSent
          ? 'OTP telah dikirim via WhatsApp.'
          : 'OTP dibuat, tetapi pengiriman WhatsApp gagal. Gunakan kode preview (mode dev).',
        // Preview untuk dev/testing (mis. saat device WhatsApp belum aktif).
        otpPreview: otp
      }
    }
  },

  /** Verifikasi OTP lalu kembalikan kos yang diminati oleh nomor tersebut. */
  async verifyLookupOtp(phone, otp) {
    const key = `lead-lookup:${canonicalPhone(phone)}`

    const latestOtp = await db.emailOtp.findFirst({
      where: { email: key, usedAt: null },
      orderBy: { createdAt: 'desc' }
    })

    if (!latestOtp) {
      throw new Error('OTP not found')
    }

    if (latestOtp.expiresAt < new Date()) {
      throw new Error('OTP expired')
    }

    const valid = await verifyOtp(otp, latestOtp.codeHash)
    if (!valid) {
      throw new Error('Invalid OTP')
    }

    await db.emailOtp.update({
      where: { id: latestOtp.id },
      data: { usedAt: new Date() }
    })

    const variants = phoneVariants(phone)
    const leads = await db.listingLead.findMany({
      where: { user: { phone: { in: variants } } },
      orderBy: { createdAt: 'desc' },
      include: {
        listing: {
          include: roomTypesWithPhotosInclude
        }
      }
    })

    return {
      data: leads.map(toDiminatiCard).filter(Boolean)
    }
  }
}
