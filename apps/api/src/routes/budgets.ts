import { Prisma } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/requireAuth";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

router.use(requireAuth);

function startOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const budgets = await prisma.budget.findMany({
      where: { userId: req.session.userId },
      include: { category: true },
      orderBy: { createdAt: "asc" },
    });

    const spentByCategory = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        account: { userId: req.session.userId },
        date: { gte: startOfMonth() },
        amount: { lt: 0 },
      },
      _sum: { amount: true },
    });
    const spentMap = new Map(spentByCategory.map((s) => [s.categoryId, Math.abs(Number(s._sum.amount ?? 0))]));

    res.json(
      budgets.map((b) => ({ ...b, spent: spentMap.get(b.categoryId) ?? 0 })),
    );
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { categoryId, limit, period } = req.body as { categoryId?: string; limit?: number; period?: string };
    if (!categoryId || typeof limit !== "number" || limit <= 0) {
      return res.status(400).json({ error: "categoryId et limit (positif) requis" });
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return res.status(400).json({ error: "Catégorie invalide" });
    }

    try {
      const budget = await prisma.budget.create({
        data: {
          userId: req.session.userId!,
          categoryId,
          limit,
          period: period === "YEARLY" ? "YEARLY" : "MONTHLY",
        },
        include: { category: true },
      });
      res.status(201).json({ ...budget, spent: 0 });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        return res.status(409).json({ error: "Un budget existe déjà pour cette catégorie sur cette période" });
      }
      throw err;
    }
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const budget = await prisma.budget.findUnique({ where: { id: req.params.id } });
    if (!budget || budget.userId !== req.session.userId) {
      return res.status(404).json({ error: "Budget introuvable" });
    }

    const { limit } = req.body as { limit?: number };
    const updated = await prisma.budget.update({
      where: { id: budget.id },
      data: { ...(typeof limit === "number" && limit > 0 ? { limit } : {}) },
      include: { category: true },
    });
    res.json(updated);
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const budget = await prisma.budget.findUnique({ where: { id: req.params.id } });
    if (!budget || budget.userId !== req.session.userId) {
      return res.status(404).json({ error: "Budget introuvable" });
    }
    await prisma.budget.delete({ where: { id: budget.id } });
    res.status(204).end();
  }),
);

export default router;
