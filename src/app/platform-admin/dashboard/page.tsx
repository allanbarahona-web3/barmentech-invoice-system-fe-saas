import { Card } from "@/components/ui/card";
import { Building2, Users, TrendingUp, Activity } from "lucide-react";

export default function PlatformAdminDashboardPage() {
    const metrics = [
        {
            label: "Total Tenants",
            value: "24",
            icon: <Building2 className="w-6 h-6 text-blue-500" />,
            trend: { value: 3, label: "this month", positive: true },
        },
        {
            label: "Total Users",
            value: "156",
            icon: <Users className="w-6 h-6 text-purple-500" />,
            trend: { value: 12, label: "active now", positive: true },
        },
        {
            label: "Monthly Revenue",
            value: "$45,231",
            icon: <TrendingUp className="w-6 h-6 text-green-500" />,
            trend: { value: 8, label: "vs last month", positive: true },
        },
        {
            label: "System Health",
            value: "99.9%",
            icon: <Activity className="w-6 h-6 text-emerald-500" />,
            trend: { value: 0, label: "uptime", positive: true },
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold">Welcome back!</h2>
                <p className="text-muted-foreground">
                    Platform overview and system status
                </p>
            </div>

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
                                                    : "text-red-600"
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
        </div>
    );
}
