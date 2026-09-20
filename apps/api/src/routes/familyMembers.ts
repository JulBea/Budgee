import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/requireAuth";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const members = await prisma.familyMember.findMany({
      where: { userId: req.session.userId },
      orderBy: { createdAt: "asc" },
    });
    res.json(members);
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, role, color } = req.body as { name?: string; role?: string; color?: string };
    if (!name?.trim() || !role?.trim()) {
      return res.status(400).json({ error: "name et role requis" });
    }

    const member = await prisma.familyMember.create({
      data: {
        userId: req.session.userId!,
        name: name.trim(),
        role: role.trim(),
        ...(color ? { color } : {}),
      },
    });
    res.status(201).json(member);
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const member = await prisma.familyMember.findUnique({ where: { id: req.params.id } });
    if (!member || member.userId !== req.session.userId) {
      return res.status(404).json({ error: "Membre introuvable" });
    }

    const { name, role } = req.body as { name?: string; role?: string };
    const updated = await prisma.familyMember.update({
      where: { id: member.id },
      data: {
        ...(name?.trim() ? { name: name.trim() } : {}),
        ...(role?.trim() ? { role: role.trim() } : {}),
      },
    });
    res.json(updated);
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const member = await prisma.familyMember.findUnique({ where: { id: req.params.id } });
    if (!member || member.userId !== req.session.userId) {
      return res.status(404).json({ error: "Membre introuvable" });
    }
    await prisma.familyMember.delete({ where: { id: member.id } });
    res.status(204).end();
  }),
);

export default router;
