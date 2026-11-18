import { and, eq, notLike } from "drizzle-orm";
import { userCardDavProviders } from "@/db/schemas";
import { db } from "@/lib/db";
import { encryptCardDavPassword } from "./credentials";

export async function migrateCardDavCredentials() {
	const providers = await db
		.select({
			id: userCardDavProviders.id,
			userId: userCardDavProviders.userId,
			password: userCardDavProviders.password,
		})
		.from(userCardDavProviders)
		.where(notLike(userCardDavProviders.password, "enc:v1:%"));
	for (const provider of providers) {
		await db
			.update(userCardDavProviders)
			.set({ password: encryptCardDavPassword(provider.password, provider.userId) })
			.where(
				and(
					eq(userCardDavProviders.id, provider.id),
					eq(userCardDavProviders.userId, provider.userId),
					eq(userCardDavProviders.password, provider.password),
				),
			);
	}
}
