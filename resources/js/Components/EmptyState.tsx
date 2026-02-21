import { Inbox } from "lucide-react";

interface Props {
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}

export default function EmptyState({ message, actionLabel, onAction }: Props) {
    return (
        <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Inbox className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">
                {message}
            </h3>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
