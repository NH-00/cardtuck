import type { ContactData } from "./types";

export type ContactHandoffPlatform = "ios" | "android";

const androidPackage = "app.cardtuck.contacts";

export function contactHandoffPlatform(userAgent: string, touchPoints: number): ContactHandoffPlatform | null {
	if (/Android/i.test(userAgent)) return "android";
	if (/iPhone|iPad|iPod/i.test(userAgent) || (touchPoints > 1 && /Macintosh/i.test(userAgent))) return "ios";
	return null;
}

export function androidContactHandoffUrl(contact: ContactData): string | null {
	const { name, firstname, lastname, company, title, phone, email, website, address } = contact;
	const payload = {
		firstname: firstname || (!lastname ? name : ""),
		lastname,
		company,
		phone,
		email,
		title,
		website,
		address,
	};
	const input = JSON.stringify(payload);
	if (new TextEncoder().encode(input).length > 8192) return null;

	const encoded = encodeURIComponent(input);
	return `intent://add#Intent;scheme=cardtuck-contacts;package=${androidPackage};S.payload=${encoded};end`;
}
