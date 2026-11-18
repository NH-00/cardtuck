"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { contactCardPhotos, contacts } from "@/db/schemas";
import { anyAuthenticatedAction } from "@/lib/actions";
import { db } from "@/lib/db";

export const removeContactPhotos = anyAuthenticatedAction
  .inputSchema(z.object({ id: z.number().int().min(1).max(2147483647) }))
  .action(async ({ parsedInput: { id }, ctx: { userId } }) => {
    const [contact] = await db.select({ id: contacts.id }).from(contacts)
      .where(and(eq(contacts.id, id), eq(contacts.userId, userId))).limit(1);
    if (!contact) throw new Error("Contact not found.");
    await db.delete(contactCardPhotos).where(eq(contactCardPhotos.contactId, contact.id));
    return { removed: true };
  });
