import { vCardResponse } from "@/lib/vcf-response";
import { sampleContact } from "../sample-contact";

export function GET(request: Request) {
	return vCardResponse(request, sampleContact);
}
