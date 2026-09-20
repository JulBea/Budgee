import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Nom requis").max(120),
  email: z.string().trim().toLowerCase().email("Email invalide").max(254),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères").max(200),
  country: z.enum(["France", "Belgique", "Suisse", "Canada"]).default("France"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email invalide"),
});
