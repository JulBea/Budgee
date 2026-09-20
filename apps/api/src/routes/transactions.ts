import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/requireAuth";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const transactions = await prisma.transaction.findMany({
      where: { account: { userId: req.session.userId } },
      include: { account: true, category: true },
      orderBy: { date: "desc" },
      take: 200,
    });
    res.json(transactions);
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { accountId, categoryId, amount, description, date } = req.body as {
      accountId?: string;
      categoryId?: string | null;
      amount?: number;
      description?: string;
      date?: string;
    };

    if (!accountId || !description?.trim() || typeof amount !== "number" || amount === 0) {
      return res.status(400).json({ error: "accountId, description et amount (non nul) requis" });
    }

    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account || account.userId !== req.session.userId) {
      return res.status(404).json({ error: "Compte introuvable" });
    }

    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) {
        return res.status(400).json({ error: "Catégorie invalide" });
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        accountId,
        categoryId: categoryId || null,
        amount,
        description: description.trim(),
        date: date ? new Date(date) : new Date(),
      },
      include: { account: true, category: true },
    });
    res.status(201).json(transaction);
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const transaction = await prisma.transaction.findUnique({
      where: { id: req.params.id },
      include: { account: true },
    });
    if (!transaction || transaction.account.userId !== req.session.userId) {
      return res.status(404).json({ error: "Transaction introuvable" });
    }

    const { categoryId } = req.body as { categoryId?: string | null };
    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) {
        return res.status(400).json({ error: "Catégorie invalide" });
      }
    }

    const updated = await prisma.transaction.update({
      where: { id: transaction.id },
      data: { categoryId: categoryId || null },
      include: { account: true, category: true },
    });
    res.json(updated);
  }),
);

export default router;
