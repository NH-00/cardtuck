import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";

const prefix = "enc:v1:";

function credentialKey() {
	const secret = process.env.APP_SECRET;
	if (!secret || secret.length < 32) throw new Error("A persistent APP_SECRET of at least 32 characters is required.");
	return Buffer.from(hkdfSync("sha256", secret, "CardTuck", "CardDAV credentials v1", 32));
}

export function encryptCardDavPassword(password: string, ownerId: string) {
	const nonce = randomBytes(12);
	const cipher = createCipheriv("aes-256-gcm", credentialKey(), nonce);
	cipher.setAAD(Buffer.from(ownerId));
	const payload = Buffer.concat([cipher.update(password, "utf8"), cipher.final()]);
	return prefix + Buffer.concat([nonce, cipher.getAuthTag(), payload]).toString("base64url");
}

export function decryptCardDavPassword(value: string, ownerId: string) {
	if (!isEncryptedCardDavPassword(value)) throw new Error("Address book credentials must be migrated.");
	const payload = Buffer.from(value.slice(prefix.length), "base64url");
	if (payload.length < 29) throw new Error("Invalid stored address book credentials.");
	const decipher = createDecipheriv("aes-256-gcm", credentialKey(), payload.subarray(0, 12));
	decipher.setAAD(Buffer.from(ownerId));
	decipher.setAuthTag(payload.subarray(12, 28));
	return Buffer.concat([decipher.update(payload.subarray(28)), decipher.final()]).toString("utf8");
}

export function isEncryptedCardDavPassword(value: string) {
	return value.startsWith(prefix);
}
