export const apiDocs = {
  name: 'KostSolo API',
  version: '1.0.0',
  baseUrl: 'http://localhost:3000',
  endpoints: [
    {
      module: 'Auth',
      name: 'Register User',
      method: 'POST',
      path: '/auth/user/register',
      body: {
        name: 'Rehan',
        email: 'rehan@atap.com',
        password: '123456'
      },
      response: {
        message: 'Registration success. Please verify your email OTP.',
        user: {
          id: 'cuid',
          name: 'Rehan',
          email: 'rehan@atap.com',
          role: 'USER',
          isEmailVerified: false
        }
      }
    },
    {
      module: 'Auth',
      name: 'Verify User Email',
      method: 'POST',
      path: '/auth/user/verify-email',
      body: {
        email: 'rehan@atap.com',
        otp: '123456'
      },
      response: {
        message: 'Email verified successfully'
      }
    },
    {
      module: 'Auth',
      name: 'Resend OTP',
      method: 'POST',
      path: '/auth/user/resend-otp',
      body: {
        email: 'rehan@atap.com'
      },
      response: {
        message: 'OTP resent successfully'
      }
    },
    {
      module: 'Auth',
      name: 'Login User',
      method: 'POST',
      path: '/auth/user/login',
      body: {
        email: 'rehan@atap.com',
        password: '123456',
        rememberMe: true
      },
      response: {
        message: 'User login success',
        token: 'jwt_token',
        expiresInDays: 30,
        user: {
          id: 'cuid',
          name: 'Rehan',
          email: 'rehan@atap.com',
          role: 'USER'
        }
      }
    },
    {
      module: 'Auth',
      name: 'Forgot Password',
      method: 'POST',
      path: '/auth/user/forgot-password',
      body: {
        email: 'rehan@atap.com'
      },
      response: {
        message: 'If the email is registered, a reset link has been sent.'
      }
    },
    {
      module: 'Auth',
      name: 'Reset Password',
      method: 'POST',
      path: '/auth/user/reset-password',
      body: {
        email: 'rehan@atap.com',
        token: 'reset_token_dari_email',
        newPassword: '654321'
      },
      response: {
        message: 'Password reset successful'
      }
    },
    {
      module: 'Auth',
      name: 'Owner Login',
      method: 'POST',
      path: '/auth/owner/login',
      body: {
        phone: '08123456789',
        otp: '123456'
      },
      response: {
        message: 'Owner login success',
        token: 'jwt_token',
        expiresInDays: 1
      }
    },
    {
      module: 'Auth',
      name: 'Admin Login',
      method: 'POST',
      path: '/auth/admin/login',
      body: {
        email: 'admin@kostsolo.id',
        password: 'Admin12345'
      },
      response: {
        message: 'Admin login success',
        token: 'jwt_token',
        user: {
          id: 'cuid',
          name: 'Super Admin',
          email: 'admin@kostsolo.id',
          role: 'ADMIN'
        }
      }
    }
  ]
}