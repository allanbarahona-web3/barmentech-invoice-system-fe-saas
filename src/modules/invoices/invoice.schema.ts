import { z } from "zod";

export const paymentTermsSchema = z.enum([
  "due_on_receipt",
  "net_15",
  "net_30",
  "net_60",
  "net_90",
  "custom",
]);

export const invoiceItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1),
  qty: z.number().min(0.01),
  unitPrice: z.number().min(0),
  productId: z.string().optional(),
});

export const invoiceSentSchema = z.object({
  toEmail: z.string().optional(),
  message: z.string().optional(),
  sentAt: z.string(),
  method: z.enum(["manual", "email"]).default("manual"),
});

export const invoiceEventSchema = z.object({
  id: z.string(),
  type: z.enum([
    "CREATED",
    "CREATED_DRAFT",
    "UPDATED",
    "EXPORTED_PDF",
    "MARKED_ISSUED",
    "SENT",
    "QUOTE_SENT",
    "CONVERTED_TO_INVOICE",
    "CREATED_FROM_QUOTE",
    "ARCHIVED",
  ]),
  at: z.string(), // ISO datetime
  meta: z.record(z.string()).optional(),
});

export const invoiceSchema = z.object({
  id: z.string(),
  type: z.enum(["invoice", "quote"]).default("invoice"),
  invoiceNumber: z.string(),
  customerId: z.string(),
  currency: z.string(),
  items: z.array(invoiceItemSchema),
  subtotal: z.number(),
  tax: z.number(),
  total: z.number(),
  status: z.enum(["draft", "issued", "sent", "archived"]),
  createdAt: z.string(),
  updatedAt: z.string(),
  paymentTerms: paymentTermsSchema.default("due_on_receipt"),
  customNetDays: z.number().int().min(1).max(365).optional(),
  dueDate: z.string().optional(),
  // Metadata and audit trail
  originQuoteId: z.string().optional(), // For invoices created from quotes
  archivedAt: z.string().optional(),
  sent: invoiceSentSchema.optional(),
  events: z.array(invoiceEventSchema).optional(),
});

export const invoiceInputSchema = z
  .object({
    type: z.enum(["invoice", "quote"]).default("invoice"),
    customerId: z.string().min(1),
    currency: z.string().min(3).max(3).optional(), // Optional: uses company default if not provided
    paymentTerms: paymentTermsSchema.default("due_on_receipt"),
    customNetDays: z.number().int().min(1).max(365).optional(),
    items: z
      .array(
        z.object({
          description: z.string().min(1),
          qty: z.number().min(0.01),
          unitPrice: z.number().min(0),
          productId: z.string().optional(),
        })
      )
      .min(1),
    status: z.enum(["draft", "issued", "sent", "archived"]),
  })
  .superRefine((data, ctx) => {
    if (data.paymentTerms === "custom" && !data.customNetDays) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customNetDays"],
        message: "Ingresa los días para el crédito personalizado",
      });
    }
  });

export type InvoiceItem = z.infer<typeof invoiceItemSchema>;
export type InvoiceSent = z.infer<typeof invoiceSentSchema>;
export type InvoiceEvent = z.infer<typeof invoiceEventSchema>;
export type PaymentTerms = z.infer<typeof paymentTermsSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;
export type InvoiceInput = z.infer<typeof invoiceInputSchema>;
