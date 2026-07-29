import { Invoice, CreateInvoiceInput } from "../types/invoice";
import { deriveInvoiceStatus } from "../utils/invoiceUtils";

// Helper to simulate network latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Seed data to start with
let mockInvoices: Invoice[] = [
  {
    id: "inv_1",
    invoiceNumber: "INV-2024-001",
    customerName: "Acme Corp",
    issueDate: "2024-10-01",
    dueDate: "2024-10-15",
    totalAmount: 1500.0,
    currency: "USD",
    status: deriveInvoiceStatus("2024-10-15", false),
    lineItems: [
      {
        id: "li_1",
        description: "Consulting Services",
        quantity: 10,
        unitPrice: 150,
        total: 1500,
      },
    ],
  },
  {
    id: "inv_2",
    invoiceNumber: "INV-2024-002",
    customerName: "Globex Inc",
    issueDate: "2024-10-10",
    dueDate: "2024-11-10",
    totalAmount: 3200.5,
    currency: "EUR",
    status: deriveInvoiceStatus("2024-11-10", true), // Let's pretend this one is paid
    lineItems: [
      {
        id: "li_2",
        description: "Web Development",
        quantity: 1,
        unitPrice: 3200.5,
        total: 3200.5,
      },
    ],
  },
];

export const invoiceApi = {
  /**
   * Fetch all invoices
   */
  getInvoices: async (): Promise<Invoice[]> => {
    await delay(800); // Simulate network

    // Periodically re-calculate status on fetch in case dates rolled over
    return mockInvoices.map((inv) => ({
      ...inv,
      status:
        inv.status === "paid"
          ? "paid"
          : deriveInvoiceStatus(inv.dueDate, false),
    }));
  },

  /**
   * Fetch a single invoice by ID
   */
  getInvoiceById: async (id: string): Promise<Invoice> => {
    await delay(500);
    const invoice = mockInvoices.find((inv) => inv.id === id);
    if (!invoice) {
      throw new Error(`Invoice with ID ${id} not found`);
    }
    return invoice;
  },

  /**
   * Create a new invoice
   */
  createInvoice: async (data: CreateInvoiceInput): Promise<Invoice> => {
    await delay(1000);

    const newId = `inv_${Math.random().toString(36).substr(2, 9)}`;
    const nextInvoiceNumber = `INV-${new Date().getFullYear()}-${String(mockInvoices.length + 1).padStart(3, "0")}`;

    const newInvoice: Invoice = {
      ...data,
      id: newId,
      invoiceNumber: nextInvoiceNumber,
      status: deriveInvoiceStatus(data.dueDate, false),
    };

    // Prepend to our mock DB
    mockInvoices = [newInvoice, ...mockInvoices];

    return newInvoice;
  },
};
