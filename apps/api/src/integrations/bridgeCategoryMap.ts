/**
 * Bridge expose ~126 sous-catégories standardisées (mêmes ids pour tous les
 * clients Bridge, indépendant du compte/sandbox). On les fait correspondre
 * à nos 8 catégories internes plutôt que d'importer toute la taxonomie Bridge.
 * Référence: GET /v3/aggregation/categories (voir docs.bridgeapi.io).
 */
export const BRIDGE_SUBCATEGORY_TO_BUDGEE_CATEGORY: Record<number, string> = {
  // Food & Dining -> Alimentation
  83: "Alimentation", // Restaurants
  188: "Alimentation", // Food - Others
  260: "Alimentation", // Fast foods
  273: "Alimentation", // Supermarkets / Groceries
  313: "Alimentation", // Coffee shop

  // Auto & Transport -> Transport
  84: "Transport",
  87: "Transport",
  196: "Transport",
  197: "Transport",
  198: "Transport",
  247: "Transport",
  251: "Transport",
  264: "Transport",
  288: "Transport",
  309: "Transport",

  // Home -> Logement
  216: "Logement", // Rent
  217: "Logement", // Electricity
  218: "Logement", // Gas
  220: "Logement",
  221: "Logement",
  222: "Logement",
  246: "Logement",
  293: "Logement", // Water
  323: "Logement",
  328: "Logement",
  194: "Logement", // Mortgage

  // Entertainment -> Loisirs
  223: "Loisirs",
  224: "Loisirs",
  226: "Loisirs",
  227: "Loisirs",
  242: "Loisirs",
  244: "Loisirs",
  249: "Loisirs",
  263: "Loisirs",
  269: "Loisirs",
  310: "Loisirs",
  320: "Loisirs",

  // Bills & Utilities -> Abonnements
  180: "Abonnements", // Internet
  219: "Abonnements", // Cable TV
  258: "Abonnements", // Home phone
  277: "Abonnements", // Mobile phone
  280: "Abonnements",

  // Health -> Santé
  236: "Santé", // Pharmacy
  245: "Santé",
  261: "Santé", // Doctor
  268: "Santé",
  322: "Santé",
  325: "Santé", // Dentist

  // Shopping (+ Personal care) -> Shopping
  183: "Shopping",
  184: "Shopping",
  186: "Shopping",
  243: "Shopping",
  262: "Shopping",
  272: "Shopping",
  318: "Shopping",
  319: "Shopping",
  235: "Shopping", // Hairdresser
  248: "Shopping", // Cosmetics
  316: "Shopping",
  317: "Shopping",
  321: "Shopping",

  // Incomes -> Salaire
  3: "Salaire",
  80: "Salaire",
  230: "Salaire", // Salaries
  231: "Salaire",
  232: "Salaire",
  233: "Salaire",
  271: "Salaire",
  279: "Salaire",
  283: "Salaire",
  289: "Salaire",
  327: "Salaire",
};

export function mapBridgeCategoryToBudgeeCategoryName(bridgeCategoryId: number | null): string | null {
  if (bridgeCategoryId === null) return null;
  return BRIDGE_SUBCATEGORY_TO_BUDGEE_CATEGORY[bridgeCategoryId] ?? null;
}
