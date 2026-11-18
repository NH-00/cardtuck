import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { buildCSPHeader, buildPermissionsPolicy } from "./security";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n.ts");

export const nextConfig: NextConfig = withNextIntl({
	output: "standalone",
	outputFileTracingExcludes: { "/*": ["./data/**", "./.env", "./.env.*"] },
	devIndicators: false,
	agentRules: false,
	images: {},
	serverExternalPackages: ["@electric-sql/pglite"],
	cacheComponents: false,
	experimental: {
		serverActions: {
			bodySizeLimit: "8mb",
		},
	},
	logging: {
		browserToTerminal: false,
	},
	allowedDevOrigins: [],
	async headers() {
		return [
			...["/app/:path*", "/api/auth/:path*", "/portal"].map((source) => ({
				source,
				headers: [{ key: "Cache-Control", value: "private, no-store" }],
			})),
			{
				source: "/(.*)",
				headers: [
					{
						key: "Content-Security-Policy",
						value: buildCSPHeader(),
					},
					{
						key: "Permissions-Policy",
						value: buildPermissionsPolicy(),
					},
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "X-Frame-Options",
						value: "DENY",
					},
					{
						key: "Referrer-Policy",
						value: "strict-origin-when-cross-origin",
					},
					{
						key: "Strict-Transport-Security",
						value: "max-age=63072000; includeSubDomains; preload",
					},
				],
			},
		];
	},
});
