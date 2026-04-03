import { whatsappService } from "./whatsapp.service.js";

export const whatsappController = {
  async verifyWebhook(c) {
    const mode = c.req.query("hub.mode");
    const token = c.req.query("hub.verify_token");
    const challenge = c.req.query("hub.challenge");

    if (
      mode === "subscribe" &&
      token === process.env.WHATSAPP_VERIFY_TOKEN
    ) {
      return c.text(challenge || "", 200);
    }

    return c.text("Forbidden", 403);
  },

  async handleWebhook(c) {
    try {
      const body = await c.req.json();

      await whatsappService.handleWebhookPayload(body);

      return c.json({ ok: true });
    } catch (error) {
      return c.json(
        { message: error.message || "Webhook error" },
        400
      );
    }
  },
};