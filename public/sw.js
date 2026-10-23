/*
 * Offline-first service worker.
 *  - Precaches the cards a traveller needs underground or in the countryside:
 *    every taxi card, every chef card, the scanner (paste mode runs rules on-device),
 *    the map and the 3D models.
 *  - Pages & assets: stale-while-revalidate. API calls: network only (except photos).
 */
const VERSION = "saathi-v1";
const PLACES = ["fushimi-inari", "kinkakuji", "kiyomizu", "arashiyama", "sensoji", "nakamuraya", "shibuya", "todaiji", "dotonbori", "hiroshima", "kawaguchiko"];
const PRECACHE = [
  "/",
  "/scan",
  "/today",
  "/plan",
  ...["veg", "jain", "halal"].map((d) => `/chef/${d}`),
  ...PLACES.map((p) => `/taxi/${p}`),
  ...PLACES.map((p) => `/place/${p}`),
  ...["torii", "pagoda", "pavilion", "hall"].map((m) => `/models/${m}.glb`),
  "/icons/icon-192.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(VERSION).then((c) => Promise.allSettled(PRECACHE.map((u) => c.add(u)))).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  if (url.pathname.startsWith("/api/") && !url.pathname.startsWith("/api/photo/")) return;

  // Pages: network first (fresh after every deploy), cache when offline.
  if (req.mode === "navigate") {
    e.respondWith(
      caches.open(VERSION).then((cache) =>
        fetch(req)
          .then((res) => {
            if (res.ok) cache.put(req, res.clone());
            return res;
          })
          .catch(async () => (await cache.match(req, { ignoreSearch: true })) ?? (await cache.match("/")) ?? Response.error()),
      ),
    );
    return;
  }

  // Assets, models, photos: stale-while-revalidate.
  e.respondWith(
    caches.open(VERSION).then(async (cache) => {
      const cached = await cache.match(req, { ignoreSearch: req.mode === "navigate" });
      const network = fetch(req)
        .then((res) => {
          if (res.ok) cache.put(req, res.clone());
          return res;
        })
        .catch(() => cached ?? (req.mode === "navigate" ? cache.match("/") : Response.error()));
      return cached ?? network;
    }),
  );
});
