"use client";

import { t } from "@/i18n";

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
import { Button } from "@/components/ui/button";

interface Tenant {
    id: string;
    name: string;
    slug: string;
    plan: "starter" | "professional" | "enterprise";
    status: "active" | "inactive" | "suspended";
    invoices: number;
    revenue: string;
}

const tenants: Tenant[] = [
    {
        id: "tenant_001",
        name: "Acme Corporation",
        slug: "acme-corporation",
        plan: "professional",
        status: "active",
        invoices: 127,
        revenue: "$45,231",
    },
    {
        id: "tenant_002",
        name: "Tech Solutions Inc",
        slug: "tech-solutions",
        plan: "enterprise",
        status: "active",
        invoices: 543,
        revenue: "$156,480",
    },
    {
        id: "tenant_003",
        name: "Global Services Ltd",
        slug: "global-services",
        plan: "starter",
        status: "active",
        invoices: 34,
        revenue: "$8,920",
    },
    {
        id: "tenant_004",
        name: "Digital Ventures",
        slug: "digital-ventures",
        plan: "professional",
        status: "inactive",
        invoices: 89,
        revenue: "$32,100",
    },
    {
        id: "tenant_005",
        name: "Innovation Labs",
        slug: "innovation-labs",
        plan: "enterprise",
        status: "active",
        invoices: 287,
        revenue: "$124,560",
    },
];

function getPlanBadge(plan: Tenant["plan"]) {
    const colors = {
        starter: "bg-blue-100 text-blue-800",
        professional: "bg-purple-100 text-purple-800",
        enterprise: "bg-yellow-100 text-yellow-800",
    };
    return colors[plan];
}

function getStatusBadge(status: Tenant["status"]) {
    const colors = {
        active: "bg-green-100 text-green-800",
        inactive: "bg-gray-100 text-gray-800",
        suspended: "bg-red-100 text-red-800",
    };
    return colors[status];
}

export function TenantManagementTable() {
    return (
        <Card className="p-6">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">Tenants</h2>
                        <p className="text-sm text-muted-foreground">
                            Manage all platform tenants
                        </p>
                    </div>
                    <Button size="sm">Add Tenant</Button>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tenant Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>{t().common.invoices}</TableHead>
                                <TableHead>Revenue</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tenants.map((tenant) => (
                                <TableRow key={tenant.id}>
                                    <TableCell className="font-medium">
                                        {tenant.name}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {tenant.slug}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={getPlanBadge(tenant.plan)}
                                        >
                                            {tenant.plan.charAt(0).toUpperCase() +
                                                tenant.plan.slice(1)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={getStatusBadge(tenant.status)}
                                        >
                                            {tenant.status.charAt(0).toUpperCase() +
                                                tenant.status.slice(1)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{tenant.invoices}</TableCell>
                                    <TableCell className="font-semibold">
                                        {tenant.revenue}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">
                                            View
                                        </Button>
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
