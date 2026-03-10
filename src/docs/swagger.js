export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'KostSolo API',
    version: '1.0.0',
    description: 'API documentation for KostSolo backend'
  },
  servers: [
    {
      url: 'http://localhost:3000'
    }
  ],
  paths: {
    '/auth/user/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register student',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Rehan' },
                  email: { type: 'string', example: 'rehan@atap.com' },
                  password: { type: 'string', example: '123456' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Student registered successfully'
          },
          409: {
            description: 'Duplicate email'
          }
        }
      }
    },

    '/auth/user/verify-email': {
      post: {
        tags: ['Auth'],
        summary: 'Verify student email',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'otp'],
                properties: {
                  email: { type: 'string', example: 'rehan@atap.com' },
                  otp: { type: 'string', example: '123456' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Email verified successfully'
          }
        }
      }
    },

    '/auth/user/resend-otp': {
      post: {
        tags: ['Auth'],
        summary: 'Resend OTP',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', example: 'rehan@atap.com' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'OTP resent successfully'
          }
        }
      }
    },

    '/auth/user/login': {
      post: {
        tags: ['Auth'],
        summary: 'Student login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'rehan@atap.com' },
                  password: { type: 'string', example: '123456' },
                  rememberMe: { type: 'boolean', example: true }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Login success'
          },
          401: {
            description: 'Invalid credentials'
          }
        }
      }
    },

    '/auth/user/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Forgot password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', example: 'rehan@atap.com' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Reset link requested'
          }
        }
      }
    },

    '/auth/user/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Reset password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'token', 'newPassword'],
                properties: {
                  email: { type: 'string', example: 'rehan@atap.com' },
                  token: { type: 'string', example: 'reset_token' },
                  newPassword: { type: 'string', example: '654321' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Password reset successful'
          }
        }
      }
    },

    '/auth/owner/login': {
      post: {
        tags: ['Auth'],
        summary: 'Owner login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['phone', 'otp'],
                properties: {
                  phone: { type: 'string', example: '08123456789' },
                  otp: { type: 'string', example: '123456' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Owner login success'
          }
        }
      }
    },

    '/auth/admin/login': {
      post: {
        tags: ['Auth'],
        summary: 'Admin login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'admin@kostsolo.id' },
                  password: { type: 'string', example: 'Admin12345' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Admin login success'
          }
        }
      }
    },

    '/admin/dashboard': {
      get: {
        tags: ['Admin'],
        summary: 'Admin dashboard',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Admin dashboard data'
          },
          401: {
            description: 'Unauthorized'
          },
          403: {
            description: 'Forbidden'
          }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  }
}