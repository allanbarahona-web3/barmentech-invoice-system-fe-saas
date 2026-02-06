"use client";

import { useState } from "react";
import { Pencil, Trash2, Loader2, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Customer } from "../customer.schema";
import { useCustomers, useDeleteCustomer } from "../customer.hooks";
import { CustomerDialog } from "./CustomerDialog";
import { useToast } from "@/hooks/use-toast";
import { t } from "@/i18n";

export function CustomersTable() {
  const { data: customers, isLoading } = useCustomers();
  const deleteMutation = useDeleteCustomer();
  const { toast } = useToast();

  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>();
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | undefined>();

  const handleDelete = () => {
    if (!deletingCustomer) return;

    deleteMutation.mutate(deletingCustomer.id, {
      onSuccess: () => {
        toast({
          title: t().customers.deleteSuccessTitle,
          description: t().customers.deleteSuccessDescription,
        });
        setDeletingCustomer(undefined);
      },
      onError: () => {
        toast({
          title: t().customers.deleteErrorTitle,
          description: t().customers.deleteErrorDescription,
          variant: "destructive",
        });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!customers || customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <svg
            className="h-8 w-8 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">{t().customers.emptyTitle}</h3>
        <p className="text-muted-foreground">{t().customers.emptyDescription}</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t().customers.tableHeaderName}</TableHead>
              <TableHead>{t().customers.tableHeaderEmail}</TableHead>
              <TableHead>{t().customers.tableHeaderPhone}</TableHead>
              <TableHead>{t().customers.tableHeaderStatus}</TableHead>
              <TableHead className="text-right">{t().customers.tableHeaderActions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>
                  {customer.email ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span className="text-sm">{customer.email}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {customer.phone ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span className="text-sm">{customer.phone}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={customer.status === "active" ? "default" : "secondary"}>
                    {customer.status === "active"
                      ? t().customers.statusActive
                      : t().customers.statusInactive}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingCustomer(customer)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingCustomer(customer)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <CustomerDialog
        open={!!editingCustomer}
        onOpenChange={(open) => !open && setEditingCustomer(undefined)}
        customer={editingCustomer}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingCustomer}
        onOpenChange={(open) => !open && setDeletingCustomer(undefined)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t().customers.deleteConfirmTitle}</DialogTitle>
            <DialogDescription>
              {t().customers.deleteConfirmDescription}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingCustomer(undefined)}
              disabled={deleteMutation.isPending}
            >
              {t().customers.cancelButton}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t().customers.deleteButton}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
