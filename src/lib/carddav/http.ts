import { env } from "@/env";
import type { AddressBook } from "@/lib/types";
import { addressBookUrl, approvedCardDavUrl } from "./endpoint";
import type { CardDavCredentials } from "./interface";

function basicAuth(username: string, password: string): string {
	return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}

function parseAddressBooks(xml: string): AddressBook[] {
	const books: AddressBook[] = [];
	const responsePattern = /<(?:\w+:)?response\b[^>]*>([\s\S]*?)<\/(?:\w+:)?response>/gi;
	let match = responsePattern.exec(xml);
	while (match !== null) {
		const block = match[1];
		const resourcetypeMatch = /<(?:\w+:)?resourcetype\b[^>]*>([\s\S]*?)<\/(?:\w+:)?resourcetype>/i.exec(block);
		if (resourcetypeMatch && /addressbook/i.test(resourcetypeMatch[1])) {
			const hrefMatch = /<(?:\w+:)?href\b[^>]*>([^<]+)<\/(?:\w+:)?href>/i.exec(block);
			const nameMatch = /<(?:\w+:)?displayname\b[^>]*>([^<]*)<\/(?:\w+:)?displayname>/i.exec(block);
			if (hrefMatch?.[1]) {
				books.push({
					href: hrefMatch[1].trim(),
					name: nameMatch?.[1].trim() || hrefMatch[1].trim(),
				});
			}
		}
		match = responsePattern.exec(xml);
	}
	return books;
}

export async function discoverBooks(credentials: CardDavCredentials): Promise<AddressBook[]> {
	const { url, username, password } = credentials;
	const server = approvedCardDavUrl(url, env.CARDDAV_ALLOWED_ORIGINS);
	const res = await fetch(server, {
		method: "PROPFIND",
		redirect: "error",
		signal: AbortSignal.timeout(10000),
		headers: {
			Authorization: basicAuth(username, password),
			Depth: "1",
			"Content-Type": "application/xml; charset=utf-8",
		},
		body: `<?xml version="1.0" encoding="utf-8"?><propfind xmlns="DAV:"><prop><displayname/><resourcetype/></prop></propfind>`,
	});
	if (res.status !== 207) throw new Error(`Not a CardDAV server (HTTP ${res.status})`);
	return parseAddressBooks(await res.text()).flatMap((book) => {
		try {
			return [{ ...book, href: addressBookUrl(book.href, server).href }];
		} catch {
			return [];
		}
	});
}

export async function testConnection(credentials: CardDavCredentials): Promise<void> {
	const books = await discoverBooks(credentials);
	if (books.length === 0) {
		throw new Error("No CardDAV address book found at this URL");
	}
}

export async function saveContact(
	vcardString: string,
	bookHref: string,
	credentials: CardDavCredentials,
	remoteId?: string,
): Promise<string> {
	const { url, username, password } = credentials;
	const uid = remoteId || crypto.randomUUID();
	const book = addressBookUrl(bookHref, approvedCardDavUrl(url, env.CARDDAV_ALLOWED_ORIGINS));
	const contactUrl = new URL(`${encodeURIComponent(uid)}.vcf`, book);
	const vcardWithUid = vcardString.replace(/\r?\nEND:VCARD/, `\r\nUID:${uid}\r\nEND:VCARD`);
	const res = await fetch(contactUrl, {
		method: "PUT",
		redirect: "error",
		signal: AbortSignal.timeout(10000),
		headers: {
			Authorization: basicAuth(username, password),
			"Content-Type": "text/vcard; charset=utf-8",
		},
		body: vcardWithUid,
	});
	if (!res.ok) throw new Error(`PUT failed: ${res.status} ${res.statusText}`);
	return uid;
}

export async function deleteContact(
	remoteId: string,
	bookHref: string,
	credentials: CardDavCredentials,
): Promise<void> {
	const { url, username, password } = credentials;
	const book = addressBookUrl(bookHref, approvedCardDavUrl(url, env.CARDDAV_ALLOWED_ORIGINS));
	const contactUrl = new URL(`${encodeURIComponent(remoteId)}.vcf`, book);
	const res = await fetch(contactUrl, {
		method: "DELETE",
		redirect: "error",
		signal: AbortSignal.timeout(10000),
		headers: {
			Authorization: basicAuth(username, password),
		},
	});
	if (!res.ok && res.status !== 404) {
		throw new Error(`DELETE failed: ${res.status} ${res.statusText}`);
	}
}
