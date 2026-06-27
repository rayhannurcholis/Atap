#!/usr/bin/env node
/**
 * Test koneksi SMTP berdasarkan env yang sedang aktif.
 *
 * Cara pakai:
 *   bun --env-file=.env.cloud scripts/test-smtp.js
 *   bun --env-file=.env.cloud scripts/test-smtp.js --send rayhan.a.nurcholis@student.uns.ac.id
 *
 * - Tanpa --send: cuma verifikasi koneksi & autentikasi (transporter.verify())
 * - Dengan --send <to>: kirim email test ke alamat tersebut
 *
 * Skrip ini SENGAJA tidak mencetak nilai SMTP_USER / SMTP_PASS supaya
 * credential tidak bocor ke terminal/log. Ia hanya melaporkan apakah
 * koneksi sukses dan pesan error ASLI dari Gmail/Google.
 */

import 'dotenv/config'
import nodemailer from 'nodemailer'

function parseArgs(argv) {
  const args = {}
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--send') args.send = argv[++i]
  }
  return args
}

async function main() {
  const args = parseArgs(process.argv)

  const cfg = {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    user: process.env.SMTP_USER,
    passLen: (process.env.SMTP_PASS || '').length,
    passHasSpaces: /\s/.test(process.env.SMTP_PASS || ''),
    from: process.env.MAIL_FROM,
  }

  console.log('=== Konfigurasi yang akan dites ===')
  console.log(`  SMTP_HOST       : ${cfg.host || '(missing)'}`)
  console.log(`  SMTP_PORT       : ${cfg.port || '(missing)'}`)
  console.log(`  SMTP_USER       : ${cfg.user ? '(set, length ' + cfg.user.length + ')' : '(missing)'}`)
  console.log(`  SMTP_PASS       : ${cfg.passLen ? '(set, length ' + cfg.passLen + (cfg.passHasSpaces ? ', HAS SPACES!' : '') + ')' : '(missing)'}`)
  console.log(`  MAIL_FROM       : ${cfg.from ? '(set)' : '(missing)'}`)

  if (cfg.passHasSpaces) {
    console.warn(
      '\n⚠️  WARNING: SMTP_PASS mengandung spasi. Google App Password\n' +
      '   yang valid adalah 16 char TANPA spasi. Format "xxxx xxxx xxxx xxxx"\n' +
      '   yang ditampilkan UI Google itu hanya untuk readability — value yang\n' +
      '   harus disimpan adalah 16 char rapat tanpa spasi.\n'
    )
  }

  async function tryVerify(label, password) {
    const tx = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: password,
      },
    })
    try {
      await tx.verify()
      console.log(`✅ ${label}: SUKSES`)
      return tx
    } catch (err) {
      console.error(`❌ ${label}: GAGAL`)
      console.error(`   Code     : ${err.code || '-'}`)
      console.error(`   Command  : ${err.command || '-'}`)
      console.error(`   Response : ${err.response || err.message}`)
      return null
    }
  }

  console.log('\n=== Tahap 1: verify() koneksi & autentikasi ===')
  let transporter = await tryVerify('Verify dengan SMTP_PASS apa adanya', process.env.SMTP_PASS)

  if (!transporter && cfg.passHasSpaces) {
    const stripped = (process.env.SMTP_PASS || '').replace(/\s+/g, '')
    console.log(`\n=== Tahap 1b: retry dengan spasi di-strip (${stripped.length} chars) ===`)
    transporter = await tryVerify('Verify dengan SMTP_PASS tanpa spasi', stripped)
  }

  if (!transporter) return

  if (args.send) {
    console.log(`\n=== Tahap 2: kirim email test ke ${args.send} ===`)
    try {
      const info = await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: args.send,
        subject: 'KostSolo SMTP test',
        text:
          'Ini email tes dari skrip scripts/test-smtp.js KostSolo backend.\n\n' +
          'Kalau kamu menerima ini, berarti SMTP backend berfungsi normal.',
      })
      console.log(`✅ Sent. messageId=${info.messageId}`)
      console.log(`   Response : ${info.response}`)
      if (info.accepted?.length) console.log(`   Accepted : ${info.accepted.join(', ')}`)
      if (info.rejected?.length) console.log(`   Rejected : ${info.rejected.join(', ')}`)
    } catch (err) {
      console.error('❌ Send GAGAL.')
      console.error(`   Code     : ${err.code || '-'}`)
      console.error(`   Command  : ${err.command || '-'}`)
      console.error(`   Response : ${err.response || err.message}`)
    }
  } else {
    console.log('\n(Skip Tahap 2 — tambah "--send <email>" untuk kirim email test sungguhan.)')
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exitCode = 1
})
