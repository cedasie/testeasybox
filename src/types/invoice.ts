export type Currency = "USD" | "EUR" | "GBP";
export type InvoiceStatus = "paid" | "unpaid" | "overdue";

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number; // usually calculated as quantity * unitPrice
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  issueDate: string; // ISO date string (YYYY-MM-DD)
  dueDate: string; // ISO date string (YYYY-MM-DD)
  totalAmount: number;
  currency: Currency;
  status: InvoiceStatus;
  lineItems: LineItem[];
}

// When creating an invoice, we don't have the ID or auto-generated invoice number yet
export type CreateInvoiceInput = Omit<
  Invoice,
  "id" | "invoiceNumber" | "status"
>;
