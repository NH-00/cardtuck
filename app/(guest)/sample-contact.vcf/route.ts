import { generateVCard } from "@/lib/vcf";
import { sampleContact } from "../sample-contact";

export function GET() {
	return new Response(generateVCard(sampleContact), {
		headers: {
			"Content-Type": "text/vcard; charset=utf-8",
			"Content-Disposition": 'attachment; filename="Maya Chen.vcf"',
		},
	});
}
