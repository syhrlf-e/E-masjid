const CACHE_NAME = "emasjid-v1";

// App Shell: file statis yang di-cache saat install
const APP_SHELL = [
    "/manifest.json",
    "/images/icon-192.png",
    "/images/icon-512.png",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(APP_SHELL);
            })
            .then(() => self.skipWaiting()),
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        Promise.all([
            clients.claim(),
            // Hapus cache versi lama
            caches
                .keys()
                .then((keys) =>
                    Promise.all(
                        keys
                            .filter((k) => k !== CACHE_NAME)
                            .map((k) => caches.delete(k)),
                    ),
                ),
        ]),
    );
});

self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Abaikan permintaan non-GET dan chrome-extension
    if (request.method !== "GET") return;
    if (url.protocol === "chrome-extension:") return;

    // 1. Aset Statis (build Vite, gambar, font) → Stale-While-Revalidate
    const isStaticAsset =
        url.pathname.startsWith("/build/") ||
        url.pathname.startsWith("/images/") ||
        url.pathname === "/manifest.json" ||
        url.host.includes("fonts.googleapis.com") ||
        url.host.includes("fonts.gstatic.com");

    if (isStaticAsset) {
        event.respondWith(
            caches.match(request).then((cached) => {
                const fetchPromise = fetch(request)
                    .then((response) => {
                        if (response && response.status === 200) {
                            const clone = response.clone();
                            caches
                                .open(CACHE_NAME)
                                .then((cache) => cache.put(request, clone));
                        }
                        return response;
                    })
                    .catch(() => cached); // fallback ke cache kalau offline

                return cached || fetchPromise;
            }),
        );
        return;
    }

    // 2. Semua request lain (Inertia pages, API) → Network Only
    // Wajib online untuk semua transaksi keuangan
    event.respondWith(fetch(request));
});
