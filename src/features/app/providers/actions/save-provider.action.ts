"use server";

import { and, eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { userCardDavProviders } from "@/db/schemas";
import { env } from "@/env";
import { ActionError, anyAuthenticatedAction } from "@/lib/actions";
import { encryptCardDavPassword } from "@/lib/carddav/credentials";
import { approvedCardDavUrl } from "@/lib/carddav/endpoint";
import { db } from "@/lib/db";

export const saveProvider = anyAuthenticatedAction
	.inputSchema(
		z.object({
			id: z.uuid().optional(),
			type: z.enum(["radicale", "baikal", "nextcloud", "custom"]),
			label: z.string().trim().min(1).max(120),
			url: z.url().max(2048),
			username: z.string().trim().min(1).max(254),
			password: z.string().max(1024).optional(),
		}),
	)
	.action(async ({ parsedInput: { id, type, label, url, username, password }, ctx: { userId } }) => {
		const t = await getTranslations("providers.errors");
		let server: URL;
		try {
			server = approvedCardDavUrl(url, env.CARDDAV_ALLOWED_ORIGINS);
		} catch {
			throw new ActionError("Ask your CardTuck operator to approve this address book server.");
		}
		if (id) {
			const [existing] = await db
				.select({ url: userCardDavProviders.url, username: userCardDavProviders.username })
				.from(userCardDavProviders)
				.where(and(eq(userCardDavProviders.id, id), eq(userCardDavProviders.userId, userId)))
				.limit(1);
			if (!existing) throw new ActionError(t("provider_not_found"));
			if (!password && (existing.url !== server.href || existing.username !== username)) {
				throw new ActionError(t("password_required"));
			}
			const updates: Partial<typeof userCardDavProviders.$inferInsert> = {
				type,
				label,
				url: server.href,
				username,
				updatedAt: new Date(),
			};
			if (password) updates.password = encryptCardDavPassword(password, userId);
			await db
				.update(userCardDavProviders)
				.set(updates)
				.where(and(eq(userCardDavProviders.id, id), eq(userCardDavProviders.userId, userId)));
			return { id };
		}
		if (!password) throw new ActionError(t("password_required"));
		const [row] = await db
			.insert(userCardDavProviders)
			.values({
				userId,
				type,
				label,
				url: server.href,
				username,
				password: encryptCardDavPassword(password, userId),
				updatedAt: new Date(),
			})
			.returning({ id: userCardDavProviders.id });
		return { id: row.id };
	});
