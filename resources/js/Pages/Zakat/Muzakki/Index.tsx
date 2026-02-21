import { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import ConfirmDialog from "@/Components/ConfirmDialog";
import EmptyState from "@/Components/EmptyState";
import MuzakkiForm from "./Components/MuzakkiForm";
import {
    Plus,
    Search,
    Trash2,
    Edit2,
    User,
    Phone,
    MapPin,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

interface Muzakki {
    id: string;
    name: string;
    phone: string | null;
    address: string | null;
}

interface Meta {
    links: any[];
    from: number;
    to: number;
    total: number;
}

interface Props {
    muzakkis: {
        data: Muzakki[];
        links: any[];
        meta: Meta;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    filters: {
        search?: string;
    };
}

export default function Index({ muzakkis, filters }: Props) {
    const [search, setSearch] = useState(filters.search || "");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMuzakki, setEditingMuzakki] = useState<Muzakki | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || "")) {
                router.get(
                    route("zakat.muzakki"),
                    { search },
                    { preserveState: true, replace: true },
                );
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const handleCreate = () => {
        setEditingMuzakki(null);
        setIsFormOpen(true);
    };

    const handleEdit = (muzakki: Muzakki) => {
        setEditingMuzakki(muzakki);
        setIsFormOpen(true);
    };

    const handleDelete = (id: string) => {
        setConfirmDeleteId(id);
    };

    const confirmDelete = () => {
        if (confirmDeleteId) {
            router.delete(route("zakat.muzakki.destroy", confirmDeleteId), {
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
            <Head title="Manajemen Muzakki" />

            {/* Header Section */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Data Muzakki
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Kelola direktori donatur zakat, infaq, dan shodaqoh.
                    </p>
                </div>
                {muzakkis.data.length > 0 && (
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200 font-medium"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Tambah Muzakki
                    </button>
                )}
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Search Bar */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center">
                    <div className="relative w-full max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 sm:text-sm transition-colors shadow-sm"
                            placeholder="Cari nama jamaah atau nomor telepon..."
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-slate-50/80 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                            <tr>
                                <th scope="col" className="px-6 py-4">
                                    Informasi Muzakki
                                </th>
                                <th scope="col" className="px-6 py-4">
                                    Kontak
                                </th>
                                <th scope="col" className="px-6 py-4">
                                    Alamat
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
                            {muzakkis.data.length > 0 ? (
                                muzakkis.data.map((muzakki) => (
                                    <tr
                                        key={muzakki.id}
                                        className="bg-white hover:bg-slate-50/80 transition-colors group"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div>
                                                    <div className="font-bold text-slate-800">
                                                        {muzakki.name}
                                                    </div>
                                                    <div className="text-xs text-slate-400 mt-0.5">
                                                        ID:{" "}
                                                        {muzakki.id.substring(
                                                            0,
                                                            8,
                                                        )}
                                                        ...
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                                            {muzakki.phone ? (
                                                <div className="flex items-center text-slate-600">
                                                    <Phone className="w-3.5 h-3.5 mr-2 text-slate-400" />
                                                    {muzakki.phone}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic">
                                                    Belum diisi
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 max-w-xs">
                                            {muzakki.address ? (
                                                <div className="flex items-start">
                                                    <MapPin className="w-3.5 h-3.5 mr-2 mt-1 text-slate-400 shrink-0" />
                                                    <span className="truncate">
                                                        {muzakki.address}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic">
                                                    Belum diisi
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() =>
                                                        handleEdit(muzakki)
                                                    }
                                                    className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Edit Data"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(muzakki.id)
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
                                            message="Belum ada data muzakki yang sesuai kriteria pencarian."
                                            actionLabel="Tambah Muzakki Baru"
                                            onAction={handleCreate}
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {muzakkis.data.length > 0 && muzakkis.meta && (
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-slate-500 font-medium">
                            Menampilkan{" "}
                            <span className="text-slate-900 font-semibold">
                                {muzakkis.meta.from || 0}
                            </span>{" "}
                            -{" "}
                            <span className="text-slate-900 font-semibold">
                                {muzakkis.meta.to || 0}
                            </span>{" "}
                            dari{" "}
                            <span className="text-slate-900 font-semibold">
                                {muzakkis.meta.total || 0}
                            </span>{" "}
                            data
                        </div>
                        <div className="flex space-x-2">
                            {muzakkis.prev_page_url ? (
                                <button
                                    onClick={() =>
                                        router.get(
                                            muzakkis.prev_page_url as string,
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
                                {muzakkis.meta.links
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

                            {muzakkis.next_page_url ? (
                                <button
                                    onClick={() =>
                                        router.get(
                                            muzakkis.next_page_url as string,
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

            {/* Slide Over Form */}
            <MuzakkiForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                muzakki={editingMuzakki}
            />

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={confirmDelete}
                title="Hapus Muzakki?"
                variant="danger"
            >
                Apakah Anda yakin ingin menghapus data ini? Data transaksi
                terkait tidak akan dihapus permanen, namun status donatur ini
                akan dinonaktifkan.
            </ConfirmDialog>
        </AppLayout>
    );
}
