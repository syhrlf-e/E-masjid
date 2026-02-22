import ApplicationLogo from "@/Components/ApplicationLogo";
import { Link } from "@inertiajs/react";
import { PropsWithChildren } from "react";
import { useNetwork } from "@/Hooks/useNetwork";
import { WifiOff } from "lucide-react";

export default function Guest({ children }: PropsWithChildren) {
    const isOnline = useNetwork();
    return (
        <div className="flex flex-col min-h-screen font-sans">
            {!isOnline && (
                <div className="bg-red-500 text-white px-4 py-2.5 text-center text-sm font-medium flex items-center justify-center space-x-2 shadow-sm relative z-50 w-full shrink-0">
                    <WifiOff size={16} />
                    <span>Koneksi Terputus. Akses sistem dibatasi.</span>
                </div>
            )}
            <div className="flex flex-1 bg-slate-50">
                <div className="relative hidden w-0 flex-1 lg:block bg-black">
                    <div className="absolute inset-0 bg-[url('/images/img_login.png')] bg-cover bg-center"></div>
                    <div className="absolute inset-0 bg-black/60"></div>

                    <div className="relative z-10 flex h-full flex-col justify-center px-16 text-white">
                        <div className="mb-8">
                            {/* Replace with actual logo if available, or text */}
                            <div className="flex items-center space-x-3">
                                <span className="text-3xl font-extrabold tracking-widest uppercase">
                                    E-Masjid
                                </span>
                            </div>
                        </div>
                        <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-tight">
                            Sistem Manajemen Digital
                        </h1>
                        <p className="text-lg font-medium text-emerald-50 max-w-lg leading-relaxed">
                            Platform modern untuk mengelola keuangan,
                            inventaris, zakat, dan agenda kegiatan masjid secara
                            profesional, transparan, dan terpercaya.
                        </p>
                    </div>
                </div>

                {/* Right Area - Form Auth */}
                <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white shadow-2xl relative z-20">
                    <div className="mx-auto w-full max-w-sm lg:w-96">
                        <div className="lg:hidden mb-8 flex justify-center">
                            <Link
                                href="/"
                                className="flex flex-col items-center"
                            >
                                <ApplicationLogo className="h-16 w-16 text-emerald-600 mb-2" />
                                <span className="text-xl font-bold text-gray-900">
                                    E-Masjid
                                </span>
                            </Link>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
