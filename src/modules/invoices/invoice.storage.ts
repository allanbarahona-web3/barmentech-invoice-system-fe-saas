// TODO: replace with API calls

import type { Invoice, InvoiceInput, InvoiceItem, InvoiceEvent } from "./invoice.schema";
import { calcInvoiceTotals } from "./invoice.calc";
import { generateInvoiceNumber, incrementInvoiceNumber } from "./invoice.numbering";
import { tenantSettingsService } from "@/services/tenantSettingsService";

const STORAGE_KEY = "invoices";

function generateId(): string {
  return `inv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function generateItemId(): string {
  return `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Helper: Append an event to an invoice's event log
 */
function appendInvoiceEvent(
  invoice: Invoice,
  eventType: InvoiceEvent["type"],
  meta?: Record<string, string>
): Invoice {
  const event: InvoiceEvent = {
    id: generateEventId(),
    type: eventType,
    at: new Date().toISOString(),
    meta,
  };

  return {
    ...invoice,
    events: [...(invoice.events || []), event],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Migrate old invoices to new schema with type field
 */
function migrateInvoices(invoices: any[]): Invoice[] {
  return invoices.map((invoice): Invoice => {
    // Add type field if missing (default to "invoice")
    if (!invoice.type) {
      invoice.type = "invoice";
    }
    
    // Ensure status includes new values
    if (!["draft", "issued", "sent", "archived"].includes(invoice.status)) {
      invoice.status = "draft";
    }

    // Ensure items array exists and each item has an ID
    if (!invoice.items) {
      invoice.items = [];
    } else {
      invoice.items = invoice.items.map((item: any) => {
        if (!item.id) {
          item.id = generateItemId();
        }
        return item;
      });
    }

    // Ensure events array exists
    if (!invoice.events) {
      invoice.events = [];
    } else {
      const validEventTypes = [
        "CREATED", "CREATED_DRAFT", "UPDATED", "EXPORTED_PDF", 
        "MARKED_ISSUED", "SENT", "QUOTE_SENT", "CONVERTED_TO_INVOICE",
        "CREATED_FROM_QUOTE", "ARCHIVED"
      ];
      
      // Ensure each event has required fields
      invoice.events = invoice.events
        .filter((event: any) => event && typeof event === 'object')
        .map((event: any) => {
          if (!event.id) {
            event.id = generateEventId();
          }
          if (!event.at) {
            event.at = new Date().toISOString();
          }
          // Ensure type is valid
          if (!event.type || !validEventTypes.includes(event.type)) {
            event.type = "UPDATED";
          }
          // Ensure meta is either undefined or an object
          if (event.meta !== undefined && (typeof event.meta !== 'object' || Array.isArray(event.meta))) {
            delete event.meta;
          }
          return event;
        });
    }

    // Ensure required fields exist with defaults
    if (!invoice.currency) {
      invoice.currency = "USD";
    }

    if (!invoice.createdAt) {
      invoice.createdAt = new Date().toISOString();
    }

    if (!invoice.updatedAt) {
      invoice.updatedAt = invoice.createdAt || new Date().toISOString();
    }

    // Ensure numeric fields are numbers
    if (typeof invoice.subtotal !== 'number') {
      invoice.subtotal = 0;
    }
    if (typeof invoice.tax !== 'number') {
      invoice.tax = 0;
    }
    if (typeof invoice.total !== 'number') {
      invoice.total = 0;
    }

    // Clean up sent field - must be undefined or a valid InvoiceSent object
    if (invoice.sent !== undefined) {
      if (!invoice.sent || typeof invoice.sent !== 'object' || !invoice.sent.sentAt) {
        // Invalid sent object, remove it
        delete invoice.sent;
      } else {
        // Ensure sent has default method if missing
        if (!invoice.sent.method) {
          invoice.sent.method = "manual";
        }
      }
    }
    
    return invoice as Invoice;
  });
}

function getStoredInvoices(): Invoice[] {
  try {
    console.log('[invoice.storage] getStoredInvoices - Reading from key:', STORAGE_KEY);
    const stored = localStorage.getItem(STORAGE_KEY);
    console.log('[invoice.storage] getStoredInvoices - Raw localStorage data:', stored ? `${stored.substring(0, 100)}...` : 'null');
    
    if (!stored) {
      console.log('[invoice.storage] getStoredInvoices - No data in localStorage, returning empty array');
      return [];
    }

    const parsed = JSON.parse(stored);
    console.log('[invoice.storage] getStoredInvoices - Parsed count:', parsed.length);
    
    // Migrate old invoices to new schema
    const migrated = migrateInvoices(parsed);
    console.log('[invoice.storage] getStoredInvoices - After migration, returning', migrated.length, 'invoices');
    
    return migrated;
  } catch (error) {
    console.error('[invoice.storage] getStoredInvoices - Error reading from localStorage:', error);
    return [];
  }
}

function saveInvoices(invoices: Invoice[]): void {
  console.log('[invoice.storage] saveInvoices - Saving', invoices.length, 'invoices to key:', STORAGE_KEY);
  console.log('[invoice.storage] saveInvoices - Invoice IDs being saved:', invoices.map(inv => inv.id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
  console.log('[invoice.storage] saveInvoices - Save complete, verifying...');
  const verification = localStorage.getItem(STORAGE_KEY);
  if (verification) {
    const verifiedCount = JSON.parse(verification).length;
    console.log('[invoice.storage] saveInvoices - Verification: Successfully saved', verifiedCount, 'invoices');
  } else {
    console.error('[invoice.storage] saveInvoices - Verification FAILED: localStorage is empty!');
  }
}

export async function listInvoices(): Promise<Invoice[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  return getStoredInvoices();
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  console.log('[invoice.storage] getInvoiceById called:', id);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 150));
  
  const invoices = getStoredInvoices();
  const invoice = invoices.find(inv => inv.id === id) ?? null;
  
  if (invoice) {
    console.log('[invoice.storage] Invoice found:', {
      id: invoice.id,
      number: invoice.invoiceNumber,
      type: invoice.type,
      status: invoice.status,
      customerId: invoice.customerId,
    });
  } else {
    console.warn('[invoice.storage] Invoice not found:', id);
  }
  
  return invoice;
}

export async function createInvoice(input: InvoiceInput): Promise<Invoice> {
  console.log('[invoice.storage] createInvoice called:', {
    type: input.type,
    status: input.status,
    customerId: input.customerId,
    itemsCount: input.items.length,
  });

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));

  const invoices = getStoredInvoices();
  const settings = await tenantSettingsService.getTenantSettings();

  if (!settings) {
    console.error('[invoice.storage] Tenant settings not found');
    throw new Error("Tenant settings not found");
  }

  // Generate invoice number
  const invoiceNumber = await generateInvoiceNumber();

  // Add IDs to items
  const items: InvoiceItem[] = input.items.map(item => ({
    id: generateItemId(),
    ...item,
  }));

  // Calculate totals
  const { subtotal, tax, total } = calcInvoiceTotals(
    items,
    settings.taxEnabled,
    settings.taxRate ?? 0
  );

  const now = new Date().toISOString();

  let newInvoice: Invoice = {
    id: generateId(),
    type: input.type || "invoice",
    invoiceNumber,
    customerId: input.customerId,
    currency: input.currency || settings.currency,
    items,
    subtotal,
    tax,
    total,
    status: input.status,
    createdAt: now,
    updatedAt: now,
    events: [],
  };

  // Register appropriate creation event based on status
  if (input.status === "draft") {
    newInvoice = appendInvoiceEvent(newInvoice, "CREATED_DRAFT");
  } else {
    newInvoice = appendInvoiceEvent(newInvoice, "CREATED");
  }

  // If status is issued, register MARKED_ISSUED event
  if (input.status === "issued") {
    newInvoice = appendInvoiceEvent(newInvoice, "MARKED_ISSUED");
  }

  invoices.push(newInvoice);
  console.log('[invoice.storage] createInvoice - About to save', invoices.length, 'invoices (including new one)');
  saveInvoices(invoices);

  // Verify the invoice was saved
  const verifyRead = getStoredInvoices();
  const savedInvoice = verifyRead.find(inv => inv.id === newInvoice.id);
  console.log('[invoice.storage] createInvoice - Verification: New invoice present after save?', !!savedInvoice);

  // Increment invoice number for next invoice
  await incrementInvoiceNumber();

  console.log('[invoice.storage] Invoice created successfully:', {
    id: newInvoice.id,
    number: newInvoice.invoiceNumber,
    type: newInvoice.type,
    status: newInvoice.status,
    eventsCount: newInvoice.events?.length ?? 0,
  });

  return newInvoice;
}

export async function updateInvoice(id: string, input: InvoiceInput): Promise<Invoice> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const invoices = getStoredInvoices();
  const index = invoices.findIndex(inv => inv.id === id);

  if (index === -1) {
    throw new Error("Invoice not found");
  }

  const settings = await tenantSettingsService.getTenantSettings();

  if (!settings) {
    throw new Error("Tenant settings not found");
  }

  // Preserve existing item IDs or generate new ones
  const existingItems = invoices[index].items;
  const items: InvoiceItem[] = input.items.map((item, idx) => ({
    id: existingItems[idx]?.id || generateItemId(),
    ...item,
  }));

  // Recalculate totals
  const { subtotal, tax, total } = calcInvoiceTotals(
    items,
    settings.taxEnabled,
    settings.taxRate ?? 0
  );

  let updatedInvoice: Invoice = {
    ...invoices[index],
    customerId: input.customerId,
    items,
    subtotal,
    tax,
    total,
    status: input.status,
    updatedAt: new Date().toISOString(),
  };

  // Register UPDATED event
  updatedInvoice = appendInvoiceEvent(updatedInvoice, "UPDATED");

  invoices[index] = updatedInvoice;
  saveInvoices(invoices);

  return updatedInvoice;
}

