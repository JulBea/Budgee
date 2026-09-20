import { prisma } from "../prisma";

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const MIN_GAP_DAYS = 24;
const MAX_GAP_DAYS = 40;
const MAX_AMOUNT_VARIATION = 0.15; // coefficient de variation max (écart-type / moyenne)

// Seules ces catégories correspondent à des "factures" au sens courant
// (abonnements, loyer, assurances, forfaits...). Les achats ponctuels
// répétés (restaurants, courses, shopping) ne doivent pas être proposés
// même s'ils reviennent par coïncidence à intervalle régulier.
const RECURRING_ELIGIBLE_CATEGORIES = new Set(["Abonnements", "Logement", "Santé", "Transport"]);

const PREFIXES_TO_STRIP = [
  "cb ",
  "prlv sepa ",
  "prlv ",
  "vir sepa ",
  "vir inst ",
  "virement vers ",
  "paypal *",
  "to ",
];

function normalizeKey(description: string): string {
  let s = description.toLowerCase().trim();
  for (const prefix of PREFIXES_TO_STRIP) {
    if (s.startsWith(prefix)) {
      s = s.slice(prefix.length);
      break;
    }
  }
  return s.replace(/[0-9]/g, "").replace(/\s+/g, " ").trim();
}

function humanize(description: string): string {
  const key = normalizeKey(description);
  return key
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .trim() || description;
}

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stddev(values: number[], avg: number): number {
  return Math.sqrt(mean(values.map((v) => (v - avg) ** 2)));
}

export async function detectRecurringBills(userId: string): Promise<void> {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const transactions = await prisma.transaction.findMany({
    where: {
      account: { userId },
      amount: { lt: 0 },
      date: { gte: sixMonthsAgo },
      category: { name: { in: [...RECURRING_ELIGIBLE_CATEGORIES] } },
    },
    select: { description: true, amount: true, date: true },
    orderBy: { date: "asc" },
  });

  const groups = new Map<string, { description: string; amount: number; date: Date }[]>();
  for (const tx of transactions) {
    const key = normalizeKey(tx.description);
    if (!key) continue;
    const list = groups.get(key) ?? [];
    list.push({ description: tx.description, amount: Math.abs(Number(tx.amount)), date: tx.date });
    groups.set(key, list);
  }

  const existingBills = await prisma.bill.findMany({ where: { userId }, select: { name: true } });
  const existingNames = new Set(existingBills.map((b) => b.name.toLowerCase()));

  for (const [, rawOccurrences] of groups) {
    // Un même compte connecté plusieurs fois (ou plusieurs comptes similaires)
    // peut produire plusieurs transactions identiques le même jour: on les
    // fusionne en une seule occurrence pour ne pas fausser le calcul d'écart.
    const byDay = new Map<string, { description: string; amount: number; date: Date }>();
    for (const occ of rawOccurrences) {
      const dayKey = occ.date.toISOString().slice(0, 10);
      if (!byDay.has(dayKey)) byDay.set(dayKey, occ);
    }
    const occurrences = [...byDay.values()].sort((a, b) => a.date.getTime() - b.date.getTime());

    if (occurrences.length < 2) continue;

    const gaps: number[] = [];
    for (let i = 1; i < occurrences.length; i++) {
      const days = (occurrences[i].date.getTime() - occurrences[i - 1].date.getTime()) / MS_PER_DAY;
      gaps.push(days);
    }
    const avgGap = mean(gaps);
    if (avgGap < MIN_GAP_DAYS || avgGap > MAX_GAP_DAYS) continue;
    if (gaps.length > 1 && stddev(gaps, avgGap) > 6) continue;

    const amounts = occurrences.map((o) => o.amount);
    const avgAmount = mean(amounts);
    const variation = avgAmount > 0 ? stddev(amounts, avgAmount) / avgAmount : 1;
    if (variation > MAX_AMOUNT_VARIATION) continue;

    const name = humanize(occurrences[occurrences.length - 1].description);
    if (existingNames.has(name.toLowerCase())) continue;

    const lastDate = occurrences[occurrences.length - 1].date;
    const nextDueDate = new Date(lastDate.getTime() + avgGap * MS_PER_DAY);

    await prisma.bill.create({
      data: {
        userId,
        name,
        amount: Math.round(avgAmount * 100) / 100,
        dueDate: nextDueDate,
        status: nextDueDate < new Date() ? "PAID" : "PENDING",
      },
    });
    existingNames.add(name.toLowerCase());
  }
}
