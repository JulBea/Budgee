import { prisma } from "../prisma";
import {
  createBridgeUser,
  getBridgeUserToken,
  getItem,
  getProvider,
  listAccounts,
  listTransactions,
} from "../integrations/bridge";
import { mapBridgeCategoryToBudgeeCategoryName } from "../integrations/bridgeCategoryMap";
import { detectRecurringBills } from "./billDetection";

let categoryIdByNameCache: Map<string, string> | null = null;

async function getCategoryIdByName(name: string): Promise<string | undefined> {
  if (!categoryIdByNameCache) {
    const categories = await prisma.category.findMany();
    categoryIdByNameCache = new Map(categories.map((c) => [c.name, c.id]));
  }
  return categoryIdByNameCache.get(name);
}

const COUNTRY_CODES: Record<string, string> = {
  France: "FR",
  Belgique: "BE",
  Suisse: "CH",
  Canada: "CA",
};

export function countryCodeFor(country: string): string {
  return COUNTRY_CODES[country] ?? "FR";
}

export async function ensureBridgeUser(userId: string): Promise<string> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (user.bridgeUserUuid) return user.bridgeUserUuid;

  const bridgeUser = await createBridgeUser(userId);
  await prisma.user.update({ where: { id: userId }, data: { bridgeUserUuid: bridgeUser.uuid } });
  return bridgeUser.uuid;
}

export async function getUserAccessToken(userId: string): Promise<string> {
  const { access_token } = await getBridgeUserToken(userId);
  return access_token;
}

function mapAccountType(bridgeType: string): string {
  const mapping: Record<string, string> = {
    checking: "Compte courant",
    savings: "Livret / épargne",
    card: "Carte de crédit",
    loan: "Prêt",
    brokerage: "Investissement",
    pea: "Investissement",
    life_insurance: "Assurance vie",
  };
  return mapping[bridgeType] ?? "Compte courant";
}

export async function syncItem(userId: string, itemId: number): Promise<void> {
  const accessToken = await getUserAccessToken(userId);

  const item = await getItem(accessToken, itemId);
  const provider = await getProvider(accessToken, item.provider_id);

  const connection = await prisma.bankConnection.upsert({
    where: { providerItemId: String(itemId) },
    create: {
      userId,
      providerItemId: String(itemId),
      bankName: provider.name,
      status: "ACTIVE",
      lastSyncedAt: new Date(),
    },
    update: {
      bankName: provider.name,
      status: "ACTIVE",
      lastSyncedAt: new Date(),
    },
  });

  const accounts = await listAccounts(accessToken, itemId);

  for (const acc of accounts) {
    const account = await prisma.account.upsert({
      where: { providerAccountId: String(acc.id) },
      create: {
        userId,
        bankConnectionId: connection.id,
        providerAccountId: String(acc.id),
        name: acc.name,
        type: mapAccountType(acc.type),
        balance: acc.balance,
        currency: acc.currency_code,
        ibanLast4: acc.iban ? acc.iban.slice(-4) : null,
      },
      update: {
        name: acc.name,
        balance: acc.balance,
        currency: acc.currency_code,
        ibanLast4: acc.iban ? acc.iban.slice(-4) : null,
      },
    });

    // Si ce compte est lié à un objectif d'épargne, son solde fait foi.
    await prisma.goal.updateMany({
      where: { accountId: account.id },
      data: { saved: account.balance },
    });

    const transactions = await listTransactions(accessToken, acc.id);

    for (const tx of transactions) {
      if (tx.deleted) continue;

      const categoryName = mapBridgeCategoryToBudgeeCategoryName(tx.category_id);
      const categoryId = categoryName ? await getCategoryIdByName(categoryName) : undefined;

      const existing = await prisma.transaction.findUnique({
        where: { providerTransactionId: String(tx.id) },
        select: { categoryId: true },
      });
      // On ne mappe la catégorie qu'à la création ou si l'utilisateur n'a
      // pas déjà choisi une catégorie manuellement.
      const shouldSetCategory = !existing || existing.categoryId === null;

      await prisma.transaction.upsert({
        where: { providerTransactionId: String(tx.id) },
        create: {
          accountId: account.id,
          providerTransactionId: String(tx.id),
          amount: tx.amount,
          description: tx.clean_description || tx.provider_description,
          date: new Date(tx.booking_date || tx.date),
          categoryId: categoryId ?? null,
        },
        update: {
          amount: tx.amount,
          description: tx.clean_description || tx.provider_description,
          date: new Date(tx.booking_date || tx.date),
          ...(shouldSetCategory && categoryId ? { categoryId } : {}),
        },
      });
    }
  }

  await detectRecurringBills(userId);
}
