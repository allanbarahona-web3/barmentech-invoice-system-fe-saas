"use client";

import { Invoice } from "../invoice.schema";
import { CompanyProfile } from "@/modules/company/company.schema";
import { Customer } from "@/modules/customers/customer.schema";
import { TenantSettings } from "@/schemas/tenantSettings.schema";
import { isCREnabled } from "@/modules/company/company.country";
import { buildCRFiscalSummary } from "@/country-packs/cr";
import { t } from "@/i18n";

interface InvoicePreviewProps {
  invoice: Invoice;
  companyProfile: CompanyProfile;
  customer: Customer;
  tenantSettings: TenantSettings;
}

export function InvoicePreview({
  invoice,
  companyProfile,
  customer,
  tenantSettings,
}: InvoicePreviewProps) {
  const { branding, legal, fiscal } = companyProfile;
  const showCRInfo = isCREnabled(legal.country);

  const getPaymentTermsLabel = () => {
    switch (invoice.paymentTerms) {
      case "due_on_receipt":
        return "Contado";
      case "net_15":
        return "Net 15";
      case "net_30":
        return "Net 30";
      case "net_60":
        return "Net 60";
      case "net_90":
        return "Net 90";
      case "custom":
        return invoice.customNetDays ? `Custom (${invoice.customNetDays} días)` : "Custom";
      default:
        return "Contado";
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: invoice.currency || legal.currency,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("es-CR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateString));
  };

  return (
    <div className="bg-white text-black min-h-screen p-8 print:p-0">
      <div className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none">
        {/* Header */}
        <div
          className="p-8 border-b-4"
          style={{
            borderColor: branding.primaryColor || "#000000",
          }}
        >
          <div className="flex justify-between items-start">
            {/* Company Info */}
            <div className="space-y-2">
              {branding.logoUrl && (
                <img
                  src={branding.logoUrl}
                  alt="Logo"
                  className="h-16 object-contain mb-4"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              <h1 className="text-2xl font-bold text-gray-900">
                {legal.commercialName || legal.legalName}
              </h1>
              {legal.commercialName && legal.legalName !== legal.commercialName && (
                <p className="text-sm text-gray-600">{legal.legalName}</p>
              )}
              {fiscal.taxId && (
                <p className="text-sm text-gray-700">
                  {t().invoicePreview.taxId}: <span className="font-medium">{fiscal.taxId}</span>
                </p>
              )}
              {legal.address && <p className="text-sm text-gray-600">{legal.address}</p>}
              <div className="text-sm text-gray-600">
                {legal.email && <div>{legal.email}</div>}
                {legal.phone && <div>{legal.phone}</div>}
              </div>
            </div>

            {/* Invoice Info */}
            <div className="text-right space-y-2">
              <h2
                className="text-3xl font-bold"
                style={{ color: branding.primaryColor || "#000000" }}
              >
                {invoice.type === "quote" ? t().invoicePreview.quote : t().invoicePreview.invoice}
              </h2>
              <div className="text-sm space-y-1">
                <div>
                  <span className="text-gray-600">{t().invoicePreview.number}:</span>{" "}
                  <span className="font-semibold">{invoice.invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t().invoicePreview.date}:</span>{" "}
                  <span className="font-medium">{formatDate(invoice.createdAt)}</span>
                </div>
                {invoice.paymentTerms !== "due_on_receipt" && invoice.dueDate && (
                  <>
                    <div>
                      <span className="text-gray-600">Términos:</span>{" "}
                      <span className="font-medium">{getPaymentTermsLabel()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Vence:</span>{" "}
                      <span className="font-medium">{formatDate(invoice.dueDate)}</span>
                    </div>
                  </>
                )}
                <div>
                  <span className="text-gray-600">{t().invoicePreview.status}:</span>{" "}
                  <span
                    className="inline-block px-2 py-1 text-xs font-medium rounded"
                    style={{
                      backgroundColor:
                        invoice.status === "issued" || invoice.status === "sent"
                          ? branding.secondaryColor || "#10b981"
                          : "#d1d5db",
                      color:
                        invoice.status === "issued" || invoice.status === "sent"
                          ? "#ffffff"
                          : "#000000",
                    }}
                  >
                    {invoice.status === "issued"
                      ? t().invoices.statusIssued
                      : invoice.status === "sent"
                        ? t().invoices.statusSent
                        : invoice.status === "archived"
                          ? t().invoices.statusArchived
                          : t().invoices.statusDraft}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CR Fiscal Info (if applicable) */}
          {showCRInfo && fiscal.cr && (
            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600">
              <div className="grid grid-cols-2 gap-2">
                {buildCRFiscalSummary(fiscal.cr).map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Customer Section */}
        <div className="p-8 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
            {t().invoicePreview.billedTo}
          </h3>
          <div className="space-y-1">
            <p className="font-semibold text-gray-900">{customer.name}</p>
            {customer.idNumber && (
              <p className="text-sm text-gray-600">
                {t().invoicePreview.idNumber}: {customer.idNumber}
              </p>
            )}
            {customer.email && <p className="text-sm text-gray-600">{customer.email}</p>}
            {customer.phone && <p className="text-sm text-gray-600">{customer.phone}</p>}
            {customer.address && <p className="text-sm text-gray-600">{customer.address}</p>}
          </div>
        </div>

        {/* Items Table */}
        <div className="p-8">
          <table className="w-full">
            <thead>
              <tr
                className="border-b-2"
                style={{ borderColor: branding.primaryColor || "#000000" }}
              >
                <th className="text-left py-3 font-semibold text-gray-700">
                  {t().invoicePreview.description}
                </th>
                <th className="text-right py-3 font-semibold text-gray-700 w-24">
                  {t().invoicePreview.qty}
                </th>
                <th className="text-right py-3 font-semibold text-gray-700 w-32">
                  {t().invoicePreview.unitPrice}
                </th>
                <th className="text-right py-3 font-semibold text-gray-700 w-32">
                  {t().invoicePreview.amount}
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-3 text-gray-800">{item.description}</td>
                  <td className="py-3 text-right text-gray-800">{item.qty}</td>
                  <td className="py-3 text-right text-gray-800">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="py-3 text-right font-medium text-gray-900">
                    {formatCurrency(item.qty * item.unitPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="mt-8 flex justify-end">
            <div className="w-80 space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>{t().invoicePreview.subtotal}:</span>
                <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
              </div>

              {tenantSettings.taxEnabled && invoice.tax > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>
                    {tenantSettings.taxName} ({tenantSettings.taxRate}%):
                  </span>
                  <span className="font-medium">{formatCurrency(invoice.tax)}</span>
                </div>
              )}

              <div
                className="flex justify-between text-lg font-bold pt-2 border-t-2"
                style={{ borderColor: branding.primaryColor || "#000000" }}
              >
                <span>{t().invoicePreview.total}:</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {branding.invoiceFooter && (
          <div className="p-8 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center whitespace-pre-line">
              {branding.invoiceFooter}
            </p>
          </div>
        )}

        {/* Bottom Border */}
        <div
          className="h-2"
          style={{
            backgroundColor: branding.secondaryColor || branding.primaryColor || "#000000",
          }}
        />
      </div>
    </div>
  );
}
