export function formatCurrency(amount: number, currency: string = "EUR"): string {
  return amount.toLocaleString("fr-FR", { style: "currency", currency });
}
