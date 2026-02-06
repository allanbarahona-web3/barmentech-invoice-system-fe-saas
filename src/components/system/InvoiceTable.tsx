"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Invoice } from "@/services/invoiceService";
import { MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, formatDate } from "@/lib/utils";
import { t } from "@/i18n";

interface InvoiceTableProps {
    invoices: Invoice[];
    isLoading?: boolean;
    onEdit?: (invoice: Invoice) => void;
    onDelete?: (id: string) => void;
}

function getStatusBadge(status: Invoice["status"]) {
    const colors = {
        draft: "bg-gray-100 text-gray-800",
        sent: "bg-blue-100 text-blue-800",
        paid: "bg-green-100 text-green-800",
        overdue: "bg-red-100 text-red-800",
    };
    return colors[status];
}

export function InvoiceTable({
    invoices,
    isLoading,
    onEdit,
    onDelete,
}: InvoiceTableProps) {
    if (isLoading) {
        return (
            <Card className="p-6">
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                    ))}
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice #</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices && invoices.length > 0 ? (
                            invoices.map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-semibold">
                                        {invoice.number}
                                    </TableCell>
                                    <TableCell>
                                        {invoice.customerName}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {formatCurrency(invoice.amount)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={getStatusBadge(
                                                invoice.status
                                            )}
                                        >
                                            {invoice.status
                                                .charAt(0)
                                                .toUpperCase() +
                                                invoice.status.slice(1)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(invoice.dueDate)}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {formatDate(invoice.createdAt)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        onEdit?.(invoice)
                                                    }
                                                >
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        onDelete?.(invoice.id)
                                                    }
                                                    className="text-red-600"
                                                >
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="text-center text-muted-foreground py-8"
                                >
                                    {t().common.noInvoicesFound}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </Card>
    );
}
