import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
	const t = await getTranslations("auth.not_found");
	return (
		<main className="min-h-dvh bg-[var(--cf-paper)]">
			<header className="cardtuck-etch px-6 py-8">
				<Image src="/assets/logo-reverse.svg?v=2" alt="CardTuck" width={150} height={42} />
			</header>
			<div className="mx-auto max-w-lg space-y-3 px-6 py-8">
				<h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
				<p className="text-muted-foreground">{t("description")}</p>
				<Link
					href="/"
					className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
				>
					{t("home")}
				</Link>
			</div>
		</main>
	);
}
