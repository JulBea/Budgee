import { prisma } from "./prisma";

const DEFAULT_CATEGORIES: { name: string; type: "INCOME" | "EXPENSE" }[] = [
  { name: "Alimentation", type: "EXPENSE" },
  { name: "Transport", type: "EXPENSE" },
  { name: "Logement", type: "EXPENSE" },
  { name: "Loisirs", type: "EXPENSE" },
  { name: "Abonnements", type: "EXPENSE" },
  { name: "Santé", type: "EXPENSE" },
  { name: "Shopping", type: "EXPENSE" },
  { name: "Salaire", type: "INCOME" },
];

export async function seedDefaultCategories(): Promise<void> {
  const count = await prisma.category.count();
  if (count > 0) return;

  await prisma.category.createMany({ data: DEFAULT_CATEGORIES });
  console.log(`Seeded ${DEFAULT_CATEGORIES.length} default categories`);
}
