import { whatsappWebhookPath } from './whatsapp'

export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'KostSolo API',
    version: '1.0.0',
    description: 'API documentation for KostSolo backend'
  },
  servers: [
    {
      url: 'http://localhost:8080'
    }
  ],
  paths: {
    ...whatsappWebhookPath,

    '/auth/user/register': {
      post: {
        tags: ['User Auth'],
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
                  email: { type: 'string', format: 'email', example: 'rehan@atap.com' },
                  password: { type: 'string', example: '123456' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Student registered successfully' },
          409: { description: 'Duplicate email' }
        }
      }
    },

    '/auth/user/verify-email': {
      post: {
        tags: ['User Auth'],
        summary: 'Verify student email',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'otp'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'rehan@atap.com' },
                  otp: { type: 'string', example: '123456' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Email verified successfully' }
        }
      }
    },

    '/auth/user/resend-otp': {
      post: {
        tags: ['User Auth'],
        summary: 'Resend OTP',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'rehan@atap.com' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'OTP resent successfully' }
        }
      }
    },

    '/auth/user/login': {
      post: {
        tags: ['User Auth'],
        summary: 'Student login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'rehan@atap.com' },
                  password: { type: 'string', example: '123456' },
                  rememberMe: { type: 'boolean', example: true }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Login success' },
          401: { description: 'Invalid credentials' }
        }
      }
    },

    '/auth/user/forgot-password': {
      post: {
        tags: ['User Auth'],
        summary: 'Forgot password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'rehan@atap.com' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Reset link requested' }
        }
      }
    },

    '/auth/user/reset-password': {
      post: {
        tags: ['User Auth'],
        summary: 'Reset password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'token', 'newPassword'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'rehan@atap.com' },
                  token: { type: 'string', example: 'reset_token' },
                  newPassword: { type: 'string', example: '654321' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Password reset successful' }
        }
      }
    },

    '/auth/owner/register': {
      post: {
        tags: ['Owner Auth'],
        summary: 'Register owner',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'phone', 'kostName', 'location', 'contact'],
                properties: {
                  name: { type: 'string', example: 'Pak Budi' },
                  email: { type: 'string', format: 'email', example: 'budi@kostsolo.id' },
                  phone: { type: 'string', example: '08123456789' },
                  kostName: { type: 'string', example: 'Kost Solo Putra' },
                  location: { type: 'string', example: 'Solo Barat' },
                  contact: { type: 'string', example: '08123456789' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Owner registered successfully' },
          409: { description: 'Phone or email already used' }
        }
      }
    },

    '/auth/owner/request-otp': {
      post: {
        tags: ['Owner Auth'],
        summary: 'Request owner OTP',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['phone'],
                properties: {
                  phone: { type: 'string', example: '08123456789' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'OTP sent successfully to email' },
          404: { description: 'Owner not found' }
        }
      }
    },

    '/auth/owner/login': {
      post: {
        tags: ['Owner Auth'],
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
          200: { description: 'Owner login success' },
          400: { description: 'Invalid OTP' },
          404: { description: 'Owner not found' }
        }
      }
    },

    '/auth/admin/login': {
      post: {
        tags: ['Admin Auth'],
        summary: 'Admin login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'admin@kostsolo.id' },
                  password: { type: 'string', example: 'Admin12345' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Admin login success' }
        }
      }
    },

    '/listings/owner': {
      post: {
        tags: ['Owner Listings'],
        summary: 'Create kost listing',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: [
                  'name',
                  'address',
                  'latitude',
                  'longitude',
                  'genderType',
                  'description',
                  'rules',
                  'contactNumber'
                ],
                properties: {
                  name: { type: 'string', example: 'Kost Solo Indah' },
                  address: { type: 'string', example: 'Jl. Adi Sucipto No. 12, Surakarta' },
                  latitude: { type: 'number', example: -7.557166 },
                  longitude: { type: 'number', example: 110.821297 },
                  genderType: {
                    type: 'string',
                    enum: ['PUTRA', 'PUTRI', 'CAMPUR'],
                    example: 'PUTRA'
                  },
                  description: {
                    type: 'string',
                    example: 'Kost nyaman dekat kampus dan akses jalan utama.'
                  },
                  rules: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['Tidak boleh merokok', 'Tidak boleh bawa hewan']
                  },
                  contactNumber: { type: 'string', example: '081234567890' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Listing created successfully' },
          400: { description: 'Invalid request body' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' }
        }
      },
      get: {
        tags: ['Owner Listings'],
        summary: 'Get owner listings',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Owner listings fetched successfully' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' }
        }
      }
    },

    '/listings/owner/{id}': {
      get: {
        tags: ['Owner Listings'],
        summary: 'Get owner listing by id',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'cmabc123listingid'
          }
        ],
        responses: {
          200: { description: 'Listing detail fetched successfully' },
          404: { description: 'Listing not found' }
        }
      },
      patch: {
        tags: ['Owner Listings'],
        summary: 'Update owner listing',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'cmabc123listingid'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Kost Solo Indah Updated' },
                  address: { type: 'string', example: 'Jl. Adi Sucipto No. 99, Surakarta' },
                  latitude: { type: 'number', example: -7.557166 },
                  longitude: { type: 'number', example: 110.821297 },
                  genderType: {
                    type: 'string',
                    enum: ['PUTRA', 'PUTRI', 'CAMPUR'],
                    example: 'PUTRA'
                  },
                  description: {
                    type: 'string',
                    example: 'Kost nyaman, bersih, dekat kampus.'
                  },
                  rules: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['Tidak boleh merokok', 'Jam malam 22:00']
                  },
                  contactNumber: { type: 'string', example: '081299998888' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Listing updated successfully' },
          400: { description: 'Invalid request body' },
          404: { description: 'Listing not found' }
        }
      }
    },

    '/listings/owner/{id}/deactivate': {
      patch: {
        tags: ['Owner Listings'],
        summary: 'Deactivate owner listing',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'cmabc123listingid'
          }
        ],
        responses: {
          200: { description: 'Listing deactivated successfully' },
          404: { description: 'Listing not found' }
        }
      }
    },

    '/listings': {
      get: {
        tags: ['Public Listings'],
        summary: 'Get active public listings',
        responses: {
          200: { description: 'Public listings fetched successfully' }
        }
      }
    },

    '/listings/{id}': {
      get: {
        tags: ['Public Listings'],
        summary: 'Get public listing detail',
        description:
          'Get full active listing detail including owner profile, room types, photos, facilities, and map coordinates',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'cmabc123listingid'
          }
        ],
        responses: {
          200: {
            description: 'Public listing detail fetched successfully',
            content: {
              'application/json': {
                example: {
                  message: 'Success',
                  data: {
                    id: 'cmabc123listingid',
                    name: 'Kost Mawar Putri',
                    address: 'Jl. Melati No. 10, Kentingan, Surakarta',
                    latitude: -7.556,
                    longitude: 110.821,
                    genderType: 'PUTRI',
                    description: 'Kost nyaman dekat kampus',
                    rules: ['Tidak boleh merokok', 'Jam malam 22:00'],
                    contactNumber: '08123456789',
                    status: 'ACTIVE',
                    isPremium: true,
                    createdAt: '2026-03-31T10:00:00.000Z',
                    updatedAt: '2026-03-31T10:00:00.000Z',
                    cheapestPrice: 750000,
                    facilities: ['WiFi', 'AC', 'Kamar Mandi Dalam'],
                    photos: [
                      {
                        id: 'cmphoto1',
                        roomTypeId: 'cmroom1',
                        roomTypeName: 'Kamar Standard',
                        url: 'https://cdn.kostsolo.com/photo1.jpg',
                        mimeType: 'image/jpeg',
                        sizeBytes: 421321,
                        sortOrder: 0
                      }
                    ],
                    owner: {
                      id: 'cmowner123',
                      name: 'Budi',
                      kostName: 'Kost Mawar Putri',
                      location: 'Kentingan',
                      contact: '08123456789'
                    },
                    roomTypes: [
                      {
                        id: 'cmroom1',
                        name: 'Kamar Standard',
                        price: 750000,
                        size: '3x4',
                        facilities: ['Kasur', 'Lemari', 'WiFi'],
                        availableCount: 3,
                        createdAt: '2026-03-31T10:00:00.000Z',
                        updatedAt: '2026-03-31T10:00:00.000Z',
                        photos: [
                          {
                            id: 'cmphoto1',
                            url: 'https://cdn.kostsolo.com/photo1.jpg',
                            mimeType: 'image/jpeg',
                            sizeBytes: 421321,
                            sortOrder: 0
                          }
                        ]
                      }
                    ]
                  }
                }
              }
            }
          },
          404: { description: 'Listing not found' }
        }
      }
    },

    '/owner/listings/{id}/room-types': {
      post: {
        tags: ['Room Types'],
        summary: 'Create room type',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'cmabc123listingid'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'price', 'size', 'facilities', 'availableCount'],
                properties: {
                  name: { type: 'string', example: 'Kamar Standard' },
                  price: { type: 'integer', example: 750000 },
                  size: { type: 'string', example: '3x4' },
                  facilities: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['Kasur', 'Lemari', 'Kamar mandi luar']
                  },
                  availableCount: { type: 'integer', example: 3 }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Room type created successfully' },
          400: { description: 'Invalid request body' },
          401: { description: 'Unauthorized' }
        }
      }
    },

    '/owner/room-types/{roomTypeId}': {
      patch: {
        tags: ['Room Types'],
        summary: 'Update room type',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'roomTypeId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'cmroomtype123'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Kamar Deluxe' },
                  price: { type: 'integer', example: 850000 },
                  size: { type: 'string', example: '4x5' },
                  facilities: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['Kasur', 'AC', 'Lemari']
                  },
                  availableCount: { type: 'integer', example: 2 }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Room type updated successfully' },
          400: { description: 'Invalid request body' },
          404: { description: 'Room type not found' }
        }
      },
      delete: {
        tags: ['Room Types'],
        summary: 'Delete room type',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'roomTypeId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'cmroomtype123'
          }
        ],
        responses: {
          200: { description: 'Room type deleted successfully' },
          404: { description: 'Room type not found' }
        }
      }
    },

    '/owner/room-types/{roomTypeId}/photos': {
      post: {
        tags: ['Photos'],
        summary: 'Upload room photos',
        description: 'Owner uploads one or more photos for a room type',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'roomTypeId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'cmroomtype123abc'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['photos'],
                properties: {
                  photos: {
                    type: 'array',
                    items: {
                      type: 'string',
                      format: 'binary'
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Photos uploaded successfully',
            content: {
              'application/json': {
                example: {
                  message: 'Photos uploaded successfully',
                  data: [
                    {
                      id: 'cmphoto123',
                      roomTypeId: 'cmroomtype123abc',
                      key: 'room-types/cmroomtype123abc/uuid-kamar.jpg',
                      url: 'https://cdn.kostsolo.com/room-types/cmroomtype123abc/uuid-kamar.jpg',
                      mimeType: 'image/jpeg',
                      sizeBytes: 421321,
                      sortOrder: 0,
                      createdAt: '2026-03-31T10:00:00.000Z',
                      updatedAt: '2026-03-31T10:00:00.000Z'
                    }
                  ]
                }
              }
            }
          },
          400: { description: 'Upload failed or validation error' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
          404: { description: 'Room type not found' }
        }
      }
    },

    '/owner/photos/{photoId}': {
      delete: {
        tags: ['Photos'],
        summary: 'Delete room photo',
        description: 'Owner deletes a photo from their own room type',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'photoId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'cmphoto123'
          }
        ],
        responses: {
          200: {
            description: 'Photo deleted successfully',
            content: {
              'application/json': {
                example: {
                  message: 'Photo deleted successfully'
                }
              }
            }
          },
          400: { description: 'Failed to delete photo' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
          404: { description: 'Photo not found' }
        }
      }
    },

    '/admin/listings/pending': {
      get: {
        tags: ['Admin Listings'],
        summary: 'Get pending listings',
        description: 'Retrieve all kost listings with status PENDING for admin review',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Pending listings fetched successfully',
            content: {
              'application/json': {
                example: {
                  message: 'Success',
                  data: [
                    {
                      id: 'cm123',
                      name: 'Kost Mawar',
                      status: 'PENDING',
                      owner: {
                        id: 'user123',
                        name: 'Budi',
                        phone: '0812344444'
                      },
                      roomTypes: []
                    }
                  ]
                }
              }
            }
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' }
        }
      }
    },

    '/admin/listings/{id}/approve': {
      patch: {
        tags: ['Admin Listings'],
        summary: 'Approve listing',
        description: 'Approve a pending listing. Listing must have at least 1 room type and 1 photo.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'cmabc123listingid'
          }
        ],
        responses: {
          200: {
            description: 'Listing approved successfully',
            content: {
              'application/json': {
                example: {
                  message: 'Listing approved successfully',
                  data: {
                    id: 'cmabc123listingid',
                    status: 'ACTIVE'
                  }
                }
              }
            }
          },
          400: {
            description: 'Listing cannot be approved (missing room type or photo)'
          },
          404: { description: 'Listing not found' }
        }
      }
    },

    '/admin/listings/{id}/reject': {
      patch: {
        tags: ['Admin Listings'],
        summary: 'Reject listing',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'cmabc123listingid'
          }
        ],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  rejectionReason: {
                    type: 'string',
                    example: 'Foto kamar belum tersedia'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Listing rejected successfully' },
          404: { description: 'Listing not found' }
        }
      }
    },

    '/admin/listings/{id}/premium': {
      patch: {
        tags: ['Admin Listings'],
        summary: 'Set premium listing status',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'cmabc123listingid'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['isPremium'],
                properties: {
                  isPremium: { type: 'boolean', example: true }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Premium status updated successfully' },
          404: { description: 'Listing not found' }
        }
      }
    },

    '/admin/dashboard': {
      get: {
        tags: ['Admin'],
        summary: 'Admin dashboard',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Admin dashboard data' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' }
        }
      }
    },

    '/listings/search': {
      get: {
        tags: ['Search & Discovery'],
        summary: 'Search active kost listings',
        description:
          'Search active listings by keyword, price range, gender type, facilities, area, nearby coordinates, and sorting option',
        parameters: [
          {
            name: 'q',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            example: 'mawar',
            description: 'Keyword search by kost name or address'
          },
          {
            name: 'minPrice',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 0 },
            example: 500000,
            description: 'Minimum monthly price filter'
          },
          {
            name: 'maxPrice',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 0 },
            example: 1500000,
            description: 'Maximum monthly price filter'
          },
          {
            name: 'genderType',
            in: 'query',
            required: false,
            schema: {
              type: 'string',
              enum: ['PUTRA', 'PUTRI', 'CAMPUR']
            },
            example: 'PUTRI',
            description: 'Filter by gender type'
          },
          {
            name: 'sort',
            in: 'query',
            required: false,
            schema: {
              type: 'string',
              enum: ['relevance', 'lowest_price', 'highest_price', 'newest']
            },
            example: 'lowest_price',
            description: 'Sort search results'
          },
          {
            name: 'facilities',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            example: 'WiFi,AC',
            description:
              'Comma-separated facilities filter. Listing must match all selected facilities'
          },
          {
            name: 'area',
            in: 'query',
            required: false,
            schema: {
              type: 'string',
              enum: ['Kentingan', 'Gonilan', 'Pabelan', 'Jajar', 'Manahan']
            },
            example: 'Kentingan',
            description: 'Preset nearby area filter'
          },
          {
            name: 'lat',
            in: 'query',
            required: false,
            schema: { type: 'number', format: 'float' },
            example: -7.556,
            description: 'Latitude for nearby search'
          },
          {
            name: 'lng',
            in: 'query',
            required: false,
            schema: { type: 'number', format: 'float' },
            example: 110.856,
            description: 'Longitude for nearby search'
          },
          {
            name: 'radiusKm',
            in: 'query',
            required: false,
            schema: { type: 'number', format: 'float', default: 2 },
            example: 2,
            description: 'Nearby search radius in kilometers'
          }
        ],
        responses: {
          200: {
            description: 'Search results fetched successfully',
            content: {
              'application/json': {
                example: {
                  message: 'Success',
                  data: [
                    {
                      id: 'cmlisting123',
                      name: 'Kost Mawar Putri',
                      address: 'Jl. Melati No. 10, Kentingan, Surakarta',
                      genderType: 'PUTRI',
                      isPremium: true,
                      latitude: -7.556,
                      longitude: 110.821,
                      createdAt: '2026-03-31T10:00:00.000Z',
                      cheapestPrice: 750000,
                      thumbnailUrl: 'https://cdn.kostsolo.com/room-types/cmroom123/photo1.jpg',
                      facilities: ['WiFi', 'AC'],
                      distanceKm: 1.2
                    }
                  ]
                }
              }
            }
          },
          400: {
            description: 'Invalid search query or failed to search listings'
          }
        }
      }
    },
        '/listings/{id}': {
      get: {
        tags: ['Public Listings'],
        summary: 'Get public listing detail',
        description:
          'Get full active listing detail including owner profile, room types, photos, facilities, and map coordinates',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'cmabc123listingid'
          }
        ],
        responses: {
          200: {
            description: 'Public listing detail fetched successfully'
          },
          404: { description: 'Listing not found' }
        }
      }
    },

    '/favorites': {
      get: {
        tags: ['Favorites'],
        summary: 'Get user favorite listings',
        description: 'Get all favorite listings saved by the authenticated student/user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Favorite listings fetched successfully',
            content: {
              'application/json': {
                example: {
                  message: 'Success',
                  data: [
                    {
                      id: 'cmlisting123',
                      name: 'Kost Mawar Putri',
                      address: 'Jl. Melati No. 10, Kentingan, Surakarta',
                      genderType: 'PUTRI',
                      isPremium: true,
                      latitude: -7.556,
                      longitude: 110.821,
                      cheapestPrice: 750000,
                      thumbnailUrl: 'https://cdn.kostsolo.com/room-types/cmroom123/photo1.jpg'
                    }
                  ]
                }
              }
            }
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' }
        }
      }
    },

    '/favorites/{listingId}': {
      post: {
        tags: ['Favorites'],
        summary: 'Add listing to favorites',
        description: 'Save a listing to the authenticated student/user favorites',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'listingId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'cmo1o24e50003rm0ky4uu9shm'
          }
        ],
        responses: {
          200: {
            description: 'Listing added to favorites',
            content: {
              'application/json': {
                example: {
                  message: 'Added to favorites'
                }
              }
            }
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
          404: { description: 'Listing not found' }
        }
      },
      delete: {
        tags: ['Favorites'],
        summary: 'Remove listing from favorites',
        description: 'Remove a listing from the authenticated student/user favorites',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'listingId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'cmo1o24e50003rm0ky4uu9shm'
          }
        ],
        responses: {
          200: {
            description: 'Listing removed from favorites',
            content: {
              'application/json': {
                example: {
                  message: 'Removed from favorites'
                }
              }
            }
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' }
        }
      }
    },
    '/chats/start': {
  post: {
    tags: ['Chat'],
    summary: 'Start chat thread with owner',
    description:
      'Create or get an existing chat thread between the authenticated student and the owner of a listing',
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['listingId'],
            properties: {
              listingId: {
                type: 'string',
                example: 'cmo1o24e50003rm0ky4uu9shm'
              },
              initialMessage: {
                type: 'string',
                example: 'Halo, kamar ini masih tersedia?'
              }
            }
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Chat thread ready',
        content: {
          'application/json': {
            example: {
              message: 'Chat thread ready',
              data: {
                id: 'cmo40g31f0001rmqky2t7gbyd',
                listing: {
                  id: 'cmo1o24e50003rm0ky4uu9shm',
                  name: 'Kost Solo Indah'
                },
                student: {
                  id: 'cmo33zcne0000rm80yc6kshaz',
                  name: 'Rayhan'
                },
                owner: {
                  id: 'cmnyuqvxj0000rm48l9r5lket',
                  name: 'Rehan',
                  kostName: 'Kost Solo Putra'
                },
                messages: [
                  {
                    id: 'cmo40g31f0003rmqkh00zmrjb',
                    senderId: 'cmo33zcne0000rm80yc6kshaz',
                    message: 'Halo, kamar ini masih tersedia?',
                    sentAt: '2026-04-18T07:23:21.314Z',
                    readAt: null
                  }
                ],
                createdAt: '2026-04-18T07:23:21.314Z',
                updatedAt: '2026-04-18T07:23:21.314Z'
              }
            }
          }
        }
      },
      400: { description: 'Invalid request or cannot chat with own listing' },
      401: { description: 'Unauthorized' },
      403: { description: 'Forbidden' },
      404: { description: 'Listing not found' }
    }
  }
},

