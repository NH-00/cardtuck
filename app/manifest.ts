import type { MetadataRoute } from "next";
import { projectConfig } from "@/config/project";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: projectConfig.name,
    short_name: projectConfig.name,
    description: projectConfig.description,
    start_url: "/app",
    display: "standalone",
    background_color: "#F3F7F3",
    theme_color: "#112D25",
    icons: [
      { src: "/assets/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/assets/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
