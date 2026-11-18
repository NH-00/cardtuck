import "../../cardtuck-product.css";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Dashboard } from "@/features/app/layouts/dashboard";
import { getVerifiedSession } from "@/lib/auth/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
	if (!(await getVerifiedSession(await headers()))) redirect("/portal");
	return <Dashboard>{children}</Dashboard>;
}
