import { InvoiceStatus } from "../types/invoice";

/**
 * Calculates the current status of an invoice.
 * If it's not paid and past its due date, it's overdue.
 */
export function deriveInvoiceStatus(
  dueDate: string,
  isPaid: boolean,
): InvoiceStatus {
  if (isPaid) return "paid";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);

  if (due < today) {
    return "overdue";
  }

  return "unpaid";
}