'/chats': {
  get: {
    tags: ['Chat'],
    summary: 'Get my chat threads',
    description:
      'Get all chat threads for the authenticated user. Students see their chats with owners, owners see chats from students.',
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'Chat threads fetched successfully',
        content: {
          'application/json': {
            example: {
              message: 'Success',
              data: [
                {
                  id: 'cmo40g31f0001rmqky2t7gbyd',
                  listing: {
                    id: 'cmo1o24e50003rm0ky4uu9shm',
                    name: 'Kost Solo Indah'
                  },
                  displayName: 'Kost Solo Putra',
                  student: {
                    id: 'cmo33zcne0000rm80yc6kshaz',
                    name: 'Rayhan'
                  },
                  owner: {
                    id: 'cmnyuqvxj0000rm48l9r5lket',
                    name: 'Rehan',
                    kostName: 'Kost Solo Putra'
                  },
                  lastMessage: {
                    id: 'cmo40g31f0003rmqkh00zmrjb',
                    senderId: 'cmo33zcne0000rm80yc6kshaz',
                    message: 'Halo, kamar ini masih tersedia?',
                    sentAt: '2026-04-18T07:23:21.314Z',
                    readAt: null
                  },
                  updatedAt: '2026-04-18T07:23:21.314Z',
                  createdAt: '2026-04-18T07:23:21.314Z'
                }
              ]
            }
          }
        }
      },
      401: { description: 'Unauthorized' }
    }
  }
},

