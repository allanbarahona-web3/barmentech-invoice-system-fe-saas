import { tenantSettingsService } from "@/services/tenantSettingsService";

/**
 * Generate next invoice number using tenant settings
 */
export async function generateInvoiceNumber(): Promise<string> {
  const settings = await tenantSettingsService.getTenantSettings();
  
  if (!settings) {
    throw new Error("Tenant settings not found");
  }

  const prefix = settings.invoicePrefix || "";
  const number = settings.nextInvoiceNumber || 1;

  return `${prefix}${number}`;
}

/**
 * Increment next invoice number in tenant settings
 */
export async function incrementInvoiceNumber(): Promise<void> {
  const settings = await tenantSettingsService.getTenantSettings();
  
  if (!settings) {
    throw new Error("Tenant settings not found");
  }

  const updatedSettings = {
    ...settings,
    nextInvoiceNumber: settings.nextInvoiceNumber + 1,
  };

  await tenantSettingsService.saveTenantSettings(updatedSettings);
}

/**
 * Format invoice number for display
 */
export function formatInvoiceNumber(prefix: string, number: number): string {
  return `${prefix}${number}`;
}
