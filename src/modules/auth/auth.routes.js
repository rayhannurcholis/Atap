import { Hono } from 'hono'
import {
  registerUserController,
  verifyUserEmailController,
  resendUserOtpController,
  loginUserController,
  forgotUserPasswordController,
  resetUserPasswordController,
  loginOwnerController,
  loginAdminController
} from './auth.controller.js'

const router = new Hono()

router.post('/user/register', registerUserController)
router.post('/user/verify-email', verifyUserEmailController)
router.post('/user/resend-otp', resendUserOtpController)
router.post('/user/login', loginUserController)
router.post('/user/forgot-password', forgotUserPasswordController)
router.post('/user/reset-password', resetUserPasswordController)

router.post('/owner/login', loginOwnerController)

router.post('/admin/login', loginAdminController)

export default router