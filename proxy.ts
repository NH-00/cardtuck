import { type NextRequest, NextResponse } from "next/server";
import { getVerifiedSession } from "@/lib/auth/session";

export async function proxy(request: NextRequest) {
	const url = request.nextUrl;
	const { pathname, search } = url;
	try {
		const authRoutes = ["/app", "/portal"];
		const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

		if (isAuthRoute) {
			const session = await getVerifiedSession(request.headers);

			if (session && pathname.startsWith("/portal")) {
				return NextResponse.redirect(new URL("/app", request.url));
			}

			if (!session && pathname.startsWith("/app")) {
				const fullPath = pathname + search;
				return NextResponse.redirect(new URL(`/portal?redirect_to=${encodeURIComponent(fullPath)}`, request.url));
			}
		}

		return NextResponse.next();
	} catch {
		if (pathname.startsWith("/app")) {
			return NextResponse.redirect(new URL("/portal", request.url));
		}
		return NextResponse.next();
	}
}

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico|assets|.*\\.).*)"],
};
