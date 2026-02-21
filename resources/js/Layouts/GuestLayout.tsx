import ApplicationLogo from "@/Components/ApplicationLogo";
import { Link } from "@inertiajs/react";
import { PropsWithChildren } from "react";

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            <div className="relative hidden w-0 flex-1 lg:block bg-black">
                <div className="absolute inset-0 bg-[url('/images/img_login.png')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-black/60"></div>

                <div className="relative z-10 flex h-full flex-col justify-center px-16 text-white">
                    <div className="mb-8">
                        {/* Replace with actual logo if available, or text */}
                        <div className="flex items-center space-x-3">
                            <span className="text-2xl font-bold tracking-tight">
                                E-Masjid
                            </span>
                        </div>
                    </div>
                    <h1 className="mb-4 text-4xl font-extrabold tracking-tight">
                        Sistem Manajemen Digital
                    </h1>
                    <p className="text-lg text-emerald-100 max-w-lg leading-relaxed">
                        Platform modern untuk mengelola keuangan, inventaris,
                        zakat, dan agenda kegiatan masjid secara profesional,
                        transparan, dan terpercaya.
                    </p>
                </div>
            </div>

            {/* Right Area - Form Auth */}
            <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white shadow-2xl relative z-20">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div className="lg:hidden mb-8 flex justify-center">
                        <Link href="/" className="flex flex-col items-center">
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
    );
}
