import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import { PaginatedResponse, Transaction, User } from "@/types";
import { formatRupiah } from "@/utils/formatter";
import {
    Plus,
    CheckCircle,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Search,
    Filter,
} from "lucide-react";

interface Props {
    transactions: PaginatedResponse<Transaction>;
    auth: {
        user: User;
    };
    filters?: {
        type?: string;
        category?: string;
    };
}

export default function KasIndex({ transactions, auth }: Props) {
    const isBendaharaOrAdmin =
        auth.user.role === "bendahara" || auth.user.role === "super_admin";
    const isSuperAdmin = auth.user.role === "super_admin";

    const handleDelete = (id: string) => {
        if (confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
            router.delete(route("kas.destroy", id));
        }
    };

    const handleVerify = (id: string) => {
        if (confirm("Verifikasi transaksi ini?")) {
            router.put(route("kas.verify", id));
        }
    };

    return (
        <AppLayout title="Kas">
            <Head title="Kas Masjid" />

            {/* Header Section */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Kas Masjid
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Kelola dan pantau seluruh pemasukan serta pengeluaran
                        operasional masjid.
                    </p>
                </div>
                {isBendaharaOrAdmin && (
                    <Link
                        href={route("kas.create")}
                        className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200 font-medium"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Tambah Transaksi
                    </Link>
                )}
            </div>

            {/* Toolbar Area (Search & Filter) Placeholder */}
            {/* You can implement actual search logic here later, this is for UI fidelity */}
            <div className="mb-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari transaksi..."
                        className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 sm:text-sm transition-colors shadow-sm"
                    />
                </div>
                <button className="inline-flex items-center px-4 py-2 border border-slate-200 rounded-xl bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                    <Filter className="w-4 h-4 mr-2 text-slate-400" />
                    Filter
                </button>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50/80 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                            <tr>
                                <th scope="col" className="px-6 py-4">
                                    Tanggal
                                </th>
                                <th scope="col" className="px-6 py-4">
                                    Kategori
                                </th>
                                <th scope="col" className="px-6 py-4">
                                    Keterangan
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-4 text-right"
                                >
                                    Nominal
                                </th>
                                <th scope="col" className="px-6 py-4">
                                    Metode
                                </th>
                                <th scope="col" className="px-6 py-4">
                                    Status
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-4 text-right"
                                >
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/80">
                            {transactions.data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-12 text-center text-slate-500"
                                    >
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                                <Search className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <p className="font-medium text-slate-600">
                                                Belum ada data transaksi
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Transaksi yang ditambahkan akan
                                                muncul di sini.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                transactions.data.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="bg-white hover:bg-slate-50/80 transition-colors group"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                                            {new Date(
                                                item.created_at,
                                            ).toLocaleDateString("id-ID", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 capitalize border border-slate-200">
                                                {item.category.replace(
                                                    /_/g,
                                                    " ",
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <div
                                                className="truncate text-slate-700 font-medium"
                                                title={item.notes}
                                            >
                                                {item.notes || "-"}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-0.5 flex items-center">
                                                <span className="w-4 h-4 rounded-full bg-slate-200 inline-flex items-center justify-center text-[8px] mr-1.5 font-bold text-slate-500">
                                                    {item.user?.name.charAt(0)}
                                                </span>
                                                {item.user?.name}
                                            </div>
                                        </td>
                                        <td
                                            className={`px-6 py-4 whitespace-nowrap text-right font-bold ${item.type === "in" ? "text-emerald-600" : "text-red-500"}`}
                                        >
                                            {item.type === "in" ? "+" : "-"}{" "}
                                            {formatRupiah(item.amount)}
                                        </td>
                                        <td className="px-6 py-4 capitalize text-slate-600">
                                            {item.payment_method || "-"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {item.verified_at ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    Terverifikasi
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/50">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {isBendaharaOrAdmin &&
                                                    !item.verified_at && (
                                                        <button
                                                            onClick={() =>
                                                                handleVerify(
                                                                    item.id,
                                                                )
                                                            }
                                                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                            title="Verifikasi Transaksi"
                                                        >
                                                            <CheckCircle
                                                                size={18}
                                                            />
                                                        </button>
                                                    )}
                                                {isSuperAdmin && (
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                item.id,
                                                            )
                                                        }
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Hapus Transaksi"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {transactions.data.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-slate-500 font-medium">
                            Menampilkan{" "}
                            <span className="text-slate-900 font-semibold">
                                {transactions.from || 0}
                            </span>{" "}
                            -{" "}
                            <span className="text-slate-900 font-semibold">
                                {transactions.to || 0}
                            </span>{" "}
                            dari{" "}
                            <span className="text-slate-900 font-semibold">
                                {transactions.total || 0}
                            </span>{" "}
                            data
                        </div>
                        <div className="flex space-x-2">
                            {transactions.prev_page_url ? (
                                <Link
                                    href={transactions.prev_page_url || "#"}
                                    preserveScroll
                                    className={`p-2 rounded-lg transition-colors ${!transactions.prev_page_url ? "text-slate-300 cursor-not-allowed" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </Link>
                            ) : (
                                <span className="p-2 border border-slate-200 rounded-lg text-slate-300 bg-slate-50/50 cursor-not-allowed">
                                    <ChevronLeft size={16} />
                                </span>
                            )}
                            {transactions.next_page_url ? (
                                <Link
                                    href={transactions.next_page_url || "#"}
                                    preserveScroll
                                    className={`p-2 rounded-lg transition-colors ${!transactions.next_page_url ? "text-slate-300 cursor-not-allowed" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </Link>
                            ) : (
                                <span className="p-2 border border-slate-200 rounded-lg text-slate-300 bg-slate-50/50 cursor-not-allowed">
                                    <ChevronRight size={16} />
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
