import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning";

interface Props {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
}

export default function Toast({
    message,
    type,
    onClose,
    duration = 4000,
}: Props) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for fade out animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
        error: <XCircle className="w-5 h-5 text-red-500" />,
        warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
    };

    const backgrounds = {
        success: "bg-emerald-50 border-emerald-200",
        error: "bg-red-50 border-red-200",
        warning: "bg-yellow-50 border-yellow-200",
    };

    const textColors = {
        success: "text-emerald-800",
        error: "text-red-800",
        warning: "text-yellow-800",
    };

    if (!message) return null;

    return (
        <div
            className={`fixed bottom-4 right-4 z-[70] transform transition-all duration-300 ${
                isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-2 opacity-0"
            }`}
        >
            <div
                className={`rounded-lg border p-4 shadow-lg flex items-start space-x-3 max-w-sm ${backgrounds[type]}`}
            >
                <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
                <div
                    className={`flex-1 text-sm font-medium ${textColors[type]}`}
                >
                    {message}
                </div>
                <button
                    onClick={() => {
                        setIsVisible(false);
                        setTimeout(onClose, 300);
                    }}
                    className={`flex-shrink-0 ml-4 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none`}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
