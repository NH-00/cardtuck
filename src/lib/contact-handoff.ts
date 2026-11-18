import type { ContactData } from "./types";

export type ContactHandoffPlatform = "ios" | "android";

const shortcutName = "CardTuck Add Contact";
const androidPackage = "app.cardtuck.contacts";

export function contactHandoffPlatform(userAgent: string, touchPoints: number): ContactHandoffPlatform | null {
	if (/Android/i.test(userAgent)) return "android";
	if (/iPhone|iPad|iPod/i.test(userAgent) || (touchPoints > 1 && /Macintosh/i.test(userAgent))) return "ios";
	return null;
}

export function contactHandoffUrl(platform: ContactHandoffPlatform, contact: ContactData): string | null {
	const { name, firstname, lastname, company, title, phone, email, website, address } = contact;
	const payload = {
		firstname: firstname || (!lastname ? name : ""),
		lastname,
		company,
		phone,
		email,
	};
	const input = JSON.stringify(platform === "ios" ? payload : { ...payload, title, website, address });
	if (new TextEncoder().encode(input).length > 8192) return null;

	const encoded = encodeURIComponent(input);
	if (platform === "ios") {
		return `shortcuts://run-shortcut?name=${encodeURIComponent(shortcutName)}&input=text&text=${encoded}`;
	}
	return `intent://add#Intent;scheme=cardtuck-contacts;package=${androidPackage};S.payload=${encoded};end`;
}
