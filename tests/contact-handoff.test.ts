import assert from "node:assert/strict";
import { test } from "node:test";
import { contactHandoffPlatform, contactHandoffUrl } from "../src/lib/contact-handoff";
import { emptyContact } from "../src/lib/types";

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

test("iOS sends only the editor fields as one JSON Shortcut input", () => {
	const url = new URL(contactHandoffUrl("ios", contact) ?? "");
	assert.equal(url.protocol, "shortcuts:");
	assert.equal(url.hostname, "run-shortcut");
	assert.equal(url.searchParams.get("name"), "CardTuck Add Contact");
	assert.equal(url.searchParams.get("input"), "text");
	assert.deepEqual(JSON.parse(url.searchParams.get("text") ?? ""), {
		firstname: "Avery",
		lastname: "Noëlle",
		company: "Tidemark; S.example=injected",
		email: "avery+office@tidemark.example",
		phone: "+16045550142",
	});
});

test("Android encodes the full contact as one extra for the named helper app", () => {
	const url = contactHandoffUrl("android", contact);
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
	assert.equal(contactHandoffUrl("android", { ...contact, address: "😀".repeat(2500) }), null);
});
