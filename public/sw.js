const CACHE_VERSION = Date.now(); // Auto-versioning: berubah setiap SW file berubah
const CACHE_NAME = `emasjid-v${CACHE_VERSION}`;

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
            .then(() => self.skipWaiting()), // Langsung aktifkan SW baru
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        Promise.all([
            clients.claim(), // Ambil alih semua tab yang terbuka
            // Hapus SEMUA cache versi lama
            caches
                .keys()
                .then((keys) =>
                    Promise.all(
                        keys
                            .filter((k) => k !== CACHE_NAME)
                            .map((k) => caches.delete(k)),
                    ),
                ),
        ]).then(() => {
            // Notifikasi semua client untuk reload
            self.clients.matchAll().then((clients) => {
                clients.forEach((client) => {
                    client.postMessage({ type: "SW_UPDATED" });
                });
            });
        }),
    );
});

self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Abaikan permintaan non-GET dan chrome-extension
    if (request.method !== "GET") return;
    if (url.protocol === "chrome-extension:") return;

    // 1. Aset Statis (build Vite, gambar, font) → Network First, fallback Cache
    const isStaticAsset =
        url.pathname.startsWith("/build/") ||
        url.pathname.startsWith("/images/") ||
        url.pathname === "/manifest.json" ||
        url.host.includes("fonts.googleapis.com") ||
        url.host.includes("fonts.gstatic.com");

    if (isStaticAsset) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response && response.status === 200) {
                        const clone = response.clone();
                        caches
                            .open(CACHE_NAME)
                            .then((cache) => cache.put(request, clone));
                    }
                    return response;
                })
                .catch(() => caches.match(request)), // fallback ke cache kalau offline
        );
        return;
    }

    // 2. Semua request lain (Inertia pages, API) → Network Only
    // Wajib online untuk semua transaksi keuangan
    event.respondWith(fetch(request));
});