'/chats/{threadId}': {
  get: {
    tags: ['Chat'],
    summary: 'Get chat thread detail',
    description: 'Get all messages in a chat thread accessible by the authenticated user',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'threadId',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        example: 'cmo40g31f0001rmqky2t7gbyd'
      }
    ],
    responses: {
      200: {
        description: 'Chat thread detail fetched successfully',
        content: {
          'application/json': {
            example: {
              message: 'Success',
              data: {
                id: 'cmo40g31f0001rmqky2t7gbyd',
                listing: {
                  id: 'cmo1o24e50003rm0ky4uu9shm',
                  name: 'Kost Solo Indah'
                },
                student: {
                  id: 'cmo33zcne0000rm80yc6kshaz',
                  name: 'Rayhan'
                },
                owner: {
                  id: 'cmnyuqvxj0000rm48l9r5lket',
                  name: 'Rehan',
                  kostName: 'Kost Solo Putra'
                },
                messages: [
                  {
                    id: 'cmo40g31f0003rmqkh00zmrjb',
                    senderId: 'cmo33zcne0000rm80yc6kshaz',
                    message: 'Halo, kamar ini masih tersedia?',
                    sentAt: '2026-04-18T07:23:21.314Z',
                    readAt: null
                  }
                ],
                createdAt: '2026-04-18T07:23:21.314Z',
                updatedAt: '2026-04-18T07:23:21.314Z'
              }
            }
          }
        }
      },
      401: { description: 'Unauthorized' },
      404: { description: 'Chat thread not found' }
    }
  }
},

