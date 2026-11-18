import assert from "node:assert/strict";
import test from "node:test";
import { decryptCardDavPassword, encryptCardDavPassword } from "../src/lib/carddav/credentials";
import { addressBookUrl, approvedCardDavUrl } from "../src/lib/carddav/endpoint";

test("CardDAV requests require a configured origin and stay on that origin", () => {
	const origin = "https://book.example";
	const server = approvedCardDavUrl(origin + "/users/example", [origin]);
	assert.equal(addressBookUrl("/users/example/contacts", server).href, origin + "/users/example/contacts/");
	assert.throws(() => approvedCardDavUrl(origin, []));
	assert.throws(() => addressBookUrl("https://other.example/books", server));
	assert.throws(() => approvedCardDavUrl("https://book.example:8443/books", [origin]));
	assert.throws(() => approvedCardDavUrl("https://user@book.example/books", [origin]));
});

test("saved CardDAV credentials are randomized and bound to their owner", () => {
	const previous = process.env.APP_SECRET;
	process.env.APP_SECRET = "test-only-cardtuck-secret-with-at-least-32-characters";
	try {
		const password = "Fictional address book password";
		const encrypted = encryptCardDavPassword(password, "account-a");
		assert(!encrypted.includes(password));
		assert.notEqual(encryptCardDavPassword(password, "account-a"), encrypted);
		assert.equal(decryptCardDavPassword(encrypted, "account-a"), password);
		assert.throws(() => decryptCardDavPassword(encrypted, "account-b"));
	} finally {
		if (previous === undefined) delete process.env.APP_SECRET;
		else process.env.APP_SECRET = previous;
	}
});