export async function deleteInvoice(id: string): Promise<void> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 250));

  const invoices = getStoredInvoices();
  const filtered = invoices.filter(inv => inv.id !== id);

  if (filtered.length === invoices.length) {
    throw new Error("Invoice not found");
  }

  saveInvoices(filtered);
}

export async function updateInvoiceStatus(
  id: string,
  status: "draft" | "issued"
): Promise<Invoice> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));

  const invoices = getStoredInvoices();
  const index = invoices.findIndex(inv => inv.id === id);

  if (index === -1) {
    throw new Error("Invoice not found");
  }

  let updatedInvoice: Invoice = {
    ...invoices[index],
    status,
    updatedAt: new Date().toISOString(),
  };

  // Register MARKED_ISSUED event if changing to issued
  if (status === "issued") {
    updatedInvoice = appendInvoiceEvent(updatedInvoice, "MARKED_ISSUED");
  }

  invoices[index] = updatedInvoice;
  saveInvoices(invoices);

  return updatedInvoice;
}

export async function recordInvoiceExportPdf(id: string): Promise<Invoice> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 150));

  const invoices = getStoredInvoices();
  const index = invoices.findIndex(inv => inv.id === id);

  if (index === -1) {
    throw new Error("Invoice not found");
  }

  let updatedInvoice = appendInvoiceEvent(
    invoices[index],
    "EXPORTED_PDF"
  );

  invoices[index] = updatedInvoice;
  saveInvoices(invoices);

  return updatedInvoice;
}

