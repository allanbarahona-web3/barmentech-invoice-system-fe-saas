/**
 * Pricing Plans Configuration
 * Single source of truth for all pricing plans
 * All user-facing strings should use i18n t() function
 */

export type PlanId = "trial" | "starter" | "pro";

export interface Plan {
  id: PlanId;
  name: string; // i18n key
  monthlyPrice: number | null; // null = free/trial
  currency: string;
  description: string; // i18n key
  features: string[]; // i18n keys
  highlighted?: boolean;
  badge?: string; // i18n key - "Popular", "Recommended", etc
  ctaLabel: string; // i18n key
  disabled?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "trial",
    name: "plans.trial.name",
    monthlyPrice: null,
    currency: "USD",
    description: "plans.trial.description",
    features: [
      "plans.trial.features.duration",
      "plans.trial.features.invoices",
      "plans.trial.features.customers",
      "plans.trial.features.products",
      "plans.trial.features.support",
    ],
    ctaLabel: "plans.trial.cta",
    disabled: true,
  },
  {
    id: "starter",
    name: "plans.starter.name",
    monthlyPrice: 29,
    currency: "USD",
    description: "plans.starter.description",
    features: [
      "plans.starter.features.unlimitedInvoices",
      "plans.starter.features.unlimitedCustomers",
      "plans.starter.features.unlimitedProducts",
      "plans.starter.features.emailSupport",
      "plans.starter.features.exportPdf",
      "plans.starter.features.branding",
    ],
    ctaLabel: "plans.starter.cta",
    highlighted: false,
  },
  {
    id: "pro",
    name: "plans.pro.name",
    monthlyPrice: 79,
    currency: "USD",
    description: "plans.pro.description",
    features: [
      "plans.pro.features.everything",
      "plans.pro.features.multiUser",
      "plans.pro.features.api",
      "plans.pro.features.prioritySupport",
      "plans.pro.features.customReports",
      "plans.pro.features.whiteLabel",
    ],
    badge: "plans.pro.badge",
    ctaLabel: "plans.pro.cta",
    highlighted: true,
  },
];

export function getPlanById(id: PlanId): Plan | undefined {
  return PLANS.find((plan) => plan.id === id);
}

export function getActivePlans(): Plan[] {
  return PLANS.filter((plan) => plan.id !== "trial");
}
