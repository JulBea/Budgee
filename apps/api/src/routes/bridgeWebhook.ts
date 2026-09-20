import { Router } from "express";
import { verifyBridgeWebhookSignature } from "../integrations/bridge";
import { syncItem } from "../services/bridgeSync";
import { prisma } from "../prisma";

const router = Router();

interface BridgeWebhookPayload {
  type: string;
  timestamp: number;
  content: {
    user_uuid?: string;
    item_id?: number;
    account_id?: number;
  };
}

const SYNC_EVENTS = new Set(["item.created", "item.refreshed", "item.account.created", "item.account.updated"]);

router.post("/", (req, res) => {
  const rawBody = req.body as Buffer;
  const signature = req.header("BridgeApi-Signature");

  if (!verifyBridgeWebhookSignature(rawBody, signature, process.env.BRIDGE_WEBHOOK_SECRET!)) {
    return res.status(401).json({ error: "Signature invalide" });
  }

  // On répond tout de suite: le traitement ne doit pas bloquer Bridge.
  // Toute erreur après ce point est interceptée localement (une exception
  // non rattrapée ici ferait planter tout le process Node).
  res.status(200).end();

  void processWebhook(rawBody).catch((err) => {
    console.error("Bridge webhook processing failed:", err);
  });
});

async function processWebhook(rawBody: Buffer): Promise<void> {
  const payload: BridgeWebhookPayload = JSON.parse(rawBody.toString("utf-8"));

  if (!SYNC_EVENTS.has(payload.type)) return;

  const { user_uuid, item_id } = payload.content;
  if (!user_uuid || !item_id) return;

  const user = await prisma.user.findUnique({ where: { bridgeUserUuid: user_uuid } });
  if (!user) return;

  await syncItem(user.id, item_id);
}

export default router;