export async function recordInvoiceSent(
  id: string,
  toEmail?: string,
  message?: string
): Promise<Invoice> {
  console.log('[invoice.storage] recordInvoiceSent called:', { id, toEmail, hasMessage: !!message });
  
  // Check localStorage directly before calling getStoredInvoices
  const rawData = localStorage.getItem(STORAGE_KEY);
  console.log('[invoice.storage] recordInvoiceSent - Direct localStorage check:', rawData ? `Has data (${rawData.length} chars)` : 'EMPTY/NULL');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));

  const invoices = getStoredInvoices();
  console.log('[invoice.storage] All invoice IDs:', invoices.map(inv => inv.id));
  const index = invoices.findIndex(inv => inv.id === id);

  if (index === -1) {
    console.error('[invoice.storage] Invoice not found with id:', id);
    throw new Error("Invoice not found");
  }

  const meta: Record<string, string> = {};
  if (toEmail) meta.toEmail = toEmail;
  if (message) meta.message = message;

  let updatedInvoice: Invoice = {
    ...invoices[index],
    status: "sent",
    sent: {
      toEmail,
      message,
      sentAt: new Date().toISOString(),
      method: "manual",
    },
  };

  // Use different event type based on document type
  const eventType = updatedInvoice.type === "quote" ? "QUOTE_SENT" : "SENT";
  updatedInvoice = appendInvoiceEvent(updatedInvoice, eventType, meta);

  invoices[index] = updatedInvoice;
  saveInvoices(invoices);

  return updatedInvoice;
}

