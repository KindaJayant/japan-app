import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Japan Saathi",
    short_name: "Saathi",
    description: "Japan travel companion for Indian travellers: diet-safe food, etiquette, budgets in ₹ and taxi cards.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6efe3",
    theme_color: "#f6efe3",
    orientation: "portrait",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
