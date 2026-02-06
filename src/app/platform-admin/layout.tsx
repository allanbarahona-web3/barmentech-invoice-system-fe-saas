"use client";

import { PlatformSidebar } from "@/components/platform-admin/PlatformSidebar";
import { PlatformHeader } from "@/components/platform-admin/PlatformHeader";
import { PlatformAdminGuard } from "@/lib/routeGuards";

function LayoutContent({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-background">
            <PlatformSidebar />
            <div className="flex flex-1 flex-col">
                <PlatformHeader />
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function PlatformAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PlatformAdminGuard>
            <LayoutContent>{children}</LayoutContent>
        </PlatformAdminGuard>
    );
}