export async function archiveInvoice(id: string): Promise<Invoice> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));

  const invoices = getStoredInvoices();
  const index = invoices.findIndex(inv => inv.id === id);

  if (index === -1) {
    throw new Error("Invoice not found");
  }

  let updatedInvoice: Invoice = {
    ...invoices[index],
    status: "archived",
    archivedAt: new Date().toISOString(),
  };

  updatedInvoice = appendInvoiceEvent(updatedInvoice, "ARCHIVED");

  invoices[index] = updatedInvoice;
  saveInvoices(invoices);

  return updatedInvoice;
}

/**
 * Convert a quote to an invoice
 * Creates a new invoice document from the quote data with proper traceability
 */
export async function convertQuoteToInvoice(quoteId: string): Promise<Invoice> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));

  const invoices = getStoredInvoices();
  const quote = invoices.find(inv => inv.id === quoteId);

  if (!quote) {
    throw new Error("Quote not found");
  }

  if (quote.type !== "quote") {
    throw new Error("Document is not a quote");
  }

  const settings = await tenantSettingsService.getTenantSettings();

  if (!settings) {
    throw new Error("Tenant settings not found");
  }

  // Generate new invoice number
  const invoiceNumber = await generateInvoiceNumber();

  // Clone items with new IDs
  const items: InvoiceItem[] = quote.items.map(item => ({
    ...item,
    id: generateItemId(),
  }));

  const now = new Date().toISOString();

  // Create new invoice from quote
  let newInvoice: Invoice = {
    id: generateId(),
    type: "invoice",
    invoiceNumber,
    customerId: quote.customerId,
    currency: quote.currency,
    items,
    subtotal: quote.subtotal,
    tax: quote.tax,
    total: quote.total,
    status: "draft",
    originQuoteId: quoteId, // Link back to original quote
    createdAt: now,
    updatedAt: now,
    events: [],
  };

  // Register creation event with origin reference
  newInvoice = appendInvoiceEvent(newInvoice, "CREATED_FROM_QUOTE", {
    originQuoteId: quoteId,
    originQuoteNumber: quote.invoiceNumber,
  });

  // Update the quote to record conversion
  const quoteIndex = invoices.findIndex(inv => inv.id === quoteId);
  if (quoteIndex !== -1) {
    let updatedQuote = appendInvoiceEvent(
      invoices[quoteIndex],
      "CONVERTED_TO_INVOICE",
      {
        newInvoiceId: newInvoice.id,
        newInvoiceNumber: newInvoice.invoiceNumber,
      }
    );
    invoices[quoteIndex] = updatedQuote;
  }

  // Add new invoice to storage
  invoices.push(newInvoice);
  console.log('[invoice.storage] convertQuoteToInvoice - About to save', invoices.length, 'invoices (including new invoice)');
  saveInvoices(invoices);

  // Verify the invoice was saved
  const verifyRead = getStoredInvoices();
  const savedInvoice = verifyRead.find(inv => inv.id === newInvoice.id);
  console.log('[invoice.storage] convertQuoteToInvoice - Verification: New invoice present after save?', !!savedInvoice);

  // Increment invoice number for next invoice
  await incrementInvoiceNumber();

  return newInvoice;
}
