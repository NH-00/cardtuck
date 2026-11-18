import type { MetadataRoute } from "next";
import { env } from "@/env";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
	const site = new URL(env.APP_URL);
	const isLocal = ["localhost", "127.0.0.1", "[::1]"].includes(site.hostname);

	if (isLocal) {
		return {
			rules: {
				userAgent: "*",
				disallow: "/",
			},
		};
	}

	return {
		rules: {
			userAgent: "*",
			allow: "/",
		},
		sitemap: new URL("/sitemap.xml", site).href,
		host: site.origin,
	};
}
