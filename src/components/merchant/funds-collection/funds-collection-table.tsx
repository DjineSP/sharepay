"use client";

import * as React from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    RowData,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Copy, ExternalLink, Search, RefreshCw, Link2, SlidersHorizontal, X } from "lucide-react";
import { QrCodeDialog } from "@/components/merchant/funds-collection/qr-code-dialog";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/routing";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    FundCollectionResponse,
    FundCollectionStatus,
} from "@/features/merchant/fund-collections";

// Allow meta.className on every column
declare module "@tanstack/react-table" {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ColumnMeta<TData extends RowData, TValue> {
        className?: string;
    }
}

interface FundsCollectionTableProps {
    data: FundCollectionResponse[];
    onRefresh?: () => void;
    isLoading?: boolean;
}

const STATUS_BADGE: Record<FundCollectionStatus, { variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
    ACTIVE:  { variant: "default" },
    CLOSED:  { variant: "secondary" },
    EXPIRED: { variant: "outline", className: "border-amber-500 text-amber-600" },
    DELETED: { variant: "secondary", className: "opacity-50" },
};

export function FundsCollectionTable({ data, onRefresh, isLoading = false }: FundsCollectionTableProps) {
    const t = useTranslations("Dashboard.FundsCollection.Table");
    const router = useRouter();
    const [sorting, setSorting] = React.useState<SortingState>([{ id: "createdAt", desc: true }]);
    const [sortOrder, setSortOrder] = React.useState("newest");
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility] = React.useState<VisibilityState>({ createdAt: false });

    const columns: ColumnDef<FundCollectionResponse>[] = [
        {
            id: "no",
            header: t("no"),
            cell: ({ row }) => (
                <span className="text-muted-foreground text-sm tabular-nums">
                    {row.index + 1}
                </span>
            ),
            enableSorting: false,
        },
        {
            accessorKey: "title",
            header: t("name"),
            cell: ({ row }) => (
                <span className="font-medium text-foreground">{row.getValue("title")}</span>
            ),
        },
        {
            id: "amount",
            header: t("amount"),
            meta: { className: "hidden sm:table-cell" },
            cell: ({ row }) => {
                const { amount, amountFixed, currency } = row.original;
                if (!amountFixed || amount === null) {
                    return <span className="text-muted-foreground">{t("freeAmount")}</span>;
                }
                return (
                    <span className="font-medium">
                        {new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(amount)}
                    </span>
                );
            },
        },
        {
            accessorKey: "applicationName",
            header: t("application"),
            meta: { className: "hidden md:table-cell" },
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">{row.getValue("applicationName")}</span>
            ),
        },
        {
            id: "url",
            header: t("paymentLink"),
            meta: { className: "hidden lg:table-cell" },
            cell: ({ row }) => {
                const url = row.original.collectUrl;
                return (
                    <div className="flex items-center gap-1 max-w-[380px]">
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate text-sm text-primary underline underline-offset-4 hover:text-primary/80 flex items-center gap-1 min-w-0"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <span className="truncate">{url}</span>
                            <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(url);
                                toast.success(t("successCopy"), { description: t("descCopy") });
                            }}
                            title={t("copyLink")}
                        >
                            <Copy className="h-3 w-3" />
                        </Button>
                    </div>
                );
            },
        },
        {
            id: "qr",
            header: "QR Code",
            meta: { className: "hidden xl:table-cell text-center" },
            cell: ({ row }) => (
                <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                    <QrCodeDialog url={row.original.collectUrl} title={row.original.title} />
                </div>
            ),
            enableSorting: false,
        },
        {
            accessorKey: "status",
            header: t("status"),
            cell: ({ row }) => {
                const status = row.getValue("status") as FundCollectionStatus;
                const cfg = STATUS_BADGE[status];
                const label = status === "ACTIVE" ? t("statusActive")
                    : status === "CLOSED" ? t("statusClosed")
                    : status === "EXPIRED" ? t("statusExpired")
                    : status;
                return (
                    <Badge variant={cfg.variant} className={cfg.className}>
                        {label}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "createdAt",
            header: "",
            cell: () => null,
        },
    ];

    const hasData = data.length > 0;
    const hasActiveFilters = columnFilters.length > 0;

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: { sorting, columnFilters, columnVisibility },
    });

    return (
        <div className="w-full space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0 max-w-md">
                    <div className="relative flex-1 min-w-0">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            type="text"
                            placeholder={t("filterPlaceholder")}
                            className="pl-9"
                            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                            onChange={(e) => table.getColumn("title")?.setFilterValue(e.target.value)}
                        />
                    </div>
                    {onRefresh && (
                        <Button variant="outline" size="icon" onClick={onRefresh} disabled={isLoading} className="shrink-0">
                            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                        </Button>
                    )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Select
                        value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
                        onValueChange={(value) =>
                            table.getColumn("status")?.setFilterValue(value === "all" ? "" : value)
                        }
                    >
                        <SelectTrigger className="flex-1 sm:flex-none sm:w-[150px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("statusAll")}</SelectItem>
                            <SelectItem value="ACTIVE">{t("statusActive")}</SelectItem>
                            <SelectItem value="CLOSED">{t("statusClosed")}</SelectItem>
                            <SelectItem value="EXPIRED">{t("statusExpired")}</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={sortOrder}
                        onValueChange={(value) => {
                            setSortOrder(value);
                            setSorting([{ id: "createdAt", desc: value === "newest" }]);
                        }}
                    >
                        <SelectTrigger className="flex-1 sm:flex-none sm:w-[150px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">{t("sortNewest")}</SelectItem>
                            <SelectItem value="oldest">{t("sortOldest")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {isLoading ? (
                /* ── Skeleton ─────────────────────────────────────────────── */
                <div className="rounded-md border min-h-[578px]">
                    <Table wrapperClassName="max-h-[578px]">
                        <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} className={header.column.columnDef.meta?.className}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 10 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-48" /></TableCell>
                                    <TableCell className="hidden xl:table-cell"><Skeleton className="h-7 w-7 rounded-md mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : !hasData ? (
                /* ── Aucune collecte ──────────────────────────────────────── */
                <div className="flex flex-col items-center justify-center py-20 px-6 border-2 border-dashed rounded-2xl border-border bg-muted/5 text-center">
                    <div className="relative mb-6">
                        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Link2 className="h-10 w-10 text-primary" />
                        </div>
                        <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary/20 border-2 border-background" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{t("EmptyState.title")}</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">{t("EmptyState.description")}</p>
                    <Button asChild className="gap-2 font-bold shadow-lg shadow-primary/20">
                        <Link href="/merchant/funds-collection/new">
                            <Link2 className="h-4 w-4" />
                            {t("EmptyState.cta")}
                        </Link>
                    </Button>
                </div>
            ) : table.getRowModel().rows.length === 0 ? (
                /* ── Filtres sans résultat ────────────────────────────────── */
                <div className="flex flex-col items-center justify-center py-16 px-6 border rounded-2xl border-border bg-muted/5 text-center">
                    <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                        <SlidersHorizontal className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="font-semibold text-foreground mb-1">{t("EmptyState.noResults")}</p>
                    <p className="text-sm text-muted-foreground mb-4">{t("EmptyState.noResultsHint")}</p>
                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => setColumnFilters([])}
                        >
                            <X className="h-3.5 w-3.5" />
                            {t("EmptyState.clearFilters")}
                        </Button>
                    )}
                </div>
            ) : (
                /* ── Table ────────────────────────────────────────────────── */
                <>
                    <div className="rounded-md border min-h-[578px]">
                        <Table wrapperClassName="max-h-[578px]">
                            <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id} className={header.column.columnDef.meta?.className}>
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        className="cursor-pointer"
                                        onClick={() => router.push(`/merchant/funds-collection/${row.original.id}`)}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className={cell.column.columnDef.meta?.className}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {table.getFilteredRowModel().rows.length} {t("elements")}
                    </p>
                </>
            )}
        </div>
    );
}