'/chats/{threadId}/messages': {
  post: {
    tags: ['Chat'],
    summary: 'Send chat message',
    description: 'Send a new message to an existing chat thread',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'threadId',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        example: 'cmo40g31f0001rmqky2t7gbyd'
      }
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['message'],
            properties: {
              message: {
                type: 'string',
                example: 'Bisa survey hari ini?'
              }
            }
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Message sent successfully',
        content: {
          'application/json': {
            example: {
              message: 'Message sent',
              data: {
                id: 'cmo40g31f0001rmqky2t7gbyd',
                listing: {
                  id: 'cmo1o24e50003rm0ky4uu9shm',
                  name: 'Kost Solo Indah'
                },
                student: {
                  id: 'cmo33zcne0000rm80yc6kshaz',
                  name: 'Rayhan'
                },
                owner: {
                  id: 'cmnyuqvxj0000rm48l9r5lket',
                  name: 'Rehan',
                  kostName: 'Kost Solo Putra'
                },
                messages: [
                  {
                    id: 'cmo40g31f0003rmqkh00zmrjb',
                    senderId: 'cmo33zcne0000rm80yc6kshaz',
                    message: 'Halo, kamar ini masih tersedia?',
                    sentAt: '2026-04-18T07:23:21.314Z',
                    readAt: null
                  },
                  {
                    id: 'cmo40msg90007rmqkabc12345',
                    senderId: 'cmo33zcne0000rm80yc6kshaz',
                    message: 'Bisa survey hari ini?',
                    sentAt: '2026-04-18T07:30:00.000Z',
                    readAt: null
                  }
                ],
                createdAt: '2026-04-18T07:23:21.314Z',
                updatedAt: '2026-04-18T07:30:00.000Z'
              }
            }
          }
        }
      },
      400: { description: 'Invalid request body' },
      401: { description: 'Unauthorized' },
      404: { description: 'Chat thread not found' }
    }
  }
},

