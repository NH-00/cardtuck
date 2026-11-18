import authServer from "@/lib/auth/server";
import { isWhitelisted } from "@/lib/restrictions";

export async function getVerifiedSession(headers: Headers) {
	const session = await authServer.api.getSession({ headers });
	return session?.user.emailVerified && isWhitelisted(session.user.email) ? session : null;
}
