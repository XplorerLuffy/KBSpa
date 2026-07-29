import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kuenphen Beauty Spa",
    short_name: "Kuenphen",
    description:
      "Premium beauty and wellness treatments tailored just for you.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf6ee",
    theme_color: "#d4af37",
    icons: [
      // Google asks for square icons in multiples of 48px; "any maskable"
      // lets Android crop to its own shape without clipping the mark.
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
