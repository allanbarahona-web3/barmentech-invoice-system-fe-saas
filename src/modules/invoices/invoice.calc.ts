import { InvoiceItem } from "./invoice.schema";

export interface InvoiceTotals {
  subtotal: number;
  tax: number;
  total: number;
}

/**
 * Calculate line total for an invoice item (including discount)
 */
export function calcLineTotal(item: InvoiceItem): number {
  const lineSubtotal = item.qty * item.unitPrice;
  const discountAmount = lineSubtotal * ((item.discount || 0) / 100);
  return roundToTwo(lineSubtotal - discountAmount);
}

/**
 * Calculate total discount from all invoice items
 */
export function calcTotalDiscount(items: InvoiceItem[]): number {
  const sum = items.reduce((acc, item) => {
    const lineSubtotal = item.qty * item.unitPrice;
    const discountAmount = lineSubtotal * ((item.discount || 0) / 100);
    return acc + discountAmount;
  }, 0);
  return roundToTwo(sum);
}

/**
 * Calculate subtotal from invoice items (after discounts)
 */
export function calcSubtotal(items: InvoiceItem[]): number {
  const sum = items.reduce((acc, item) => acc + calcLineTotal(item), 0);
  return roundToTwo(sum);
}

/**
 * Calculate tax amount based on subtotal and tax settings
 */
export function calcTax(subtotal: number, taxEnabled: boolean, taxRate: number): number {
  if (!taxEnabled || taxRate <= 0) {
    return 0;
  }
  const taxAmount = subtotal * (taxRate / 100);
  return roundToTwo(taxAmount);
}

/**
 * Calculate invoice totals
 */
export function calcInvoiceTotals(
  items: InvoiceItem[],
  taxEnabled: boolean,
  taxRate: number
): InvoiceTotals {
  const subtotal = calcSubtotal(items);
  const tax = calcTax(subtotal, taxEnabled, taxRate);
  const total = roundToTwo(subtotal + tax);

  return { subtotal, tax, total };
}

/**
 * Round number to 2 decimal places
 */
function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}
