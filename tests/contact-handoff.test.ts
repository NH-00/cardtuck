import assert from "node:assert/strict";
import { test } from "node:test";
import { androidContactHandoffUrl, contactHandoffPlatform } from "../src/lib/contact-handoff";
import { emptyContact } from "../src/lib/types";
import { vCardResponse } from "../src/lib/vcf-response";

const contact = {
	...emptyContact(),
	name: "Avery & Noëlle",
	firstname: "Avery",
	lastname: "Noëlle",
	company: "Tidemark; S.example=injected",
	email: "avery+office@tidemark.example",
	phone: "+16045550142",
	address: "1 Main Street",
	website: "https://tidemark.example",
	title: "Design Director",
	id: 23,
	userId: "test-owner",
};

test("only mobile browser identities get an on-device handoff", () => {
	assert.equal(contactHandoffPlatform("Mozilla/5.0 (iPhone)", 5), "ios");
	assert.equal(contactHandoffPlatform("Mozilla/5.0 (Macintosh)", 5), "ios");
	assert.equal(contactHandoffPlatform("Mozilla/5.0 (Linux; Android 15)", 5), "android");
	assert.equal(contactHandoffPlatform("Mozilla/5.0 (Macintosh)", 0), null);
});

test("the iPhone preview and file download deliver the same complete vCard", async () => {
	const url = "https://cardtuck.example/api/contacts/23/contact.vcf";
	const preview = vCardResponse(new Request(url), contact);
	const download = vCardResponse(new Request(`${url}?download=1`), contact);
	assert.equal(preview.headers.get("Content-Type"), "text/vcard; charset=utf-8");
	assert.equal(download.headers.get("Content-Type"), "application/octet-stream");
	for (const response of [preview, download]) {
		assert.equal(response.headers.get("Cache-Control"), "private, no-store");
		assert.match(response.headers.get("Content-Disposition") ?? "", /filename\*=UTF-8''Avery%20%26%20No%C3%ABlle\.vcf/);
	}
	const fields = await preview.text();
	assert.equal(await download.text(), fields);
	assert.match(fields, /TITLE:Design Director\r\n/);
	assert.match(fields, /URL:https:\/\/tidemark\.example\r\n/);
	assert.match(fields, /ADR:;;1 Main Street;;;;\r\n/);
});

test("Android encodes the full contact as one extra for the named helper app", () => {
	const url = androidContactHandoffUrl(contact);
	assert.ok(url);
	const [scheme, intent, payload, end] = url.split(/;S\.payload=|;end$|#Intent;/);
	assert.equal(scheme, "intent://add");
	assert.equal(intent, "scheme=cardtuck-contacts;package=app.cardtuck.contacts");
	assert.equal(end, "");
	assert.ok(!payload.includes(";"));
	const parsed = JSON.parse(decodeURIComponent(payload));
	assert.equal(parsed.company, contact.company);
	assert.equal(parsed.website, contact.website);
	assert.equal(parsed.address, contact.address);
	assert.equal(parsed.title, contact.title);
	assert.equal(parsed.userId, undefined);
	assert.equal(parsed.id, undefined);
});

test("large payloads leave the vCard fallback available", () => {
	assert.equal(androidContactHandoffUrl({ ...contact, address: "😀".repeat(2500) }), null);
});
