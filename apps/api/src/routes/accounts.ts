import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/requireAuth";
import { asyncHandler } from "../middleware/asyncHandler";
import { deleteItem } from "../integrations/bridge";
import { getUserAccessToken } from "../services/bridgeSync";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const accounts = await prisma.account.findMany({
      where: { userId: req.session.userId },
      include: { bankConnection: true, goal: { select: { id: true } } },
      orderBy: { createdAt: "asc" },
    });
    res.json(accounts.map((a) => ({ ...a, goalId: a.goal?.id ?? null, goal: undefined })));
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const account = await prisma.account.findUnique({ where: { id: req.params.id } });
    if (!account || account.userId !== req.session.userId) {
      return res.status(404).json({ error: "Compte introuvable" });
    }

    const { name, hidden } = req.body as { name?: string; hidden?: boolean };
    const updated = await prisma.account.update({
      where: { id: account.id },
      data: {
        ...(typeof name === "string" && name.trim() ? { name: name.trim() } : {}),
        ...(typeof hidden === "boolean" ? { hidden } : {}),
      },
      include: { bankConnection: true, goal: { select: { id: true } } },
    });
    res.json({ ...updated, goalId: updated.goal?.id ?? null, goal: undefined });
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const account = await prisma.account.findUnique({
      where: { id: req.params.id },
      include: { bankConnection: { include: { accounts: true } } },
    });
    if (!account || account.userId !== req.session.userId) {
      return res.status(404).json({ error: "Compte introuvable" });
    }

    await prisma.account.delete({ where: { id: account.id } });

    const connection = account.bankConnection;
    const wasLastAccount = connection && connection.accounts.length <= 1;

    if (connection && wasLastAccount) {
      try {
        const accessToken = await getUserAccessToken(req.session.userId!);
        await deleteItem(accessToken, Number(connection.providerItemId));
      } catch (err) {
        console.error("Failed to delete Bridge item on disconnect:", err);
      }
      await prisma.bankConnection.update({ where: { id: connection.id }, data: { status: "DISCONNECTED" } });
    }

    res.status(204).end();
  }),
);

export default router;
