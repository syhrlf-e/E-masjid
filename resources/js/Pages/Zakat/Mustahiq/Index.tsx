import { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import ConfirmDialog from "@/Components/ConfirmDialog";
import EmptyState from "@/Components/EmptyState";
import MustahiqForm from "./Components/MustahiqForm";
import {
    Plus,
    Search,
    Trash2,
    Edit2,
    Users,
    MapPin,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

interface Mustahiq {
    id: string;
    name: string;
    ashnaf: string;
    address: string | null;
    description: string | null;
}

interface Meta {
    links: any[];
    from: number;
    to: number;
    total: number;
}

interface Props {
    mustahiqs: {
        data: Mustahiq[];
        links: any[];
        meta: Meta;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    filters: {
        search?: string;
        ashnaf?: string;
    };
}

const ASHNAF_LABELS: Record<string, string> = {
    fakir: "Fakir",
    miskin: "Miskin",
    amil: "Amil",
    mualaf: "Mualaf",
    riqab: "Riqab",
    gharim: "Gharim",
    fisabilillah: "Fisabilillah",
    ibnusabil: "Ibnu Sabil",
};

const ASHNAF_STYLES: Record<string, string> = {
    fakir: "bg-red-50 text-red-700 border-red-200/50",
    miskin: "bg-orange-50 text-orange-700 border-orange-200/50",
    amil: "bg-blue-50 text-blue-700 border-blue-200/50",
    mualaf: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
    riqab: "bg-purple-50 text-purple-700 border-purple-200/50",
    gharim: "bg-yellow-50 text-yellow-700 border-yellow-200/50",
    fisabilillah: "bg-teal-50 text-teal-700 border-teal-200/50",
    ibnusabil: "bg-indigo-50 text-indigo-700 border-indigo-200/50",
};

export default function Index({ mustahiqs, filters }: Props) {
    const [search, setSearch] = useState(filters.search || "");
    const [ashnafFilter, setAshnafFilter] = useState(filters.ashnaf || "");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMustahiq, setEditingMustahiq] = useState<Mustahiq | null>(
        null,
    );
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    // Debounce search & filter
    useEffect(() => {
        const timer = setTimeout(() => {
            if (
                search !== (filters.search || "") ||
                ashnafFilter !== (filters.ashnaf || "")
            ) {
                router.get(
                    route("zakat.mustahiq"),
                    { search, ashnaf: ashnafFilter },
                    { preserveState: true, replace: true },
                );
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search, ashnafFilter]);

    const handleCreate = () => {
        setEditingMustahiq(null);
        setIsFormOpen(true);
    };

    const handleEdit = (mustahiq: Mustahiq) => {
        setEditingMustahiq(mustahiq);
        setIsFormOpen(true);
    };

    const handleDelete = (id: string) => {
        setConfirmDeleteId(id);
    };

    const confirmDelete = () => {
        if (confirmDeleteId) {
            router.delete(route("zakat.mustahiq.destroy", confirmDeleteId), {
                onSuccess: () => setConfirmDeleteId(null),
                preserveScroll: true,
            });
        }
    };

    const cleanHtmlEntities = (str: string) => {
        if (!str) return "";
        return str
            .replace(/&laquo;/g, "«")
            .replace(/&raquo;/g, "»")
            .replace(/&amp;/g, "&")
            .replace(/Previous/g, "")
            .replace(/Next/g, "");
    };

    return (
        <AppLayout title="Zakat">
            <Head title="Manajemen Mustahiq" />

            {/* Header Section */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Data Mustahiq
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Kelola data penerima zakat berdasarkan pembagian 8
                        Ashnaf.
                    </p>
                </div>
                {mustahiqs.data.length > 0 && (
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200 font-medium"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Tambah Mustahiq
                    </button>
                )}
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Filters */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4">
                    <div className="relative w-full max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 sm:text-sm transition-colors shadow-sm"
                            placeholder="Cari nama jamaah atau alamat..."
                        />
                    </div>
                    <div className="relative w-full sm:w-48">
                        <select
                            value={ashnafFilter}
                            onChange={(e) => setAshnafFilter(e.target.value)}
                            className="block w-full px-4 py-2 pr-10 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 sm:text-sm transition-colors shadow-sm text-slate-700 appearance-none font-medium cursor-pointer"
                        >
                            <option value="">Semua Kategori</option>
                            {Object.entries(ASHNAF_LABELS).map(
                                ([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ),
                            )}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                ></path>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-slate-50/80 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                            <tr>
                                <th scope="col" className="px-6 py-4">
                                    Data Mustahiq
                                </th>
                                <th scope="col" className="px-6 py-4">
                                    Kategori (Ashnaf)
                                </th>
                                <th scope="col" className="px-6 py-4">
                                    Alamat
                                </th>
                                <th scope="col" className="px-6 py-4">
                                    Keterangan
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-4 text-right pr-6"
                                >
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/80">
                            {mustahiqs.data.length > 0 ? (
                                mustahiqs.data.map((mustahiq) => (
                                    <tr
                                        key={mustahiq.id}
                                        className="bg-white hover:bg-slate-50/80 transition-colors group"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div>
                                                    <div className="font-bold text-slate-800">
                                                        {mustahiq.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-medium text-slate-700 capitalize">
                                                {ASHNAF_LABELS[
                                                    mustahiq.ashnaf
                                                ] || mustahiq.ashnaf}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 max-w-xs">
                                            {mustahiq.address ? (
                                                <div className="flex items-start">
                                                    <MapPin className="w-4 h-4 mr-2 mt-0.5 text-slate-400 shrink-0" />
                                                    <span className="truncate">
                                                        {mustahiq.address}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic">
                                                    Belum diisi
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 max-w-xs">
                                            <div
                                                className="line-clamp-2"
                                                title={
                                                    mustahiq.description || ""
                                                }
                                            >
                                                {mustahiq.description || (
                                                    <span className="text-slate-400 italic">
                                                        Tidak ada keterangan
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() =>
                                                        handleEdit(mustahiq)
                                                    }
                                                    className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Edit Data"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            mustahiq.id,
                                                        )
                                                    }
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hapus Data"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-12">
                                        <EmptyState
                                            message="Belum ada data mustahiq yang sesuai kriteria pencarian."
                                            actionLabel="Tambah Mustahiq Baru"
                                            onAction={handleCreate}
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {mustahiqs.data.length > 0 && mustahiqs.meta && (
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-slate-500 font-medium">
                            Menampilkan{" "}
                            <span className="text-slate-900 font-semibold">
                                {mustahiqs.meta.from || 0}
                            </span>{" "}
                            -{" "}
                            <span className="text-slate-900 font-semibold">
                                {mustahiqs.meta.to || 0}
                            </span>{" "}
                            dari{" "}
                            <span className="text-slate-900 font-semibold">
                                {mustahiqs.meta.total || 0}
                            </span>{" "}
                            data
                        </div>
                        <div className="flex space-x-2">
                            {mustahiqs.prev_page_url ? (
                                <button
                                    onClick={() =>
                                        router.get(
                                            mustahiqs.prev_page_url as string,
                                        )
                                    }
                                    className="p-2 border border-slate-200 rounded-lg hover:bg-white text-slate-600 bg-slate-50 transition-colors shadow-sm"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                            ) : (
                                <span className="p-2 border border-slate-200 rounded-lg text-slate-300 bg-slate-50/50 cursor-not-allowed">
                                    <ChevronLeft size={16} />
                                </span>
                            )}

                            <div className="hidden sm:flex space-x-1 mx-2">
                                {mustahiqs.meta.links
                                    .filter(
                                        (l) =>
                                            !l.label.includes("Previous") &&
                                            !l.label.includes("Next") &&
                                            cleanHtmlEntities(l.label) !== "",
                                    )
                                    .map((link, idx) =>
                                        link.url ? (
                                            <button
                                                key={idx}
                                                onClick={() =>
                                                    router.get(
                                                        link.url as string,
                                                    )
                                                }
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                                    link.active
                                                        ? "bg-slate-800 text-white"
                                                        : "text-slate-600 hover:bg-slate-200 bg-slate-100/50"
                                                }`}
                                            >
                                                {cleanHtmlEntities(link.label)}
                                            </button>
                                        ) : (
                                            <span
                                                key={idx}
                                                className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400"
                                            >
                                                {cleanHtmlEntities(link.label)}
                                            </span>
                                        ),
                                    )}
                            </div>

                            {mustahiqs.next_page_url ? (
                                <button
                                    onClick={() =>
                                        router.get(
                                            mustahiqs.next_page_url as string,
                                        )
                                    }
                                    className="p-2 border border-slate-200 rounded-lg hover:bg-white text-slate-600 bg-slate-50 transition-colors shadow-sm"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            ) : (
                                <span className="p-2 border border-slate-200 rounded-lg text-slate-300 bg-slate-50/50 cursor-not-allowed">
                                    <ChevronRight size={16} />
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <MustahiqForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                mustahiq={editingMustahiq}
            />

            <ConfirmDialog
                isOpen={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={confirmDelete}
                title="Hapus Mustahiq?"
                variant="danger"
            >
                Apakah Anda yakin ingin menghapus data ini?
            </ConfirmDialog>
        </AppLayout>
    );
}
