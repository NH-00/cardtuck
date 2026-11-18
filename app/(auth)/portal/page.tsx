import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AuthPortal } from "@/features/auth/components/auth-portal";
import { isWhitelisted } from "@/lib/restrictions";

export const metadata: Metadata = { title: "Sign in" };

export default async function AuthPage({ searchParams }: {
  searchParams: Promise<{ redirect_to?: string; email?: string; authentificationType?: string; link?: string }>;
}) {
  const { redirect_to, email, authentificationType, link } = await searchParams;
  if (link === "expired") {
    const t = await getTranslations("auth.link_error");
    return (
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
        <Link href="/portal" className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">{t("try_again")}</Link>
      </section>
    );
  }
  const validEmail = email && isWhitelisted(email) ? email : undefined;
  const destination = redirect_to?.startsWith("/") && !redirect_to.startsWith("//") && !redirect_to.includes("\\")
    ? redirect_to : "/app";
  return <AuthPortal callbackURL={destination} initialEmail={validEmail} prefilledEmail={email} authType={authentificationType} />;
}
