import { Link } from "@inertiajs/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface LinkItem {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    links: LinkItem[];
}

export default function Pagination({ links }: Props) {
    if (links.length <= 1) return null;

    return (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
                {links[0].url ? (
                    <Link
                        href={links[0].url}
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Previous
                    </Link>
                ) : (
                    <span className="relative inline-flex items-center rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-400">
                        Previous
                    </span>
                )}

                {links[links.length - 1].url ? (
                    <Link
                        href={links[links.length - 1].url!}
                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Next
                    </Link>
                ) : (
                    <span className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-400">
                        Next
                    </span>
                )}
            </div>

            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>{/* Optional: Show "Showing X to Y of Z results" */}</div>
                <div>
                    <nav
                        className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                        aria-label="Pagination"
                    >
                        {links.map((link, key) => {
                            let label = link.label;
                            if (label.includes("&laquo;"))
                                return (
                                    <Link
                                        key={key}
                                        href={link.url || "#"}
                                        className={`relative inline-flex items-center rounded-l-md px-2 py-2 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${!link.url ? "pointer-events-none text-gray-400" : "text-gray-400"}`}
                                        dangerouslySetInnerHTML={{
                                            __html: "<span class='sr-only'>Previous</span><svg class='h-5 w-5' viewBox='0 0 20 20' fill='currentColor' aria-hidden='true'><path fill-rule='evenodd' d='M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z' clip-rule='evenodd' /></svg>",
                                        }}
                                    />
                                );
                            if (label.includes("&raquo;"))
                                return (
                                    <Link
                                        key={key}
                                        href={link.url || "#"}
                                        className={`relative inline-flex items-center rounded-r-md px-2 py-2 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${!link.url ? "pointer-events-none text-gray-400" : "text-gray-400"}`}
                                        dangerouslySetInnerHTML={{
                                            __html: "<span class='sr-only'>Next</span><svg class='h-5 w-5' viewBox='0 0 20 20' fill='currentColor' aria-hidden='true'><path fill-rule='evenodd' d='M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z' clip-rule='evenodd' /></svg>",
                                        }}
                                    />
                                );

                            return (
                                <Link
                                    key={key}
                                    href={link.url || "#"}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0 ${
                                        link.active
                                            ? "z-10 bg-emerald-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                                            : "text-gray-900 hover:bg-gray-50"
                                    } ${!link.url && "pointer-events-none text-gray-400"}`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            );
                        })}
                    </nav>
                </div>
            </div>
        </div>
    );
}
