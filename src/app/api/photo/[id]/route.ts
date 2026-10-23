import { destinationById } from "@/data/destinations";

const UA = { "User-Agent": "JapanSaathi/0.1 (hackathon demo; https://github.com/)" };

/** Resolve the place's lead photo on Wikimedia Commons via the Wikipedia summary API. */
async function resolvePhoto(wiki: string) {
  const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wiki)}`, {
    headers: UA,
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(String(res.status));
  const j = await res.json();
  if (!j.thumbnail?.source && !j.originalimage?.source) throw new Error("no image");
  // Wikimedia only serves standard thumbnail widths (…330, 500, 960, 1280…).
  const origW: number = j.originalimage?.width ?? 0;
  const step = origW >= 960 ? 960 : origW >= 500 ? 500 : 0;
  const src: string = j.thumbnail?.source && step ? j.thumbnail.source.replace(/\/\d+px-/, `/${step}px-`) : (j.originalimage ?? j.thumbnail).source;
  return { src, page: j.content_urls?.desktop?.page as string | undefined };
}

/**
 * Real photo for a place, from Wikimedia Commons (freely licensed).
 *   GET /api/photo/:id        → { src, page, credit } (src points back here)
 *   GET /api/photo/:id?raw=1  → the image bytes, proxied same-origin so they
 *                               load on locked-down networks and cache offline.
 */
export async function GET(req: Request, ctx: RouteContext<"/api/photo/[id]">) {
  const { id } = await ctx.params;
  const d = destinationById(id);
  if (!d) return Response.json({ error: "unknown place" }, { status: 404 });

  try {
    const photo = await resolvePhoto(d.wiki);
    if (new URL(req.url).searchParams.has("raw")) {
      const img = await fetch(photo.src, { headers: UA, next: { revalidate: 604800 } });
      if (!img.ok) throw new Error(String(img.status));
      return new Response(img.body, {
        headers: {
          "Content-Type": img.headers.get("content-type") ?? "image/jpeg",
          "Cache-Control": "public, max-age=604800, immutable",
        },
      });
    }
    return Response.json(
      { src: `/api/photo/${id}?raw=1`, page: photo.page, credit: "Wikipedia / Wikimedia Commons" },
      { headers: { "Cache-Control": "public, max-age=86400" } },
    );
  } catch {
    return Response.json({ error: "no photo" }, { status: 502 });
  }
}
