"use client";

import { Card } from "@/components/ui/card";

interface InvoicePreviewLiveProps {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  invoiceFooter?: string;
  legalName?: string;
  commercialName?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  currency?: string;
}

export function InvoicePreviewLive({
  logoUrl,
  primaryColor = "#000000",
  secondaryColor = "#666666",
  invoiceFooter,
  legalName,
  commercialName,
  email,
  phone,
  address,
  taxId,
  currency = "USD",
}: InvoicePreviewLiveProps) {
  return (
    <Card className="p-6 bg-white">
      <div className="space-y-6">
        {/* Preview label */}
        <div className="flex items-center justify-between pb-4 border-b">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Vista previa
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Así se verá tu factura
            </p>
          </div>
          <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            Live Preview
          </div>
        </div>

        {/* Invoice preview - simplified version */}
        <div className="border rounded-lg p-6 bg-gradient-to-b from-white to-gray-50 shadow-sm scale-90 origin-top">
          {/* Header - affected by Branding */}
          <div
            className="border-b-4 pb-4 mb-4"
            style={{ borderColor: primaryColor }}
          >
            <div className="flex justify-between items-start">
              {/* Logo and company info */}
              <div className="space-y-2">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="h-12 object-contain mb-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="h-12 w-32 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400 mb-2">
                    Sin logo
                  </div>
                )}
                <h1
                  className="text-xl font-bold"
                  style={{ color: primaryColor }}
                >
                  {commercialName || legalName || "Nombre de tu empresa"}
                </h1>
                {commercialName && legalName && commercialName !== legalName && (
                  <p className="text-xs text-gray-600">{legalName}</p>
                )}
                {taxId && (
                  <p className="text-xs text-gray-700">
                    ID Fiscal: {taxId}
                  </p>
                )}
                {email && (
                  <p className="text-xs text-gray-600">{email}</p>
                )}
                {phone && (
                  <p className="text-xs text-gray-600">{phone}</p>
                )}
                {address && (
                  <p className="text-xs text-gray-600 max-w-xs">{address}</p>
                )}
              </div>

              {/* Invoice number - sample */}
              <div className="text-right">
                <h2 className="text-2xl font-bold" style={{ color: primaryColor }}>
                  FACTURA
                </h2>
                <p className="text-sm text-gray-600 mt-1">#0001</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date().toLocaleDateString('es-CR')}
                </p>
              </div>
            </div>
          </div>

          {/* Customer info - sample */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Cliente
            </h3>
            <div className="bg-gray-50 rounded p-3 border">
              <p className="text-sm font-medium">Cliente de ejemplo</p>
              <p className="text-xs text-gray-600">cliente@ejemplo.com</p>
            </div>
          </div>

          {/* Items table - sample */}
          <table className="w-full text-xs mb-6">
            <thead>
              <tr className="border-b-2" style={{ borderColor: secondaryColor }}>
                <th className="text-left py-2 font-semibold" style={{ color: secondaryColor }}>
                  Descripción
                </th>
                <th className="text-center py-2 font-semibold" style={{ color: secondaryColor }}>
                  Cantidad
                </th>
                <th className="text-right py-2 font-semibold" style={{ color: secondaryColor }}>
                  Precio
                </th>
                <th className="text-right py-2 font-semibold" style={{ color: secondaryColor }}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3">Producto de ejemplo</td>
                <td className="text-center py-3">1</td>
                <td className="text-right py-3">{currency} 100.00</td>
                <td className="text-right py-3">{currency} 100.00</td>
              </tr>
              <tr className="border-b">
                <td className="py-3">Servicio de ejemplo</td>
                <td className="text-center py-3">2</td>
                <td className="text-right py-3">{currency} 50.00</td>
                <td className="text-right py-3">{currency} 100.00</td>
              </tr>
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span>{currency} 200.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">IVA (13%):</span>
                <span>{currency} 26.00</span>
              </div>
              <div
                className="flex justify-between text-base font-bold pt-2 border-t-2"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                <span>Total:</span>
                <span>{currency} 226.00</span>
              </div>
            </div>
          </div>

          {/* Footer - affected by Branding */}
          {invoiceFooter && (
            <div className="border-t pt-4 mt-6">
              <p className="text-xs text-gray-600 text-center whitespace-pre-wrap">
                {invoiceFooter}
              </p>
            </div>
          )}

          {!invoiceFooter && (
            <div className="border-t pt-4 mt-6">
              <p className="text-xs text-gray-400 text-center italic">
                El pie de página aparecerá aquí
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
