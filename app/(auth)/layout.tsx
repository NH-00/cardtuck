import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthLayout } from "@/features/auth/layouts/auth";
import { getVerifiedSession } from "@/lib/auth/session";
import { SiteFrame } from "../(guest)/website-chrome";

export default async function Layout({ children }: { children: React.ReactNode }) {
	const session = await getVerifiedSession(await headers());

	if (session?.user) {
		redirect("/app");
	}

	return (
		<SiteFrame active="/portal">
			<AuthLayout>{children}</AuthLayout>
		</SiteFrame>
	);
}
