import { and, eq } from "drizzle-orm";
import { contacts, contactTags, tags } from "@/db/schemas";
import { getVerifiedSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { vCardResponse, vcardHeaders } from "@/lib/vcf-response";

export async function GET(request: Request, { params }: { params: Promise<{ contactId: string }> }) {
	const session = await getVerifiedSession(request.headers);
	if (!session) return new Response(null, { status: 401, headers: vcardHeaders });

	const { contactId } = await params;
	const id = Number(contactId);
	if (!/^\d+$/.test(contactId) || id <= 0 || id > 2147483647) {
		return new Response(null, { status: 404, headers: vcardHeaders });
	}

	const userId = session.user.id;
	const [contact] = await db
		.select({
			name: contacts.name,
			firstname: contacts.firstname,
			lastname: contacts.lastname,
			company: contacts.company,
			title: contacts.title,
			phone: contacts.phone,
			email: contacts.email,
			website: contacts.website,
			address: contacts.address,
		})
		.from(contacts)
		.where(and(eq(contacts.id, id), eq(contacts.userId, userId)))
		.limit(1);
	if (!contact) return new Response(null, { status: 404, headers: vcardHeaders });

	const tagRows = await db
		.select({ name: tags.name })
		.from(contactTags)
		.innerJoin(tags, eq(contactTags.tagId, tags.id))
		.where(and(eq(contactTags.contactId, id), eq(tags.userId, userId)));
	return vCardResponse(
		request,
		contact,
		tagRows.map(({ name }) => name),
	);
}
