import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/requireAuth";
import { asyncHandler } from "../middleware/asyncHandler";
import { createConnectSession } from "../integrations/bridge";
import { countryCodeFor, ensureBridgeUser, getUserAccessToken, syncItem } from "../services/bridgeSync";

const router = Router();

router.use(requireAuth);

router.post(
  "/connect-session",
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.session.userId } });

    await ensureBridgeUser(user.id);
    const accessToken = await getUserAccessToken(user.id);

    const session = await createConnectSession({
      accessToken,
      userEmail: user.email,
      countryCode: countryCodeFor(user.country),
      callbackUrl: `${process.env.CLIENT_URL}/accounts`,
    });

    res.json({ url: session.url });
  }),
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const connections = await prisma.bankConnection.findMany({
      where: { userId: req.session.userId },
      include: { accounts: true },
    });
    res.json(connections);
  }),
);

router.post(
  "/:itemId/sync",
  asyncHandler(async (req, res) => {
    const itemId = Number(req.params.itemId);
    if (!Number.isInteger(itemId)) {
      return res.status(400).json({ error: "itemId invalide" });
    }

    // Pas de vérification de propriété préalable ici: le token Bridge de
    // l'utilisateur courant est scopé à ses propres items côté Bridge, qui
    // rejettera lui-même toute tentative sur un item d'un autre utilisateur.
    const existing = await prisma.bankConnection.findUnique({ where: { providerItemId: String(itemId) } });
    if (existing && existing.userId !== req.session.userId) {
      return res.status(404).json({ error: "Connexion introuvable" });
    }

    await syncItem(req.session.userId!, itemId);
    res.status(204).end();
  }),
);

export default router;
