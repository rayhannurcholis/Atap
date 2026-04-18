import { z } from 'zod'
import { chatService } from './chat.service.js'

const startThreadSchema = z.object({
  listingId: z.string().min(1, 'listingId is required'),
  initialMessage: z.string().min(1, 'initialMessage is required').optional()
})

const sendMessageSchema = z.object({
  message: z.string().min(1, 'message is required')
})

export const chatController = {
  async start(c) {
    try {
      const user = c.get('user')
      const body = await c.req.json()
      const parsed = startThreadSchema.parse(body)

      const result = await chatService.startThread({
        listingId: parsed.listingId,
        studentId: user.id,
        initialMessage: parsed.initialMessage
      })

      if (result?.error) {
        return c.json({ message: result.error }, result.status || 400)
      }

      return c.json({
        message: 'Chat thread ready',
        data: result.data
      })
    } catch (error) {
      return c.json(
        {
          message: error.message || 'Failed to start chat'
        },
        400
      )
    }
  },

  async getMyThreads(c) {
    try {
      const user = c.get('user')
      const result = await chatService.getMyThreads(user)

      return c.json({
        message: 'Success',
        data: result.data
      })
    } catch (error) {
      return c.json(
        {
          message: error.message || 'Failed to get chats'
        },
        400
      )
    }
  },

  async getById(c) {
    try {
      const user = c.get('user')
      const threadId = c.req.param('threadId')

      const result = await chatService.getThreadById(threadId, user)

      if (result?.error) {
        return c.json({ message: result.error }, result.status || 400)
      }

      return c.json({
        message: 'Success',
        data: result.data
      })
    } catch (error) {
      return c.json(
        {
          message: error.message || 'Failed to get chat detail'
        },
        400
      )
    }
  },

  async sendMessage(c) {
    try {
      const user = c.get('user')
      const threadId = c.req.param('threadId')
      const body = await c.req.json()
      const parsed = sendMessageSchema.parse(body)

      const result = await chatService.sendMessage(
        threadId,
        user.id,
        parsed.message
      )

      if (result?.error) {
        return c.json({ message: result.error }, result.status || 400)
      }

      return c.json({
        message: 'Message sent',
        data: result.data
      })
    } catch (error) {
      return c.json(
        {
          message: error.message || 'Failed to send message'
        },
        400
      )
    }
  }
}