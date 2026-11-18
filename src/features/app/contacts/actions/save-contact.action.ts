"use server";

import { and, eq, inArray, or } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { contactCardPhotos, contacts, contactTags, tags } from "@/db/schemas";
import { cardPhotoSchema, readCardJpeg } from "@/features/app/scanner/card-photos";
import { ActionError, anyAuthenticatedAction } from "@/lib/actions";
import { db } from "@/lib/db";

const text = z.string().trim().max(500);
const saveSchema = z.object({
	name: text,
	firstname: text,
	lastname: text,
	title: text,
	company: text,
	email: text,
	phone: text,
	website: text,
	address: text,
	captureId: z.uuid().optional(),
	photos: z.array(cardPhotoSchema).max(2).default([]),
	tagIds: z.array(z.uuid()).max(50).default([]),
});

export const saveContact = anyAuthenticatedAction
	.inputSchema(saveSchema)
	.action(async ({ parsedInput, ctx: { userId } }) => {
		const { captureId, photos, tagIds, ...details } = parsedInput;
		const t = await getTranslations("contacts.errors");
		if (!Object.values(details).some(Boolean)) throw new ActionError(t("empty_contact"));
		if (
			new Set(photos.map(({ side }) => side)).size !== photos.length ||
			photos.some(({ imageBase64 }) => !readCardJpeg(imageBase64))
		)
			throw new ActionError(t("invalid_photo"));
		const duplicate = { id: null, duplicate: true } as const;

		try {
			return await db.transaction(async (tx) => {
				const byCapture = captureId ? and(eq(contacts.userId, userId), eq(contacts.captureId, captureId)) : undefined;

				if (byCapture) {
					const [saved] = await tx.select({ id: contacts.id }).from(contacts).where(byCapture).limit(1);
					if (saved) return { id: saved.id, duplicate: false as const };
				}

				const matches = [
					details.email ? eq(contacts.email, details.email) : undefined,
					details.phone ? eq(contacts.phone, details.phone) : undefined,
					details.name ? eq(contacts.name, details.name) : undefined,
				].filter(Boolean);
				if (matches.length) {
					const [existing] = await tx
						.select({ id: contacts.id })
						.from(contacts)
						.where(and(eq(contacts.userId, userId), or(...matches)))
						.limit(1);
					if (existing) {
						if (byCapture) {
							const [saved] = await tx.select({ id: contacts.id }).from(contacts).where(byCapture).limit(1);
							if (saved) return { id: saved.id, duplicate: false as const };
						}
						return duplicate;
					}
				}

				const [created] = await tx
					.insert(contacts)
					.values({ userId, captureId, ...details })
					.onConflictDoNothing({ target: [contacts.userId, contacts.captureId] })
					.returning({ id: contacts.id });

				if (!created && byCapture) {
					const [saved] = await tx.select({ id: contacts.id }).from(contacts).where(byCapture).limit(1);
					if (saved) return { id: saved.id, duplicate: false as const };
				}
				if (!created) throw new Error("Missing inserted contact");

				if (photos.length) {
					await tx.insert(contactCardPhotos).values(
						photos.map(({ side, imageBase64 }) => ({
							contactId: created.id,
							side,
							jpegBase64: imageBase64,
						})),
					);
				}
				if (tagIds.length) {
					const ownedTags = await tx
						.select({ id: tags.id })
						.from(tags)
						.where(and(eq(tags.userId, userId), inArray(tags.id, tagIds)));
					if (ownedTags.length) {
						await tx.insert(contactTags).values(
							ownedTags.map(({ id }) => ({
								contactId: created.id,
								tagId: id,
							})),
						);
					}
				}
				return { id: created.id, duplicate: false as const };
			});
		} catch {
			throw new ActionError(t("save_failed"));
		}
	});
