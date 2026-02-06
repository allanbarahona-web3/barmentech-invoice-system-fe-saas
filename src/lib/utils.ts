import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format number as currency (USD)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/**
 * Format date string to readable format
 */
export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

/**
 * Handle logout: clear auth context, tenant context, and redirect
 */
export function performLogout(router: { push: (path: string) => void }) {
  if (typeof window !== "undefined") {
    // Dynamic imports to avoid circular dependencies
    const { clearAuthContext } = require("@/lib/authContext");
    const { clearTenantContext } = require("@/lib/tenantContext");
    
    clearAuthContext();
    clearTenantContext();
  }
  router.push("/login");
}
