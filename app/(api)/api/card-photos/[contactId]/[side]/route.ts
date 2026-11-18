import { and, eq } from "drizzle-orm";
import { contactCardPhotos, contacts } from "@/db/schemas";
import { cardSide, readCardJpeg } from "@/features/app/scanner/card-photos";
import { getVerifiedSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

const noCache = { "Cache-Control": "private, no-store" };
const notFound = () => new Response(null, { status: 404, headers: noCache });

export async function GET(request: Request, { params }: { params: Promise<{ contactId: string; side: string }> }) {
	const session = await getVerifiedSession(request.headers);
	if (!session) return new Response(null, { status: 401, headers: noCache });

	const { contactId, side } = await params;
	const validSide = cardSide.safeParse(side);
	const id = Number(contactId);
	if (!validSide.success || !/^\d+$/.test(contactId) || id <= 0 || id > 2147483647) {
		return notFound();
	}

	const [photo] = await db
		.select({ image: contactCardPhotos.jpegBase64 })
		.from(contactCardPhotos)
		.innerJoin(contacts, eq(contacts.id, contactCardPhotos.contactId))
		.where(and(eq(contacts.userId, session.user.id), eq(contacts.id, id), eq(contactCardPhotos.side, validSide.data)))
		.limit(1);

	const jpeg = photo && readCardJpeg(photo.image);
	if (!jpeg) return notFound();
	return new Response(Uint8Array.from(jpeg), {
		headers: {
			...noCache,
			"Content-Type": "image/jpeg",
			"Cross-Origin-Resource-Policy": "same-origin",
			"X-Content-Type-Options": "nosniff",
		},
	});
}