'/listings/{id}/view': {
  post: {
    tags: ['Views'],
    summary: 'Track listing view',
    description:
      'Track a listing detail page view. Supports guest and authenticated users with 1-hour deduplication for the same user/session.',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        example: 'cmo1o24e50003rm0ky4uu9shm'
      },
      {
        name: 'x-session-key',
        in: 'header',
        required: false,
        schema: { type: 'string' },
        example: 'guest-session-abc123'
      }
    ],
    responses: {
      200: {
        description: 'View tracked successfully',
        content: {
          'application/json': {
            examples: {
              counted: {
                summary: 'View counted',
                value: {
                  message: 'View counted successfully',
                  data: {
                    counted: true
                  }
                }
              },
              deduplicated: {
                summary: 'View not counted due to 1-hour deduplication',
                value: {
                  message: 'View already counted within 1 hour',
                  data: {
                    counted: false
                  }
                }
              }
            }
          }
        }
      },
      404: {
        description: 'Listing not found'
      },
      400: {
        description: 'Failed to track listing view'
      }
    }
  }
},

'/owner/listings/{id}/views': {
  get: {
    tags: ['Views'],
    summary: 'Get owner listing view summary',
    description:
      'Get totalViews and todayViews for a listing owned by the authenticated owner.',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        example: 'cmo1o24e50003rm0ky4uu9shm'
      }
    ],
    responses: {
      200: {
        description: 'Listing view summary retrieved successfully',
        content: {
          'application/json': {
            example: {
              message: 'Success',
              data: {
                listingId: 'cmo1o24e50003rm0ky4uu9shm',
                totalViews: 128,
                todayViews: 7
              }
            }
          }
        }
      },
      401: {
        description: 'Unauthorized'
      },
      403: {
        description: 'Forbidden'
      },
      404: {
        description: 'Listing not found'
      },
      400: {
        description: 'Failed to get listing view summary'
      }
    }
  }
},

