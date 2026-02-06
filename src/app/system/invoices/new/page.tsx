"use client";

// Note: TypeScript control type errors are false positives due to Zod .default() behavior.
// The form works correctly at runtime. See: https://github.com/react-hook-form/resolvers/issues/270

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Plus, Trash2, ArrowLeft } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InvoiceInput, invoiceInputSchema } from "@/modules/invoices/invoice.schema";
import { useCreateInvoice } from "@/modules/invoices/invoice.hooks";
import { calcLineTotal } from "@/modules/invoices/invoice.calc";
import { useCustomers } from "@/modules/customers/customer.hooks";
import { useProducts } from "@/modules/products/product.hooks";
import { useCompanyProfile } from "@/modules/company/company.hooks";
import { useTenantSettingsQuery } from "@/hooks/useTenantSettings";
import { useIsTrialActive } from "@/modules/billing/trial.hooks";
import { TrialExpiredDialog } from "@/modules/billing/components/TrialExpiredDialog";
import { useToast } from "@/hooks/use-toast";
import { CURRENCIES } from "@/constants/currencies";
import { t } from "@/i18n";
import Link from "next/link";

export default function NewInvoicePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showTrialExpired, setShowTrialExpired] = useState(false);
  
  const { data: customers, isLoading: loadingCustomers } = useCustomers();
  const { data: products, isLoading: loadingProducts } = useProducts();
  const { data: settings } = useTenantSettingsQuery();
  const { data: companyProfile } = useCompanyProfile();
  const { data: isTrialActive } = useIsTrialActive();
  const createMutation = useCreateInvoice();

  const enableMultiCurrency = companyProfile?.legal?.enableMultiCurrency || false;
  const defaultCurrency = companyProfile?.legal?.currency || settings?.currency || "USD";

  const form = useForm<InvoiceInput>({
    // @ts-expect-error - Zod .default() makes type optional in TypeScript but it works at runtime
    resolver: zodResolver(invoiceInputSchema),
    defaultValues: {
      type: "invoice",
      customerId: "",
      currency: defaultCurrency,
      paymentTerms: "due_on_receipt",
      customNetDays: undefined,
      items: [
        {
          description: "",
          qty: 1,
          unitPrice: 0,
          productId: undefined,
        },
      ],
      status: "draft",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchItems = form.watch("items");
  const watchType = form.watch("type");
  const watchPaymentTerms = form.watch("paymentTerms");
  
  // Calculate totals
  const subtotal = watchItems.reduce((sum, item) => {
    return sum + (item.qty || 0) * (item.unitPrice || 0);
  }, 0);

  const taxAmount = settings?.taxEnabled
    ? (subtotal * ((settings.taxRate ?? 0) / 100))
    : 0;

  const total = subtotal + taxAmount;

  const onSubmit = (data: InvoiceInput, navigateToPreview = false) => {
    console.log('[NewInvoicePage] onSubmit called:', {
      navigateToPreview,
      type: data.type,
      customerId: data.customerId,
      itemsCount: data.items.length,
    });

    // Check if trial is active before creating invoice
    if (isTrialActive === false) {
      console.log('[NewInvoicePage] Trial expired, showing dialog');
      setShowTrialExpired(true);
      return;
    }

    // Ensure type field has a value (fallback to "invoice" if undefined due to schema default)
    const invoiceData: InvoiceInput = {
      ...data,
      type: data.type || "invoice",
    };

    console.log('[NewInvoicePage] Creating invoice/quote with data:', invoiceData);

    createMutation.mutate(invoiceData, {
      onSuccess: (newInvoice) => {
        console.log('[NewInvoicePage] Invoice/quote created successfully:', {
          id: newInvoice.id,
          number: newInvoice.invoiceNumber,
          type: newInvoice.type,
          navigateToPreview,
        });

        if (navigateToPreview) {
          console.log('[NewInvoicePage] Navigating to preview:', `/system/invoices/${newInvoice.id}`);
          // Navigate to preview
          router.push(`/system/invoices/${newInvoice.id}`);
        } else {
          console.log('[NewInvoicePage] Draft saved, navigating to list');
          // Show toast and stay on page or go to list
          toast({
            title: t().invoices.draftSavedTitle,
            description: t().invoices.draftSavedDescription,
          });
          router.push("/system/invoices");
        }
      },
      onError: (error) => {
        console.error('[NewInvoicePage] Error creating invoice/quote:', error);
        toast({
          title: t().invoices.createErrorTitle,
          description: t().invoices.createErrorDescription,
          variant: "destructive",
        });
      },
    });
  };

  const handleSaveDraft = () => {
    console.log('[NewInvoicePage] handleSaveDraft called');
    form.handleSubmit((data) => onSubmit(data as unknown as InvoiceInput, false))();
  };

  const handlePreview = () => {
    console.log('[NewInvoicePage] handlePreview called');
    form.handleSubmit((data) => onSubmit(data as unknown as InvoiceInput, true))();
  };

  const handleProductSelect = (index: number, productId: string) => {
    console.log('[NewInvoicePage] Product selected:', { index, productId });
    const product = products?.find(p => p.id === productId);
    if (product) {
      console.log('[NewInvoicePage] Product found, filling item:', {
        description: product.description || product.name,
        price: product.price,
      });
      // Use product description if available, otherwise fall back to name
      form.setValue(`items.${index}.description`, product.description || product.name);
      form.setValue(`items.${index}.unitPrice`, product.price);
      form.setValue(`items.${index}.productId`, product.id);
    } else {
      console.warn('[NewInvoicePage] Product not found:', productId);
    }
  };

  const addItem = () => {
    append({
      description: "",
      qty: 1,
      unitPrice: 0,
      productId: undefined,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/system/invoices">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {watchType === "quote" ? t().invoices.newQuoteTitle : t().invoices.newInvoiceTitle}
          </h1>
          <p className="text-muted-foreground mt-1">
            {watchType === "quote" ? t().invoices.newQuoteDescription : t().invoices.newInvoiceDescription}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {t().invoices.statusDraft}
            </span>
            <span className="text-sm text-muted-foreground">
              {watchType === "quote" ? t().invoices.numberPlaceholderQuote : t().invoices.numberPlaceholderInvoice}
            </span>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          {/* Document Type & Customer Selection */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t().invoices.customerSection}</h3>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Row 1: Document Type + Customer */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t().invoices.documentTypeLabel}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="invoice">{t().invoices.documentTypeInvoice}</SelectItem>
                          <SelectItem value="quote">{t().invoices.documentTypeQuote}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t().invoices.customerLabel}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={loadingCustomers}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t().invoices.customerPlaceholder} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers?.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Row 2: Currency + Payment Terms */}
                {enableMultiCurrency ? (
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t().invoices.currencyLabel}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t().invoices.selectCurrency} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CURRENCIES.map((curr) => (
                              <SelectItem key={curr.code} value={curr.code}>
                                {curr.symbol} {curr.code} - {curr.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <div />
                )}

                <FormField
                  control={form.control}
                  name="paymentTerms"
                  render={({ field }) => (
                    <FormItem className={!enableMultiCurrency ? "md:col-span-2" : undefined}>
                      <FormLabel>Condiciones de pago</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="due_on_receipt">Contado (inmediato)</SelectItem>
                          <SelectItem value="net_15">Crédito: Net 15</SelectItem>
                          <SelectItem value="net_30">Crédito: Net 30</SelectItem>
                          <SelectItem value="net_60">Crédito: Net 60</SelectItem>
                          <SelectItem value="net_90">Crédito: Net 90</SelectItem>
                          <SelectItem value="custom">Crédito: Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />

                      {watchPaymentTerms === "custom" && (
                        <div className="mt-3">
                          <FormField
                            control={form.control}
                            name="customNetDays"
                            render={({ field: daysField }) => (
                              <FormItem>
                                <FormLabel>Días (custom)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={1}
                                    max={365}
                                    placeholder="Ej: 45"
                                    value={daysField.value ?? ""}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      daysField.onChange(value === "" ? undefined : Number(value));
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Card>

          {/* Items */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t().invoices.itemsSection}</h3>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                {t().invoices.addItemButton}
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">{t().invoices.itemDescription}</TableHead>
                    <TableHead className="w-[15%]">{t().invoices.itemQty}</TableHead>
                    <TableHead className="w-[20%]">{t().invoices.itemPrice}</TableHead>
                    <TableHead className="w-[20%] text-right">{t().invoices.itemTotal}</TableHead>
                    <TableHead className="w-[5%]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => {
                    const item = watchItems[index];
                    const lineTotal = (item?.qty || 0) * (item?.unitPrice || 0);

                    return (
                      <TableRow key={field.id}>
                        <TableCell>
                          <div className="space-y-2">
                            {!loadingProducts && products && products.length > 0 && (
                              <Select
                                onValueChange={(value) => handleProductSelect(index, value)}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder={t().invoices.selectProduct} />
                                </SelectTrigger>
                                <SelectContent>
                                  {products.map((product) => (
                                    <SelectItem key={product.id} value={product.id}>
                                      {product.name} - {settings?.currency} {product.price.toFixed(2)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                            <FormField
                              control={form.control}
                              name={`items.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      placeholder={t().invoices.itemDescriptionPlaceholder}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.qty`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.unitPrice`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {settings?.currency} {lineTotal.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Totals */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t().invoices.totalsSection}</h3>
            <div className="space-y-2 max-w-sm ml-auto">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t().invoices.subtotal}</span>
                <span className="font-medium">{settings?.currency} {subtotal.toFixed(2)}</span>
              </div>
              {settings?.taxEnabled && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {settings.taxName} ({settings.taxRate}%)
                  </span>
                  <span className="font-medium">{settings.currency} {taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>{t().invoices.total}</span>
                <span>{settings?.currency} {total.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-between gap-3">
            <Link href="/system/invoices">
              <Button type="button" variant="ghost">
                {t().invoices.cancelButton}
              </Button>
            </Link>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t().invoices.saveDraftButton}
              </Button>
              <Button
                type="button"
                onClick={handlePreview}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t().invoices.previewButton}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      {/* Trial Expired Dialog */}
      <TrialExpiredDialog
        open={showTrialExpired}
        onOpenChange={setShowTrialExpired}
      />
    </div>
  );
}
