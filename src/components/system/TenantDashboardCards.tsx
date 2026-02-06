"use client";

import { Card } from "@/components/ui/card";
import { FileText, DollarSign, Clock, CheckCircle } from "lucide-react";
import { t } from "@/i18n";

interface MetricCard {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: {
        value: number;
        label: string;
        positive?: boolean;
    };
}

const getMetrics = (): MetricCard[] => [
    {
        label: t().system.totalInvoices,
        value: 127,
        icon: <FileText className="w-6 h-6 text-blue-500" />,
        trend: {
            value: 12,
            label: "This month",
            positive: true,
        },
    },
    {
        label: t().system.totalRevenue,
        value: "$45,231",
        icon: <DollarSign className="w-6 h-6 text-green-500" />,
        trend: {
            value: 8,
            label: "vs last month",
            positive: true,
        },
    },
    {
        label: t().system.pendingPayment,
        value: "$12,450",
        icon: <Clock className="w-6 h-6 text-amber-500" />,
        trend: {
            value: 3,
            label: "invoices",
            positive: false,
        },
    },
    {
        label: t().system.paidInvoices,
        value: "89%",
        icon: <CheckCircle className="w-6 h-6 text-green-500" />,
        trend: {
            value: 5,
            label: "up from last month",
            positive: true,
        },
    },
];

export function TenantDashboardCards() {
    const metrics = getMetrics();
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric, index) => (
                <Card key={index} className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                            <p className="text-sm font-medium text-muted-foreground">
                                {metric.label}
                            </p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-2xl font-bold">{metric.value}</p>
                                {metric.trend && (
                                    <span
                                        className={`text-xs font-medium ${
                                            metric.trend.positive
                                                ? "text-green-600"
                                                : "text-amber-600"
                                        }`}
                                    >
                                        {metric.trend.positive ? "+" : ""}
                                        {metric.trend.value}% {metric.trend.label}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="text-muted-foreground">
                            {metric.icon}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
