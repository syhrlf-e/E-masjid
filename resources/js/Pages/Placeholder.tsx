import AppLayout from "@/Layouts/AppLayout";
import { Head } from "@inertiajs/react";
import { Construction } from "lucide-react";

interface Props {
    title: string;
}

export default function Placeholder({ title }: Props) {
    return (
        <AppLayout title="Segera Hadir">
            <Head title={title} />
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <Construction className="w-12 h-12 text-gray-400" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {title}
                </h1>
                <p className="text-gray-500 max-w-md">
                    Fitur ini sedang dalam tahap pengembangan. Insya Allah akan
                    segera tersedia.
                </p>
            </div>
        </AppLayout>
    );
}
