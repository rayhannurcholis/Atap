#!/usr/bin/env node
/**
 * Hapus user yang "nyangkut" di database — biasanya akibat register gagal
 * di tengah jalan (mis. SMTP error → user sudah ter-create tapi tidak
 * pernah bisa verifikasi OTP, sehingga phone/email-nya tidak bisa dipakai
 * register ulang karena unique constraint).
 *
 * Cara pakai:
 *
 *   # 1. List semua user yang kemungkinan nyangkut (baru, belum verifikasi)
 *   node scripts/cleanup-stuck-user.js --list
 *
 *   # 2. Hapus user berdasarkan email atau phone (perlu --confirm)
 *   node scripts/cleanup-stuck-user.js --email user@example.com --confirm
 *   node scripts/cleanup-stuck-user.js --phone +6281234567890 --confirm
 *
 *   # 3. Dry-run (lihat apa yang akan dihapus tanpa eksekusi)
 *   node scripts/cleanup-stuck-user.js --email user@example.com
 *
 * Penting: pastikan env DATABASE_URL ter-set (mis. via .env atau export).
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function parseArgs(argv) {
  const args = { list: false, confirm: false }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--list') args.list = true
    else if (a === '--confirm') args.confirm = true
    else if (a === '--email') args.email = argv[++i]
    else if (a === '--phone') args.phone = argv[++i]
    else if (a === '--help' || a === '-h') args.help = true
    else if (!a.startsWith('--')) {
      console.warn(`Argument tidak dikenali: ${a}`)
    }
  }
  return args
}

function printHelp() {
  console.log(`
Cleanup stuck users helper

Usage:
  node scripts/cleanup-stuck-user.js --list
  node scripts/cleanup-stuck-user.js --email <email> [--confirm]
  node scripts/cleanup-stuck-user.js --phone <+62...> [--confirm]

Options:
  --list       Tampilkan semua user yang kemungkinan nyangkut
               (USER belum verify email; OWNER tanpa listing dibuat < 7 hari)
  --email      Target user by email
  --phone      Target user by phone (format internasional, mis. +6281...)
  --confirm    Eksekusi penghapusan. Tanpa flag ini = dry-run.
`)
}

async function listStuck() {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const stuckUsers = await prisma.user.findMany({
    where: {
      role: 'USER',
      isEmailVerified: false,
      createdAt: { gte: since }
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  })

  const recentOwners = await prisma.user.findMany({
    where: {
      role: 'OWNER',
      createdAt: { gte: since },
      listings: { none: {} }
    },
    select: {
      id: true,
      email: true,
      phone: true,
      name: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  })

  const pad = (v, n) => String(v ?? '-').padEnd(n)

  console.log('\n=== USER (pencari) belum verifikasi email, dibuat ≤7 hari ===')
  if (stuckUsers.length === 0) {
    console.log('  (kosong)')
  } else {
    for (const u of stuckUsers) {
      console.log(
        `  ${u.createdAt.toISOString()}  ${pad(u.email, 40)}  ${pad(u.name, 20)}`
      )
    }
  }

  console.log('\n=== OWNER (pemilik) tanpa listing apapun, dibuat ≤7 hari ===')
  if (recentOwners.length === 0) {
    console.log('  (kosong)')
  } else {
    for (const u of recentOwners) {
      console.log(
        `  ${u.createdAt.toISOString()}  ${pad(u.phone, 18)}  ${pad(u.email, 40)}  ${pad(u.name, 20)}`
      )
    }
  }
  console.log('')
}

async function findUser({ email, phone }) {
  const where = email ? { email } : { phone }
  return prisma.user.findUnique({
    where,
    include: {
      ownerProfile: true,
      _count: {
        select: {
          listings: true,
          favorites: true,
          studentThreads: true,
          ownerThreads: true,
          sentMessages: true,
          listingViews: true,
          listingLeads: true,
          submittedListingReports: true
        }
      }
    }
  })
}

async function deleteUser(user, { dryRun }) {
  const emailOtpCount = user.email
    ? await prisma.emailOtp.count({ where: { email: user.email } })
    : 0
  const phoneOtpCount = user.phone
    ? await prisma.emailOtp.count({ where: { email: user.phone } })
    : 0
  const resetTokenCount = user.email
    ? await prisma.passwordResetToken.count({ where: { email: user.email } })
    : 0
  const sessionLogCount = await prisma.adminSessionLog.count({
    where: { adminId: user.id }
  })

  console.log('\nUser ditemukan:')
  console.log(`  id              : ${user.id}`)
  console.log(`  role            : ${user.role}`)
  console.log(`  name            : ${user.name}`)
  console.log(`  email           : ${user.email ?? '-'}`)
  console.log(`  phone           : ${user.phone ?? '-'}`)
  console.log(`  isEmailVerified : ${user.isEmailVerified}`)
  console.log(`  createdAt       : ${user.createdAt.toISOString()}`)
  console.log('\nRelasi yang akan ikut terhapus (cascade Prisma):')
  console.log(`  ownerProfile           : ${user.ownerProfile ? 1 : 0}`)
  console.log(`  listings (Kost)        : ${user._count.listings}`)
  console.log(`  favorites              : ${user._count.favorites}`)
  console.log(`  studentChatThreads     : ${user._count.studentThreads}`)
  console.log(`  ownerChatThreads       : ${user._count.ownerThreads}`)
  console.log(`  sentMessages           : ${user._count.sentMessages}`)
  console.log(`  listingViews           : ${user._count.listingViews}`)
  console.log(`  listingLeads           : ${user._count.listingLeads}`)
  console.log(`  submittedListingReports: ${user._count.submittedListingReports}`)
  console.log('\nManual cleanup (tidak cascade otomatis):')
  console.log(`  EmailOtp by email      : ${emailOtpCount}`)
  console.log(`  EmailOtp by phone      : ${phoneOtpCount}`)
  console.log(`  PasswordResetToken     : ${resetTokenCount}`)
  console.log(`  AdminSessionLog        : ${sessionLogCount}`)

  if (dryRun) {
    console.log('\n[DRY RUN] Tambah --confirm untuk benar-benar menghapus.')
    return
  }

  if (
    user._count.listings > 0 ||
    user._count.favorites > 0 ||
    user._count.studentThreads > 0 ||
    user._count.ownerThreads > 0 ||
    user._count.sentMessages > 0 ||
    user._count.listingLeads > 0
  ) {
    console.log(
      '\n⚠️  User ini punya data aktif (listing/favorit/chat/lead). ' +
        'Penghapusan akan ikut menghapus semua data tersebut secara cascade. ' +
        'Pastikan ini benar-benar maksud kamu.'
    )
  }

  await prisma.$transaction(async (tx) => {
    if (user.email) {
      await tx.emailOtp.deleteMany({ where: { email: user.email } })
      await tx.passwordResetToken.deleteMany({ where: { email: user.email } })
    }
    if (user.phone) {
      await tx.emailOtp.deleteMany({ where: { email: user.phone } })
    }
    await tx.adminSessionLog.deleteMany({ where: { adminId: user.id } })
    // OwnerProfile dan AdminSessionLog tidak punya onDelete:Cascade di
    // schema.prisma, jadi harus dihapus manual sebelum User dihapus —
    // kalau tidak, akan kena FK constraint violation (P2003).
    if (user.ownerProfile) {
      await tx.ownerProfile.delete({ where: { userId: user.id } })
    }
    await tx.user.delete({ where: { id: user.id } })
  })

  console.log('\n✅ Berhasil dihapus.')
}

async function main() {
  const args = parseArgs(process.argv)

  if (args.help) {
    printHelp()
    return
  }

  if (args.list) {
    await listStuck()
    return
  }

  if (!args.email && !args.phone) {
    console.error('Wajib kasih --email atau --phone (atau --list / --help).\n')
    printHelp()
    process.exitCode = 1
    return
  }

  const user = await findUser(args)
  if (!user) {
    console.log(
      `\nUser dengan ${args.email ? 'email ' + args.email : 'phone ' + args.phone} tidak ditemukan di database.`
    )
    return
  }

  await deleteUser(user, { dryRun: !args.confirm })
}

main()
  .catch((err) => {
    console.error('Error:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
