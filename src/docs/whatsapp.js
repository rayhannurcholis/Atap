export const whatsappWebhookPath = {
  "/whatsapp/webhook": {
    get: {
      tags: ["WhatsApp"],
      summary: "Verify WhatsApp webhook",
      description: "Endpoint verifikasi webhook dari Meta WhatsApp Cloud API.",
      parameters: [
        {
          name: "hub.mode",
          in: "query",
          schema: {
            type: "string",
            example: "subscribe",
          },
        },
        {
          name: "hub.verify_token",
          in: "query",
          schema: {
            type: "string",
            example: "your_verify_token",
          },
        },
        {
          name: "hub.challenge",
          in: "query",
          schema: {
            type: "string",
            example: "123456789",
          },
        },
      ],
      responses: {
        200: {
          description: "Webhook verified",
          content: {
            "text/plain": {
              schema: {
                type: "string",
                example: "123456789",
              },
            },
          },
        },
        403: {
          description: "Forbidden",
        },
      },
    },

    post: {
      tags: ["WhatsApp"],
      summary: "Receive WhatsApp messages",
      description: `
Menerima incoming webhook dari WhatsApp Cloud API.

Command WhatsApp yang didukung saat ini:
- DAFTAR → memulai onboarding owner
- LOGIN → generate OTP login owner
- OTP <kode> → verifikasi OTP owner
- LISTING → menampilkan listing milik owner
- UPDATE HARGA <roomTypeId> <harga> → update harga room
- UPDATE STOK <roomTypeId> <jumlah> → update stok room
      `.trim(),
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                entry: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      changes: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            value: {
                              type: "object",
                              properties: {
                                messages: {
                                  type: "array",
                                  items: {
                                    type: "object",
                                    properties: {
                                      from: {
                                        type: "string",
                                        example: "0812344444",
                                      },
                                      text: {
                                        type: "object",
                                        properties: {
                                          body: {
                                            type: "string",
                                            example: "LOGIN",
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            examples: {
              daftar: {
                summary: "Start owner onboarding",
                value: {
                  entry: [
                    {
                      changes: [
                        {
                          value: {
                            messages: [
                              {
                                from: "0812344444",
                                text: {
                                  body: "DAFTAR",
                                },
                              },
                            ],
                          },
                        },
                      ],
                    },
                  ],
                },
              },
              login: {
                summary: "Request owner OTP",
                value: {
                  entry: [
                    {
                      changes: [
                        {
                          value: {
                            messages: [
                              {
                                from: "0812344444",
                                text: {
                                  body: "LOGIN",
                                },
                              },
                            ],
                          },
                        },
                      ],
                    },
                  ],
                },
              },
              otp: {
                summary: "Verify owner OTP",
                value: {
                  entry: [
                    {
                      changes: [
                        {
                          value: {
                            messages: [
                              {
                                from: "0812344444",
                                text: {
                                  body: "OTP 602842",
                                },
                              },
                            ],
                          },
                        },
                      ],
                    },
                  ],
                },
              },
              listing: {
                summary: "Show owner listings",
                value: {
                  entry: [
                    {
                      changes: [
                        {
                          value: {
                            messages: [
                              {
                                from: "0812344444",
                                text: {
                                  body: "LISTING",
                                },
                              },
                            ],
                          },
                        },
                      ],
                    },
                  ],
                },
              },
              updateHarga: {
                summary: "Update room price",
                value: {
                  entry: [
                    {
                      changes: [
                        {
                          value: {
                            messages: [
                              {
                                from: "0812344444",
                                text: {
                                  body: "UPDATE HARGA cmnj30iaq0002rm08e8fbfscf 900000",
                                },
                              },
                            ],
                          },
                        },
                      ],
                    },
                  ],
                },
              },
              updateStok: {
                summary: "Update room stock",
                value: {
                  entry: [
                    {
                      changes: [
                        {
                          value: {
                            messages: [
                              {
                                from: "0812344444",
                                text: {
                                  body: "UPDATE STOK cmnj30iaq0002rm08e8fbfscf 2",
                                },
                              },
                            ],
                          },
                        },
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Webhook processed successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  ok: {
                    type: "boolean",
                    example: true,
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Webhook processing failed",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Webhook error",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};