'/listings/{id}/report': {
  post: {
    tags: ['Reports'],
    summary: 'Report listing',
    description: 'User reports a listing as inaccurate, closed, or fraudulent.',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        example: 'cmo1o24e50003rm0ky4uu9shm'
      }
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['reason'],
            properties: {
              reason: {
                type: 'string',
                enum: [
                  'TIDAK_AKTIF',
                  'FOTO_TIDAK_SESUAI',
                  'INFORMASI_SALAH',
                  'PENIPUAN'
                ],
                example: 'INFORMASI_SALAH'
              },
              note: {
                type: 'string',
                example: 'Harga tidak sesuai saat dihubungi'
              }
            }
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Listing reported successfully',
        content: {
          'application/json': {
            example: {
              message: 'Listing reported successfully',
              data: {
                id: 'cmreport123',
                listingId: 'cmo1o24e50003rm0ky4uu9shm',
                reason: 'INFORMASI_SALAH'
              }
            }
          }
        }
      },
      400: {
        description: 'Failed to report listing'
      },
      401: {
        description: 'Unauthorized'
      },
      404: {
        description: 'Listing not found'
      }
    }
  }
},

'/owner/dashboard': {
  get: {
    tags: ['Owner'],
    summary: 'Get owner dashboard summary',
    description: 'Get listing stats, views, and leads for the owner dashboard.',
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'Dashboard summary retrieved successfully',
        content: {
          'application/json': {
            example: {
              message: 'Success',
              data: {
                totalListings: 3,
                activeListings: 2,
                totalViews: 128,
                todayViews: 7,
                weeklyViews: 31,
                totalLeads: 15,
                activeChats: 4
              }
            }
          }
        }
      },
      401: {
        description: 'Unauthorized'
      },
      403: {
        description: 'Forbidden'
      },
      400: {
        description: 'Failed to get dashboard summary'
      }
    }
  }
},

