import type { ContactData } from "./types";
import { generateVCard, vcfFileName } from "./vcf";

export const vcardHeaders = {
	"Cache-Control": "private, no-store",
	"Cross-Origin-Resource-Policy": "same-origin",
	"X-Content-Type-Options": "nosniff",
};

export function vCardResponse(request: Request, contact: ContactData, tagNames: string[] = []): Response {
	const download = new URL(request.url).searchParams.get("download") === "1";
	const filename = encodeURIComponent(vcfFileName(contact).toWellFormed()).replace(
		/['()*]/g,
		(character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
	);
	return new Response(generateVCard(contact, tagNames), {
		headers: {
			...vcardHeaders,
			"Content-Type": download ? "application/octet-stream" : "text/vcard; charset=utf-8",
			"Content-Disposition": `attachment; filename="contact.vcf"; filename*=UTF-8''${filename}`,
		},
	});
}
