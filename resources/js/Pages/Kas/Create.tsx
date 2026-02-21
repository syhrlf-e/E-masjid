import { Head, useForm, Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import { FormEventHandler, useEffect, useState } from "react";
import { formatRupiah, parseRupiah } from "@/utils/formatter";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { z } from "zod";
import { useNetwork } from "@/Hooks/useNetwork";

const transactionSchema = z.object({
    type: z.enum(["in", "out"]),
    category: z.enum([
        "zakat_fitrah",
        "zakat_maal",
        "infaq",
        "infaq_tromol",
        "operasional",
        "gaji",
        "lainnya",
    ]),
    amount: z.number().min(1, "Nominal wajib diisi dan minimal Rp 1"),
    payment_method: z.enum(["tunai", "transfer", "qris"]).optional(),
    notes: z.string().max(500, "Keterangan maksimal 500 karakter").optional(),
});

export default function KasCreate() {
    const { data, setData, post, processing, errors, reset } = useForm({
        type: "in",
        category: "infaq",
        amount: 0,
        amount_display: "", // Helper for formatted input
        payment_method: "tunai",
        notes: "",
    });

    const isOnline = useNetwork();
    const [formattedAmount, setFormattedAmount] = useState("");

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        const numberVal = parseRupiah(val);
        setData("amount", numberVal);
        setFormattedAmount(formatRupiah(numberVal));
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Client-side validation check
        const validation = transactionSchema.safeParse({
            type: data.type,
            category: data.category,
            amount: data.amount,
            payment_method: data.payment_method,
            notes: data.notes,
        });

        if (!validation.success) {
            // In a real app, mapping Zod errors to Inertia errors or showing toast would happen here.
            // For now, trusting server-side validation which is also solid.
            // But we can early return if amount is 0.
            if (data.amount <= 0) {
                alert("Nominal harus lebih dari 0");
                return;
            }
        }

        post(route("kas.store"), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout title="Kas">
            <Head title="Tambah Transaksi" />

            <div className="max-w-2xl mx-auto">
                <div className="mb-6 flex items-center space-x-4">
                    <Link
                        href={route("kas.index")}
                        className="p-2 rounded-full hover:bg-gray-100 transition"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Tambah Transaksi
                        </h1>
                        <p className="text-gray-600 text-sm">
                            Catat pemasukan atau pengeluaran baru.
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
                    <form onSubmit={submit} className="space-y-6">
                        {/* Type Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Jenis Transaksi
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setData("type", "in")}
                                    className={`py-3 px-4 rounded-lg border text-sm font-medium flex items-center justify-center transition-all ${data.type === "in" ? "bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                                >
                                    Pemasukan (+In)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setData("type", "out")}
                                    className={`py-3 px-4 rounded-lg border text-sm font-medium flex items-center justify-center transition-all ${data.type === "out" ? "bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                                >
                                    Pengeluaran (-Out)
                                </button>
                            </div>
                            {errors.type && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.type}
                                </p>
                            )}
                        </div>

                        {/* Category */}
                        <div>
                            <label
                                htmlFor="category"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Kategori
                            </label>
                            <select
                                id="category"
                                value={data.category}
                                onChange={(e) =>
                                    setData("category", e.target.value)
                                }
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                            >
                                <option value="zakat_fitrah">
                                    Zakat Fitrah
                                </option>
                                <option value="zakat_maal">Zakat Maal</option>
                                <option value="infaq">Infaq / Sedekah</option>
                                <option value="infaq_tromol">
                                    Infaq Tromol
                                </option>
                                <option value="operasional">Operasional</option>
                                <option value="gaji">Gaji</option>
                                <option value="lainnya">Lainnya</option>
                            </select>
                            {errors.category && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.category}
                                </p>
                            )}
                        </div>

                        {/* Amount */}
                        <div>
                            <label
                                htmlFor="amount"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Nominal (Rp)
                            </label>
                            <input
                                id="amount"
                                type="text"
                                inputMode="numeric"
                                value={
                                    formattedAmount ||
                                    (data.amount === 0
                                        ? ""
                                        : formatRupiah(data.amount))
                                }
                                onChange={handleAmountChange}
                                className="w-full text-lg font-semibold rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                placeholder="Rp 0"
                            />
                            {errors.amount && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.amount}
                                </p>
                            )}
                        </div>

                        {/* Payment Method */}
                        <div>
                            <label
                                htmlFor="payment_method"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Metode Pembayaran
                            </label>
                            <select
                                id="payment_method"
                                value={data.payment_method}
                                onChange={(e) =>
                                    setData("payment_method", e.target.value)
                                }
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                            >
                                <option value="tunai">Tunai</option>
                                <option value="transfer">Transfer Bank</option>
                                <option value="qris">QRIS</option>
                            </select>
                            {errors.payment_method && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.payment_method}
                                </p>
                            )}
                        </div>

                        {/* Notes */}
                        <div>
                            <label
                                htmlFor="notes"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Keterangan (Opsional)
                            </label>
                            <textarea
                                id="notes"
                                value={data.notes}
                                onChange={(e) =>
                                    setData("notes", e.target.value)
                                }
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                rows={3}
                                placeholder="Contoh: Infaq Hamba Allah, Bayar Listrik Bulan Juni"
                            ></textarea>
                            {errors.notes && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.notes}
                                </p>
                            )}
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={processing || !isOnline}
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save className="-ml-1 mr-2 h-5 w-5" />
                                        Simpan Transaksi
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
