"use server";

import { desc, eq, getTableColumns, sql } from "drizzle-orm";
import { contactCardPhotos, contacts } from "@/db/schemas";
import { anyAuthenticatedAction } from "@/lib/actions";
import { db } from "@/lib/db";

export const listContacts = anyAuthenticatedAction.action(async ({ ctx: { userId } }) => {
  const { imageUrl, captureId, ...fields } = getTableColumns(contacts);
  return db.select({
    ...fields,
    hasFront: sql<boolean>`exists (select 1 from ${contactCardPhotos}
      where ${contactCardPhotos.contactId} = ${contacts.id} and ${contactCardPhotos.side} = 'front')`,
    hasBack: sql<boolean>`exists (select 1 from ${contactCardPhotos}
      where ${contactCardPhotos.contactId} = ${contacts.id} and ${contactCardPhotos.side} = 'back')`,
  }).from(contacts).where(eq(contacts.userId, userId)).orderBy(desc(contacts.createdAt), desc(contacts.id));
});