'/owner/listings/{id}/analytics': {
  get: {
    tags: ['Owner'],
    summary: 'Get owner listing analytics',
    description: 'Get analytics summary for one owner listing, including views, leads, active chats, and daily views for the last 7 days.',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        example: 'cmo1o24e50003rm0ky4uu9shm'
      }
    ],
    responses: {
      200: {
        description: 'Listing analytics retrieved successfully',
        content: {
          'application/json': {
            example: {
              message: 'Success',
              data: {
                listingId: 'cmo1o24e50003rm0ky4uu9shm',
                listingName: 'Kost Solo Indah',
                status: 'ACTIVE',
                totalViews: 128,
                todayViews: 7,
                weeklyViews: 31,
                totalLeads: 15,
                activeChats: 4,
                viewsPerDay: [
                  { date: '2026-04-12', views: 2 },
                  { date: '2026-04-13', views: 5 },
                  { date: '2026-04-14', views: 3 },
                  { date: '2026-04-15', views: 7 },
                  { date: '2026-04-16', views: 4 },
                  { date: '2026-04-17', views: 6 },
                  { date: '2026-04-18', views: 4 }
                ]
              }
            }
          }
        }
      },
      401: {
        description: 'Unauthorized'
      },
      403: {
        description: 'Forbidden'
      },
      404: {
        description: 'Listing not found'
      },
      400: {
        description: 'Failed to get listing analytics'
      }
    }
  }
},
'/admin/dashboard': {
  get: {
    tags: ['Admin'],
    summary: 'Get admin dashboard summary',
    description: 'Get platform summary metrics for admin dashboard.',
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'Admin dashboard summary retrieved successfully',
        content: {
          'application/json': {
            example: {
              message: 'Success',
              data: {
                totalListings: 120,
                activeListings: 98,
                totalStudents: 540,
                totalOwners: 76,
                newUsersThisWeek: 32,
                totalViewsToday: 187
              }
            }
          }
        }
      },
      401: { description: 'Unauthorized' },
      403: { description: 'Forbidden' },
      400: { description: 'Failed to get admin dashboard summary' }
    }
  }
},

'/admin/analytics/top-listings': {
  get: {
    tags: ['Admin'],
    summary: 'Get top viewed listings',
    description: 'Get top listings ranked by total views.',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: { type: 'integer', default: 10 },
        example: 10
      }
    ],
    responses: {
      200: {
        description: 'Top listings retrieved successfully',
        content: {
          'application/json': {
            example: {
              message: 'Success',
              data: [
                {
                  id: 'cmo1o24e50003rm0ky4uu9shm',
                  name: 'Kost Solo Indah',
                  status: 'ACTIVE',
                  owner: {
                    id: 'cmnyuqvxj0000rm48l9r5lket',
                    name: 'Rehan'
                  },
                  totalViews: 128,
                  totalLeads: 15,
                  totalFavorites: 23
                },
                {
                  id: 'cmo1o24e50003rm0ky4uu9abc',
                  name: 'Kost Putri Manahan',
                  status: 'ACTIVE',
                  owner: {
                    id: 'cmnyuqvxj0000rm48l9r5lxyz',
                    name: 'Nadia'
                  },
                  totalViews: 101,
                  totalLeads: 11,
                  totalFavorites: 19
                }
              ]
            }
          }
        }
      },
      401: { description: 'Unauthorized' },
      403: { description: 'Forbidden' },
      400: { description: 'Failed to get top listings' }
    }
  }
},
'/admin/reports': {
  get: {
    tags: ['Admin'],
    summary: 'Get listing reports',
    description: 'Get reported listings for admin review.',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'status',
        in: 'query',
        required: false,
        schema: {
          type: 'string',
          enum: ['PENDING', 'DISMISSED', 'RESOLVED']
        },
        example: 'PENDING'
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          default: 20
        },
        example: 20
      }
    ],
    responses: {
      200: {
        description: 'Reports retrieved successfully',
        content: {
          'application/json': {
            example: {
              message: 'Success',
              data: [
                {
                  id: 'cmreport123',
                  listingId: 'cmo1o24e50003rm0ky4uu9shm',
                  userId: 'cmo33zcne0000rm80yc6kshaz',
                  reason: 'INFORMASI_SALAH',
                  note: 'Harga tidak sesuai saat dihubungi',
                  status: 'PENDING',
                  action: null,
                  reviewedAt: null,
                  reviewedById: null,
                  createdAt: '2026-04-18T08:00:00.000Z',
                  listing: {
                    id: 'cmo1o24e50003rm0ky4uu9shm',
                    name: 'Kost Solo Indah',
                    status: 'ACTIVE',
                    ownerId: 'cmnyuqvxj0000rm48l9r5lket'
                  },
                  user: {
                    id: 'cmo33zcne0000rm80yc6kshaz',
                    name: 'Rayhan',
                    email: 'rayhan@example.com'
                  },
                  reviewedBy: null
                }
              ]
            }
          }
        }
      },
      401: { description: 'Unauthorized' },
      403: { description: 'Forbidden' },
      400: { description: 'Failed to get reports' }
    }
  }
},

