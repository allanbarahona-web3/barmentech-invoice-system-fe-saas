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
import { Card } from "@/components/ui/card";
import { t } from "@/i18n";

interface Invoice {
    id: string;
    customer: string;
    amount: string;
    status: "paid" | "pending" | "overdue";
    date: string;
}

const invoices: Invoice[] = [
    {
        id: "INV-001",
        customer: "Acme Corporation",
        amount: "$2,500.00",
        status: "paid",
        date: "Feb 1, 2026",
    },
    {
        id: "INV-002",
        customer: "Tech Solutions Inc",
        amount: "$1,800.00",
        status: "pending",
        date: "Feb 2, 2026",
    },
    {
        id: "INV-003",
        customer: "Global Services Ltd",
        amount: "$3,200.00",
        status: "paid",
        date: "Feb 3, 2026",
    },
    {
        id: "INV-004",
        customer: "Digital Ventures",
        amount: "$950.00",
        status: "overdue",
        date: "Jan 28, 2026",
    },
    {
        id: "INV-005",
        customer: "Innovation Labs",
        amount: "$4,100.00",
        status: "paid",
        date: "Feb 2, 2026",
    },
];

function getStatusColor(status: Invoice["status"]) {
    switch (status) {
        case "paid":
            return "bg-green-100 text-green-800";
        case "pending":
            return "bg-blue-100 text-blue-800";
        case "overdue":
            return "bg-red-100 text-red-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
}

export function RecentInvoicesTable() {
    return (
        <Card className="p-6">
            <div className="space-y-4">
                <div>
                    <h2 className="text-lg font-semibold">{t().system.recentInvoicesTitle}</h2>
                    <p className="text-sm text-muted-foreground">
                        {t().system.recentInvoicesDescription}
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">
                                        {invoice.id}
                                    </TableCell>
                                    <TableCell>{invoice.customer}</TableCell>
                                    <TableCell>{invoice.amount}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={getStatusColor(invoice.status)}
                                        >
                                            {invoice.status.charAt(0).toUpperCase() +
                                                invoice.status.slice(1)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {invoice.date}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </Card>
    );
}
