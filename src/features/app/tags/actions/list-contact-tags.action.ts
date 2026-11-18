"use server";

import { and, eq } from "drizzle-orm";
import { contacts, contactTags, tags } from "@/db/schemas";
import { anyAuthenticatedAction } from "@/lib/actions";
import { db } from "@/lib/db";

export const listContactTags = anyAuthenticatedAction.action(async ({ ctx: { userId } }) => {
	return db
		.select({ contactId: contactTags.contactId, tagId: contactTags.tagId })
		.from(contactTags)
		.innerJoin(contacts, eq(contacts.id, contactTags.contactId))
		.innerJoin(tags, eq(tags.id, contactTags.tagId))
		.where(and(eq(contacts.userId, userId), eq(tags.userId, userId)));
});
