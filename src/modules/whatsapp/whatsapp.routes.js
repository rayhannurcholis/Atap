import { Hono } from "hono";
import { whatsappController } from "./whatsapp.controller.js";

const router = new Hono();

router.get("/webhook", whatsappController.verifyWebhook);
router.post("/webhook", whatsappController.handleWebhook);

export default router;