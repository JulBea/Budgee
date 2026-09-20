import bcrypt from "bcrypt";
import { Router } from "express";
import { prisma } from "../prisma";
import { authRateLimiter } from "../rateLimiters";
import { forgotPasswordSchema, loginSchema, signupSchema } from "../schemas/auth";
import { requireAuth } from "../middleware/requireAuth";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();
const BCRYPT_ROUNDS = 12;

function serializeUser(user: { id: string; email: string; name: string; phone: string | null; country: string }) {
  return { id: user.id, email: user.email, name: user.name, phone: user.phone, country: user.country };
}

router.post(
  "/signup",
  authRateLimiter,
  asyncHandler(async (req, res) => {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const { name, email, phone, password, country } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Un compte existe déjà avec cet email" });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await prisma.user.create({
      data: { name, email, phone: phone || null, passwordHash, country },
    });

    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((err) => (err ? reject(err) : resolve()));
    });
    req.session.userId = user.id;

    res.status(201).json(serializeUser(user));
  }),
);

router.post(
  "/login",
  authRateLimiter,
  asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Email ou mot de passe incorrect" });
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false;

    if (!user || !passwordMatches) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((err) => (err ? reject(err) : resolve()));
    });
    req.session.userId = user.id;

    res.json(serializeUser(user));
  }),
);

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("budgee.sid");
    res.status(204).end();
  });
});

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.session.userId } });
    if (!user) {
      return res.status(401).json({ error: "Non authentifié" });
    }
    res.json(serializeUser(user));
  }),
);

router.post(
  "/forgot-password",
  authRateLimiter,
  asyncHandler(async (req, res) => {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Email invalide" });
    }

    // Réponse identique que le compte existe ou non, pour ne pas révéler
    // quels emails sont enregistrés (anti-enumeration).
    res.json({ message: "Si un compte existe pour cette adresse, un email a été envoyé." });
  }),
);

export default router;
