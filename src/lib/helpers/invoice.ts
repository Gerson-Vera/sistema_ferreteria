export function generateInvoiceCode(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const suffix = crypto.randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase();
  return `F${year}${month}-${suffix}`;
}
