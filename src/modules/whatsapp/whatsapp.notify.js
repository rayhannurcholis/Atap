import db from '../../db.js'
import { whatsappService } from './whatsapp.service.js'

export async function notifyOwnerNewChatMessage({ threadId, senderId, message }) {
  const thread = await db.chatThread.findUnique({
    where: { id: threadId },
    include: {
      listing: {
        select: {
          id: true,
          name: true
        }
      },
      student: {
        select: {
          id: true,
          name: true
        }
      },
      owner: {
        select: {
          id: true,
          phone: true,
          name: true
        }
      }
    }
  })

  if (!thread) return

  // Jangan notif owner kalau pengirimnya owner sendiri
  if (senderId === thread.ownerId) return

  if (!thread.owner?.phone) return

  const text = [
    '💬 *Pesan Baru dari Calon Penyewa*',
    '',
    `🏠 Kost: *${thread.listing?.name || '-'}*`,
    `👤 Dari: *${thread.student?.name || 'Calon penyewa'}*`,
    '',
    `"${message}"`,
    '',
    'Silakan balas lewat aplikasi KostSolo.'
  ].join('\n')

  await whatsappService.sendMessage(thread.owner.phone, text)
}