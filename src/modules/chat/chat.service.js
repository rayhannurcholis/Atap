import db from '../../db.js'
import { whatsappService } from '../whatsapp/whatsapp.service.js'

export const chatService = {
  async startThread({ listingId, studentId, initialMessage }) {
    const listing = await db.kostListing.findFirst({
      where: {
        id: listingId,
        status: 'ACTIVE'
      },
      include: {
        owner: {
          include: {
            ownerProfile: true
          }
        }
      }
    })

    if (!listing) {
      return { error: 'Listing not found', status: 404 }
    }

    if (listing.ownerId === studentId) {
      return { error: 'You cannot chat with your own listing', status: 400 }
    }

    let createdInitialMessage = false

    let thread = await db.chatThread.findUnique({
      where: {
        listingId_studentId_ownerId: {
          listingId,
          studentId,
          ownerId: listing.ownerId
        }
      },
      include: {
        listing: true,
        student: true,
        owner: {
          include: {
            ownerProfile: true
          }
        },
        messages: {
          orderBy: {
            sentAt: 'asc'
          }
        }
      }
    })

    if (!thread) {
      thread = await db.chatThread.create({
        data: {
          listingId,
          studentId,
          ownerId: listing.ownerId,
          messages: initialMessage
            ? {
                create: {
                  senderId: studentId,
                  message: initialMessage
                }
              }
            : undefined
        },
        include: {
          listing: true,
          student: true,
          owner: {
            include: {
              ownerProfile: true
            }
          },
          messages: {
            orderBy: {
              sentAt: 'asc'
            }
          }
        }
      })

      createdInitialMessage = Boolean(initialMessage)
    }

    if (createdInitialMessage) {
      try {
        await notifyOwnerNewChatMessage({
          thread,
          senderId: studentId,
          message: initialMessage
        })
      } catch (error) {
        console.error('Failed to notify owner via WhatsApp:', error)
      }
    }

    return {
      data: formatThreadDetail(thread)
    }
  },

  async getMyThreads(user) {
    const where =
      user.role === 'OWNER'
        ? { ownerId: user.id }
        : { studentId: user.id }

    const threads = await db.chatThread.findMany({
      where,
      include: {
        listing: true,
        student: true,
        owner: {
          include: {
            ownerProfile: true
          }
        },
        messages: {
          orderBy: {
            sentAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return {
      data: threads.map((thread) => {
        const lastMessage = thread.messages[0] || null

        return {
          id: thread.id,
          listing: {
            id: thread.listing.id,
            name: thread.listing.name
          },
          displayName:
            user.role === 'OWNER'
              ? thread.student.name
              : thread.owner.ownerProfile?.kostName || thread.listing.name,
          student: {
            id: thread.student.id,
            name: thread.student.name
          },
          owner: {
            id: thread.owner.id,
            name: thread.owner.name,
            kostName: thread.owner.ownerProfile?.kostName ?? null
          },
          lastMessage: lastMessage
            ? {
                id: lastMessage.id,
                senderId: lastMessage.senderId,
                message: lastMessage.message,
                sentAt: lastMessage.sentAt,
                readAt: lastMessage.readAt
              }
            : null,
          updatedAt: thread.updatedAt,
          createdAt: thread.createdAt
        }
      })
    }
  },

  async getThreadById(threadId, user) {
    const thread = await db.chatThread.findFirst({
      where: {
        id: threadId,
        OR: [{ studentId: user.id }, { ownerId: user.id }]
      },
      include: {
        listing: true,
        student: true,
        owner: {
          include: {
            ownerProfile: true
          }
        },
        messages: {
          orderBy: {
            sentAt: 'asc'
          }
        }
      }
    })

    if (!thread) {
      return { error: 'Chat thread not found', status: 404 }
    }

    return {
      data: formatThreadDetail(thread)
    }
  },

  async sendMessage(threadId, senderId, message) {
    const thread = await db.chatThread.findFirst({
      where: {
        id: threadId,
        OR: [{ studentId: senderId }, { ownerId: senderId }]
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
      return { error: 'Chat thread not found', status: 404 }
    }

    await db.chatMessage.create({
      data: {
        threadId,
        senderId,
        message
      }
    })

    await db.chatThread.update({
      where: { id: threadId },
      data: {
        updatedAt: new Date()
      }
    })

    try {
      await notifyOwnerNewChatMessage({
        thread,
        senderId,
        message
      })
    } catch (error) {
      console.error('Failed to notify owner via WhatsApp:', error)
    }

    const updatedThread = await db.chatThread.findUnique({
      where: { id: threadId },
      include: {
        listing: true,
        student: true,
        owner: {
          include: {
            ownerProfile: true
          }
        },
        messages: {
          orderBy: {
            sentAt: 'asc'
          }
        }
      }
    })

    return {
      data: formatThreadDetail(updatedThread)
    }
  }
}

async function notifyOwnerNewChatMessage({ thread, senderId, message }) {
  if (!thread) return

  // Jangan notif owner kalau pengirimnya owner sendiri
  if (senderId === thread.ownerId) return

  const ownerPhone = thread.owner?.phone

  if (!ownerPhone) {
    console.log('Owner phone not found, skip WhatsApp notification')
    return
  }

 const replyCode = thread.id.slice(-6).toUpperCase()

const text = [
  '💬 *Pesan Baru dari Calon Penyewa*',
  '',
  `🏠 Kost: *${thread.listing?.name || '-'}*`,
  `👤 Dari: *${thread.student?.name || 'Calon penyewa'}*`,
  '',
  `"${message}"`,
  '',
  `Kode chat: *${replyCode}*`,
  '',
  'Balas lewat WA dengan format:',
  `BALAS ${replyCode} pesan Anda`
].join('\n')

  await whatsappService.sendMessage(ownerPhone, text)
}

function formatThreadDetail(thread) {
  return {
    id: thread.id,
    listing: {
      id: thread.listing.id,
      name: thread.listing.name
    },
    student: {
      id: thread.student.id,
      name: thread.student.name
    },
    owner: {
      id: thread.owner.id,
      name: thread.owner.name,
      kostName: thread.owner.ownerProfile?.kostName ?? null
    },
    messages: thread.messages.map((message) => ({
      id: message.id,
      senderId: message.senderId,
      message: message.message,
      sentAt: message.sentAt,
      readAt: message.readAt
    })),
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt
  }
}