"use server";

import { z } from "zod";
import { env } from "@/env";
import { ActionError, anyAuthenticatedAction } from "@/lib/actions";
import { getProvider } from "@/lib/carddav";
import { approvedCardDavUrl } from "@/lib/carddav/endpoint";

export const testProviderConnection = anyAuthenticatedAction
	.inputSchema(
		z.object({
			type: z.enum(["radicale", "baikal", "nextcloud", "custom"]),
			url: z.url().max(2048),
			username: z.string().min(1).max(254),
			password: z.string().min(1).max(1024),
		}),
	)
	.action(async ({ parsedInput: { type, url, username, password } }) => {
		try {
			approvedCardDavUrl(url, env.CARDDAV_ALLOWED_ORIGINS);
		} catch {
			throw new ActionError("Ask your CardTuck operator to approve this address book server.");
		}
		try {
			await getProvider(type).testConnection({ url, username, password });
		} catch {
			throw new ActionError("Couldn’t connect. Check the collection URL and sign-in details.");
		}
	});
