import { headers } from "next/headers";
import { createSafeActionClient } from "next-safe-action";
import { getVerifiedSession } from "./auth/session";

export class ActionError extends Error {}

const action = createSafeActionClient({
	handleServerError(error) {
		if (error instanceof ActionError) return error.message;
		console.error("An internal CardTuck action failed.");
		return "Couldn’t complete that action. Try again.";
	},
});

export const anyAuthenticatedAction = action.use(async ({ next }) => {
	const session = await getVerifiedSession(await headers());
	if (!session) throw new ActionError("Sign in to continue.");
	return next({ ctx: { userId: session.user.id } });
});
