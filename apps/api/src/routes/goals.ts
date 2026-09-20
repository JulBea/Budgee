import { Prisma } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/requireAuth";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const goals = await prisma.goal.findMany({
      where: { userId: req.session.userId },
      include: { account: true },
      orderBy: { createdAt: "asc" },
    });
    res.json(goals);
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, target, accountId } = req.body as { name?: string; target?: number; accountId?: string | null };
    if (!name?.trim() || typeof target !== "number" || target <= 0) {
      return res.status(400).json({ error: "name et target (positif) requis" });
    }

    let saved = 0;
    if (accountId) {
      const account = await prisma.account.findUnique({ where: { id: accountId } });
      if (!account || account.userId !== req.session.userId) {
        return res.status(400).json({ error: "Compte invalide" });
      }
      saved = Number(account.balance);
    }

    try {
      const goal = await prisma.goal.create({
        data: { userId: req.session.userId!, name: name.trim(), target, saved, accountId: accountId || null },
        include: { account: true },
      });
      res.status(201).json(goal);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        return res.status(409).json({ error: "Ce compte est déjà lié à un autre objectif" });
      }
      throw err;
    }
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const goal = await prisma.goal.findUnique({ where: { id: req.params.id } });
    if (!goal || goal.userId !== req.session.userId) {
      return res.status(404).json({ error: "Objectif introuvable" });
    }

    const { name, target, addAmount, accountId } = req.body as {
      name?: string;
      target?: number;
      addAmount?: number;
      accountId?: string | null;
    };

    let savedOverride: number | undefined;
    if (accountId !== undefined && accountId !== null) {
      const account = await prisma.account.findUnique({ where: { id: accountId } });
      if (!account || account.userId !== req.session.userId) {
        return res.status(400).json({ error: "Compte invalide" });
      }
      savedOverride = Number(account.balance);
    }

    try {
      const updated = await prisma.goal.update({
        where: { id: goal.id },
        data: {
          ...(name?.trim() ? { name: name.trim() } : {}),
          ...(typeof target === "number" && target > 0 ? { target } : {}),
          ...(accountId !== undefined ? { accountId } : {}),
          ...(savedOverride !== undefined ? { saved: savedOverride } : {}),
          // L'ajout manuel n'a de sens que pour un objectif sans compte lié
          // (le solde du compte fait déjà foi sinon).
          ...(typeof addAmount === "number" && !goal.accountId && accountId === undefined
            ? { saved: { increment: addAmount } }
            : {}),
        },
        include: { account: true },
      });
      res.json(updated);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        return res.status(409).json({ error: "Ce compte est déjà lié à un autre objectif" });
      }
      throw err;
    }
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const goal = await prisma.goal.findUnique({ where: { id: req.params.id } });
    if (!goal || goal.userId !== req.session.userId) {
      return res.status(404).json({ error: "Objectif introuvable" });
    }
    await prisma.goal.delete({ where: { id: goal.id } });
    res.status(204).end();
  }),
);

export default router;
