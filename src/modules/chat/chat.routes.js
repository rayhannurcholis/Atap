import { Hono } from 'hono'
import { authRequired } from '../../middleware/auth.js'
import { requireRole } from '../../middleware/role.js'
import { chatController } from './chat.controller.js'

const chatRoutes = new Hono()

chatRoutes.use('*', authRequired())

chatRoutes.post('/start', requireRole('USER'), chatController.start)
chatRoutes.get('/', chatController.getMyThreads)
chatRoutes.get('/:threadId', chatController.getById)
chatRoutes.post('/:threadId/messages', chatController.sendMessage)

export default chatRoutes