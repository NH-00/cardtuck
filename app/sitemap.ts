import type { MetadataRoute } from "next";
import { env } from "@/env";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
	const site = new URL(env.APP_URL);
	return [
		{
			url: site.href,
			changeFrequency: "monthly",
			priority: 1,
		},
		...["/scan-guide", "/compatibility", "/photo-privacy", "/contact", "/privacy", "/self-host"].map((path) => ({
			url: new URL(path, site).href,
		})),
	];
}
