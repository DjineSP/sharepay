"use client";

import { AdminPageHeading } from "@/components/admin/overview/admin-page-heading";
import { AdminStatsGrid } from "@/components/admin/overview/admin-stats-grid";
import { AdminActivityFeed } from "@/components/admin/overview/admin-activity-feed";
import { Users, Server, ShieldAlert, Database, Zap, Globe, Cpu } from "lucide-react";

export default function AdminDashboardPage() {
    const stats = [
        {
            label: "Volume Global (24h)",
            value: "12 450 000 FCFA",
            badge: { label: "+8.2%", className: "text-emerald-600 bg-emerald-500/10" },
            icon: <Globe className="h-5 w-5" />,
            iconWrapClassName: "bg-emerald-500/10 text-emerald-600",
            progress: { value: 72, className: "bg-emerald-500" },
        },
        {
            label: "Nouveaux Marchands",
            value: "124",
            badge: { label: "+15", className: "text-blue-600 bg-blue-500/10" },
            icon: <Users className="h-5 w-5" />,
            iconWrapClassName: "bg-blue-500/10 text-blue-600",
            progress: { value: 45, className: "bg-blue-500" },
        },
        {
            label: "Santé Système",
            value: "99.98%",
            badge: { label: "Stable", className: "text-emerald-600 bg-emerald-500/10" },
            icon: <Cpu className="h-5 w-5" />,
            iconWrapClassName: "bg-emerald-500/10 text-emerald-600",
            progress: { value: 100, className: "bg-emerald-500" },
        },
    ];

    const alerts = [
        {
            id: "sys-1",
            title: "Trafic suspect détecté",
            meta: "Il y a 5 min • IP 192.168.1.1",
            badge: "ALERTE",
            status: "Sévérité Haute",
            badgeClassName: "text-red-600",
            statusClassName: "text-red-600/70",
            icon: <ShieldAlert className="h-5 w-5" />,
            iconWrapClassName: "bg-red-500/10 text-red-600",
        },
        {
            id: "sys-2",
            title: "Sauvegarde réussie",
            meta: "Il y a 2h • DB_Main",
            badge: "OK",
            status: "Automatique",
            badgeClassName: "text-emerald-600",
            statusClassName: "text-emerald-600/70",
            icon: <Database className="h-5 w-5" />,
            iconWrapClassName: "bg-emerald-500/10 text-emerald-600",
        },
    ];

    return (
        <div className="space-y-8">
            <AdminPageHeading
                title="Tableau de Bord Administrateur"
                subtitle="Vue d'ensemble de l'écosystème SharePay"
            />

            <AdminStatsGrid stats={stats} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-card text-card-foreground rounded-xl border p-6 shadow-sm flex items-center justify-center min-h-[260px]">
                    <p className="text-sm text-muted-foreground">Graphique des transactions - à brancher sur l'API admin</p>
                </div>
                <AdminActivityFeed
                    title="Alertes Système & Sécurité"
                    viewAllLabel="Journal complet"
                    items={alerts}
                    onViewAll={() => {}}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border rounded-xl bg-card shadow-sm flex items-center space-x-4 border-emerald-100 dark:border-emerald-900/30">
                    <div className="p-3 bg-emerald-500/10 rounded-lg">
                        <Zap className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">Performance API</h3>
                        <p className="text-sm text-emerald-600/80">Temps de réponse moyen : 45ms</p>
                    </div>
                </div>
                <div className="p-6 border rounded-xl bg-card shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                        <Server className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Serveurs Actifs</h3>
                        <p className="text-sm text-muted-foreground">8 instances opérationnelles / 2 régions</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
