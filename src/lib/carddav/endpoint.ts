export function approvedCardDavUrl(value: string, allowedOrigins: readonly string[]): URL {
	const url = new URL(value);
	if (
		!["https:", "http:"].includes(url.protocol) ||
		url.username ||
		url.password ||
		url.hash ||
		url.search ||
		!allowedOrigins.some((origin) => origin === url.origin)
	) {
		throw new Error("This address book server is not approved.");
	}
	return url;
}

export function addressBookUrl(value: string, server: URL): URL {
	const book = approvedCardDavUrl(new URL(value, server).href, [server.origin]);
	book.pathname = book.pathname.replace(/\/?$/, "/");
	return book;
}
