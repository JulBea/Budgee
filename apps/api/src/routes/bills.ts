import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/requireAuth";
import { asyncHandler } from "../middleware/asyncHandler";
import { detectRecurringBills } from "../services/billDetection";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const bills = await prisma.bill.findMany({
      where: { userId: req.session.userId },
      orderBy: { dueDate: "asc" },
    });
    res.json(bills);
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, amount, dueDate } = req.body as { name?: string; amount?: number; dueDate?: string };
    if (!name?.trim() || typeof amount !== "number" || amount <= 0 || !dueDate) {
      return res.status(400).json({ error: "name, amount (positif) et dueDate requis" });
    }
    const parsedDate = new Date(dueDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: "dueDate invalide" });
    }

    const bill = await prisma.bill.create({
      data: { userId: req.session.userId!, name: name.trim(), amount, dueDate: parsedDate },
    });
    res.status(201).json(bill);
  }),
);

router.post(
  "/detect",
  asyncHandler(async (req, res) => {
    await detectRecurringBills(req.session.userId!);
    const bills = await prisma.bill.findMany({
      where: { userId: req.session.userId },
      orderBy: { dueDate: "asc" },
    });
    res.json(bills);
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const bill = await prisma.bill.findUnique({ where: { id: req.params.id } });
    if (!bill || bill.userId !== req.session.userId) {
      return res.status(404).json({ error: "Facture introuvable" });
    }

    const { status } = req.body as { status?: "PENDING" | "PAID" };
    const updated = await prisma.bill.update({
      where: { id: bill.id },
      data: { ...(status === "PENDING" || status === "PAID" ? { status } : {}) },
    });
    res.json(updated);
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const bill = await prisma.bill.findUnique({ where: { id: req.params.id } });
    if (!bill || bill.userId !== req.session.userId) {
      return res.status(404).json({ error: "Facture introuvable" });
    }
    await prisma.bill.delete({ where: { id: bill.id } });
    res.status(204).end();
  }),
);

export default router;