'/admin/reports/{id}': {
  patch: {
    tags: ['Admin'],
    summary: 'Review listing report',
    description: 'Review a report by dismissing it or deactivating the related listing.',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        example: 'cmreport123'
      }
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['action'],
            properties: {
              action: {
                type: 'string',
                enum: ['DISMISS', 'DEACTIVATE_LISTING'],
                example: 'DEACTIVATE_LISTING'
              }
            }
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Report reviewed successfully',
        content: {
          'application/json': {
            examples: {
              dismiss: {
                summary: 'Dismiss report',
                value: {
                  message: 'Report dismissed successfully',
                  data: {
                    id: 'cmreport123',
                    status: 'DISMISSED',
                    action: 'DISMISS',
                    listingId: 'cmo1o24e50003rm0ky4uu9shm'
                  }
                }
              },
              deactivate: {
                summary: 'Deactivate related listing',
                value: {
                  message: 'Report reviewed and listing deactivated successfully',
                  data: {
                    id: 'cmreport123',
                    status: 'RESOLVED',
                    action: 'DEACTIVATE_LISTING',
                    listingId: 'cmo1o24e50003rm0ky4uu9shm'
                  }
                }
              }
            }
          }
        }
      },
      400: { description: 'Invalid action or report already reviewed' },
      401: { description: 'Unauthorized' },
      403: { description: 'Forbidden' },
      404: { description: 'Report not found' }
    }
  }
},
'/leads': {
  get: {
    tags: ['Leads'],
    summary: 'Get all leads (admin)',
    description: 'Admin retrieves listing leads with optional filter by listing.',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'listingId',
        in: 'query',
        required: false,
        schema: { type: 'string' },
        example: 'cmoebxvgw0002rmc0hmikwlpg'
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          default: 20
        },
        example: 20
      }
    ],
    responses: {
      200: {
        description: 'Leads retrieved successfully',
        content: {
          'application/json': {
            example: {
              message: 'Success',
              data: [
                {
                  id: 'cmlead123',
                  listingId: 'cmoebxvgw0002rmc0hmikwlpg',
                  userId: 'cmuser123',
                  createdAt: '2026-05-09T10:00:00.000Z',
                  user: {
                    id: 'cmuser123',
                    name: 'Rayhan',
                    email: 'rayhan@gmail.com',
                    phone: '08123456789',
                    role: 'USER'
                  },
                  listing: {
                    id: 'cmoebxvgw0002rmc0hmikwlpg',
                    name: 'Kost Solo Indah',
                    status: 'ACTIVE',
                    ownerId: 'cmowner123',
                    contactNumber: '08123456789'
                  }
                }
              ]
            }
          }
        }
      },
      401: { description: 'Unauthorized' },
      403: { description: 'Forbidden' },
      400: { description: 'Failed to get leads' }
    }
  }
},

'/leads/{id}': {
  post: {
    tags: ['Leads'],
    summary: 'Create guest lead',
    description: 'Guest user submit interest to listing without login',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: {
          type: 'string'
        },
        example: 'cmoebxvgw0002rmc0hmikwlpg'
      }
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['name', 'phone'],
            properties: {
              name: {
                type: 'string',
                example: 'Rayhan'
              },
              phone: {
                type: 'string',
                example: '08123456789'
              },
              email: {
                type: 'string',
                nullable: true,
                example: 'rayhan@gmail.com'
              }
            }
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Lead created successfully',
        content: {
          'application/json': {
            example: {
              message: 'Lead created successfully',
              data: {
                id: 'cmlead123',
                listingId: 'cmoebxvgw0002rmc0hmikwlpg',
                userId: 'cmuser123',
                source: 'WEB',
                createdAt: '2026-05-09T10:00:00.000Z'
              }
            }
          }
        }
      },
      400: {
        description: 'Validation error'
      }
    }
  }
},

'/leads/{id}/auth': {
  post: {
    tags: ['Leads'],
    summary: 'Create authenticated lead',
    description: 'Logged in user submit interest to listing',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: {
          type: 'string'
        },
        example: 'cmoebxvgw0002rmc0hmikwlpg'
      }
    ],
    responses: {
      200: {
        description: 'Lead created successfully',
        content: {
          'application/json': {
            example: {
              message: 'Lead created successfully',
              data: {
                id: 'cmlead123',
                listingId: 'cmoebxvgw0002rmc0hmikwlpg',
                userId: 'cmuser123',
                source: 'WEB',
                createdAt: '2026-05-09T10:00:00.000Z'
              }
            }
          }
        }
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