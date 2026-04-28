import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Doa Sejati — Berdoa untuk Indonesia",
    short_name: "Doa Sejati",
    description:
      "Gerakan doa harian untuk suku-suku yang belum terjangkau di Indonesia.",
    start_url: "/today",
    display: "standalone",
    background_color: "#0D1E3D",
    theme_color: "#0D1E3D",
    orientation: "portrait",
    categories: ["lifestyle", "religion"],
    lang: "id",
    icons: [
      {
        src: "/icons/logo-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/logo-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
    screenshots: [],
  };
}
