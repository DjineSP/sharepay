"use client";

import * as React from "react";
import {
    ColumnDef,
    RowData,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, Copy, Loader2, RefreshCcw, Search } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
    TransactionOut,
    TransactionOutFilters,
    TransactionOutPage,
    TransactionStatus,
} from "@/features/merchant/transactions/types";
import { useApps } from "@/features/merchant/apps/hooks/use-apps";

declare module "@tanstack/react-table" {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ColumnMeta<TData extends RowData, TValue> {
        className?: string;
    }
}

const STATUS_STYLE: Record<TransactionStatus, string> = {
    SUCCESS:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0",
    PENDING:   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0",
    FAILED:    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0",
    CANCELLED: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-0",
    REFUNDED:  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0",
};

interface TransactionsOutTableProps {
    data: TransactionOutPage | null;
    loading: boolean;
    error: string | null;
    filters: TransactionOutFilters;
    onFiltersChange: (f: TransactionOutFilters) => void;
    onRowClick: (tx: TransactionOut) => void;
    onRefresh: () => void;
}

export function TransactionsOutTable({
    data, loading, error, filters, onFiltersChange, onRowClick, onRefresh,
}: TransactionsOutTableProps) {
    const t = useTranslations("Dashboard.Transactions.Table");
    const { data: apps } = useApps();

    const [sorting,          setSorting]          = React.useState<SortingState>([{ id: "createdAt", desc: true }]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [globalFilter,     setGlobalFilter]     = React.useState("");

    const rows: TransactionOut[] = data?.content ?? [];

    const statusLabel = (s: TransactionStatus): string => ({
        SUCCESS: t("statusSuccess"), PENDING: t("statusPending"),
        FAILED: t("statusFailed"), CANCELLED: t("statusCancelled"), REFUNDED: t("statusRefunded"),
    })[s];

    const fmt = (n: number) =>
        new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XAF", maximumFractionDigits: 0 }).format(n);

    const columns: ColumnDef<TransactionOut>[] = [
        {
            accessorKey: "reference",
            header: t("reference"),
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5 min-w-[120px]">
                    <span className="font-mono text-xs font-semibold text-foreground">
                        {row.getValue<string>("reference")}
                    </span>
                    <button
                        type="button"
                        className="hidden sm:inline-flex text-muted-foreground hover:text-foreground transition-colors shrink-0"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(row.getValue<string>("reference"));
                            toast.success(t("successCopy"), { description: t("descRefCopy") });
                        }}
                    >
                        <Copy className="h-3 w-3" />
                    </button>
                </div>
            ),
        },
        {
            accessorKey: "beneficiaryName",
            header: t("beneficiary"),
            cell: ({ row }) => {
                const tx = row.original;
                return (
                    <div className="min-w-[110px]">
                        <p className="text-sm font-medium text-foreground leading-tight">
                            {tx.beneficiaryName ?? "-"}
                        </p>
                        <div className="hidden sm:flex items-center gap-1 mt-0.5 min-w-0">
                            <p className="text-xs text-muted-foreground font-mono leading-tight truncate">
                                {tx.beneficiaryAccount ?? "-"}
                            </p>
                            {tx.beneficiaryAccount && (
                                <button
                                    type="button"
                                    className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(tx.beneficiaryAccount!);
                                        toast.success(t("successCopy"), { description: t("descPhoneCopy") });
                                    }}
                                >
                                    <Copy className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "provider",
            header: t("provider"),
            meta: { className: "hidden md:table-cell" },
            cell: ({ row }) => {
                const p = row.getValue<string | null>("provider");
                if (!p) return <span className="text-muted-foreground text-sm">-</span>;
                return <span className="text-sm font-medium whitespace-nowrap">{p}</span>;
            },
        },
        {
            accessorKey: "appName",
            header: t("application"),
            meta: { className: "hidden lg:table-cell" },
            cell: ({ row }) => {
                const a = row.getValue<string | null>("appName");
                if (!a) return <span className="text-muted-foreground text-sm">-</span>;
                return <span className="text-sm truncate block max-w-[140px]">{a}</span>;
            },
        },
        {
            accessorKey: "amount",
            header: t("amount"),
            cell: ({ row }) => {
                const tx = row.original;
                return (
                    <div className="min-w-[90px]">
                        <p className="text-sm font-semibold text-foreground whitespace-nowrap">{fmt(tx.amount)}</p>
                        {tx.netAmount > 0 && tx.netAmount !== tx.amount && (
                            <p className="hidden sm:block text-xs text-emerald-600 dark:text-emerald-400 whitespace-nowrap mt-0.5">
                                net {fmt(tx.netAmount)}
                            </p>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "status",
            header: t("status"),
            cell: ({ row }) => {
                const s = row.getValue<TransactionStatus>("status");
                return (
                    <Badge className={`text-xs font-semibold whitespace-nowrap ${STATUS_STYLE[s]}`}>
                        {statusLabel(s)}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "createdAt",
            id: "createdAt",
            meta: { className: "hidden md:table-cell" },
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="px-0 whitespace-nowrap"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    {t("date")}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {format(new Date(row.getValue<string>("createdAt")), "dd MMM yyyy, HH:mm", { locale: fr })}
                </span>
            ),
            sortingFn: "datetime",
        },
    ];

    const table = useReactTable({
        data: rows,
        columns,
        state:     { sorting, columnVisibility, globalFilter },
        onSortingChange:          setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        onGlobalFilterChange:     setGlobalFilter,
        globalFilterFn:           "includesString",
        getCoreRowModel:          getCoreRowModel(),
        getFilteredRowModel:      getFilteredRowModel(),
        getSortedRowModel:        getSortedRowModel(),
        manualPagination:         true,
        pageCount:                data?.totalPages ?? 0,
    });

    const totalPages  = data?.totalPages ?? 1;
    const currentPage = filters.page ?? 0;

    return (
        <div className="w-full space-y-4">
            {/* Filters */}
            <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            placeholder={t("filterPlaceholder")}
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Select
                            value={filters.status || "all"}
                            onValueChange={(v) => onFiltersChange({ ...filters, status: v === "all" ? "" : v as TransactionStatus, page: 0 })}
                        >
                            <SelectTrigger className="flex-1 sm:w-[148px]">
                                <SelectValue placeholder={t("statusAll")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("statusAll")}</SelectItem>
                                <SelectItem value="SUCCESS">{t("statusSuccess")}</SelectItem>
                                <SelectItem value="PENDING">{t("statusPending")}</SelectItem>
                                <SelectItem value="FAILED">{t("statusFailed")}</SelectItem>
                                <SelectItem value="CANCELLED">{t("statusCancelled")}</SelectItem>
                                <SelectItem value="REFUNDED">{t("statusRefunded")}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={filters.appId || "all"}
                            onValueChange={(v) => onFiltersChange({ ...filters, appId: v === "all" ? undefined : v, page: 0 })}
                        >
                            <SelectTrigger className="flex-1 sm:w-[180px]">
                                <SelectValue placeholder={t("appAll")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("appAll")}</SelectItem>
                                {apps?.map((app) => (
                                    <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="icon" onClick={onRefresh} title="Rafraîchir" disabled={loading} className="shrink-0">
                            {loading
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : <RefreshCcw className="h-4 w-4" />
                            }
                        </Button>
                    </div>
                </div>
            </div>

            {/* Error banner */}
            {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            {/* Table */}
            <div className="rounded-xl border min-h-[520px]">
                <Table wrapperClassName="max-h-[520px]">
                    <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id} className="hover:bg-transparent">
                                {hg.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className={cn(
                                            "font-semibold text-xs uppercase tracking-wide",
                                            header.column.columnDef.meta?.className,
                                        )}
                                    >
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {loading && rows.length === 0 ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <TableRow key={i}>
                                    {columns.map((_, j) => (
                                        <TableCell key={j}>
                                            <div className="h-4 bg-muted animate-pulse rounded w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className={cn(
                                        "cursor-pointer hover:bg-muted/50 transition-colors",
                                        loading && "opacity-50 pointer-events-none"
                                    )}
                                    onClick={() => onRowClick(row.original)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className={cn(cell.column.columnDef.meta?.className)}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                    {t("noResults")}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {t("showing")} {data?.totalElements?.toLocaleString("fr-FR") ?? 0} {t("elements")}
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium whitespace-nowrap">{t("rowsPerPage")}</span>
                        <Select
                            value={`${filters.size ?? 20}`}
                            onValueChange={(v) => onFiltersChange({ ...filters, size: Number(v), page: 0 })}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 50].map((s) => (
                                    <SelectItem key={s} value={`${s}`}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium whitespace-nowrap">
                        {t("page")} {currentPage + 1} {t("of")} {totalPages || 1}
                    </span>
                    <Button
                        variant="outline" size="sm"
                        onClick={() => onFiltersChange({ ...filters, page: currentPage - 1 })}
                        disabled={currentPage === 0 || loading}
                    >
                        {t("previous")}
                    </Button>
                    <Button
                        variant="outline" size="sm"
                        onClick={() => onFiltersChange({ ...filters, page: currentPage + 1 })}
                        disabled={data?.last !== false || loading}
                    >
                        {t("next")}
                    </Button>
                </div>
            </div>
        </div>
    );
}
