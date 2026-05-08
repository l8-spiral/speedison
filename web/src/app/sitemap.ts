import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://speedison.se";
  return [
    { url: `${base}/`,             changeFrequency: "monthly", priority: 1 },
    { url: `${base}/kontakt`,      changeFrequency: "yearly",  priority: 0.5 },
    { url: `${base}/integritet`,   changeFrequency: "yearly",  priority: 0.2 },
  ];
}
