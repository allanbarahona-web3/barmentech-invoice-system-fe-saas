"use client";

import { TenantDashboardCards } from "@/components/system/TenantDashboardCards";
import { RecentInvoicesTable } from "@/components/system/RecentInvoicesTable";
import { RevenueChart } from "@/components/system/RevenueChart";
import { InvoiceStatusChart } from "@/components/system/InvoiceStatusChart";
import { ReminderAlertCard } from "@/components/system/ReminderAlertCard";
import { CurrentPlanCard } from "@/modules/billing/components/CurrentPlanCard";
import { t } from "@/i18n";

export default function SystemDashboardPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                    <h2 className="text-3xl font-bold">{t().system.welcomeBack}</h2>
                    <p className="text-muted-foreground">
                        {t().system.dashboardOverview}
                    </p>
                </div>
                <CurrentPlanCard />
            </div>

            {/* Metrics Cards */}
            <TenantDashboardCards />

            {/* Reminder Alert */}
            <ReminderAlertCard />

            {/* Charts Section */}
            <div className="grid gap-6 lg:grid-cols-2">
                <RevenueChart />
                <InvoiceStatusChart />
            </div>

            {/* Recent Invoices Table */}
            <RecentInvoicesTable />
        </div>
    );
}
