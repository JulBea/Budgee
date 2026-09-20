import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/requireAuth";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

router.use(requireAuth);

const MONTH_LABELS = ["Jan", "Fév", "Mars", "Avril", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const userId = req.session.userId!;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const categorySpend = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { account: { userId }, date: { gte: startOfMonth }, amount: { lt: 0 } },
      _sum: { amount: true },
    });
    const categoryIds = categorySpend.map((c) => c.categoryId).filter((id): id is string => !!id);
    const categories = await prisma.category.findMany({ where: { id: { in: categoryIds } } });
    const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));

    const categoryReport = categorySpend
      .map((c) => ({
        category: c.categoryId ? categoryNameById.get(c.categoryId) ?? "Autre" : "Non catégorisé",
        amount: Math.abs(Number(c._sum.amount ?? 0)),
      }))
      .filter((c) => c.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const recentTransactions = await prisma.transaction.findMany({
      where: { account: { userId }, date: { gte: sixMonthsAgo }, amount: { lt: 0 } },
      select: { amount: true, date: true },
    });

    const trend: { label: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const total = recentTransactions
        .filter((t) => t.date >= monthDate && t.date < nextMonthDate)
        .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
      trend.push({ label: MONTH_LABELS[monthDate.getMonth()], total });
    }

    res.json({ categoryReport, trend });
  }),
);

export default router;
