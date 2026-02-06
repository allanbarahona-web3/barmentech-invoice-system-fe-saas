import { TenantSettings } from "@/schemas/tenantSettings.schema";
import { getTenantSlug } from "@/lib/tenantContext";

const STORAGE_KEY = "tenantSettings";

// Mock API functions - estructura lista para reemplazar con API real
export const tenantSettingsService = {
  async getTenantSettings(): Promise<TenantSettings | null> {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const tenantSlug = getTenantSlug();
    if (!tenantSlug) return null;

    const key = `${STORAGE_KEY}:${tenantSlug}`;
    const stored = localStorage.getItem(key);
    
    if (stored) {
      return JSON.parse(stored);
    }

    // Retornar defaults si no existe
    return {
      companyName: "",
      country: "CR",
      currency: "CRC",
      taxEnabled: true,
      taxName: "IVA",
      taxRate: 13,
      invoicePrefix: "INV-",
      nextInvoiceNumber: 1,
      onboardingCompleted: false,
    };
  },

  async saveTenantSettings(settings: TenantSettings): Promise<TenantSettings> {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const tenantSlug = getTenantSlug();
    if (!tenantSlug) {
      throw new Error("No tenant context found");
    }

    const key = `${STORAGE_KEY}:${tenantSlug}`;
    localStorage.setItem(key, JSON.stringify(settings));
    
    return settings;
  },

  async completeTenantOnboarding(settings: Partial<TenantSettings>): Promise<TenantSettings> {
    const current = await this.getTenantSettings();
    
    const updated: TenantSettings = {
      ...current!,
      ...settings,
      onboardingCompleted: true,
    };

    const result = await this.saveTenantSettings(updated);

    // Auto-activate country pack based on selected country
    if (settings.country) {
      const countryCode = settings.country.toLowerCase();
      const countryPackKey = `countryPack:${countryCode}`;
      
      // Activate the country pack for the selected country
      localStorage.setItem(countryPackKey, JSON.stringify(true));
    }

    return result;
  },
};
