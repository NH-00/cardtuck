"use client";

import { Download, UserRoundPlus } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState, useSyncExternalStore } from "react";
import { buttonVariants } from "@/components/ui/button";
import { androidContactHandoffUrl, contactHandoffPlatform } from "@/lib/contact-handoff";
import type { ContactData } from "@/lib/types";

function subscribe() {
	return () => {};
}

function platformSnapshot() {
	return contactHandoffPlatform(navigator.userAgent, navigator.maxTouchPoints);
}

export function ContactTransfer({ contact }: { contact: ContactData & { id: number } }) {
	const t = useTranslations("contacts.transfer");
	const card = useTranslations("contacts.card");
	const platform = useSyncExternalStore(subscribe, platformSnapshot, () => null);
	const [attemptedAndroid, setAttemptedAndroid] = useState(false);

	const vcardUrl = `/api/contacts/${contact.id}/contact.vcf`;
	const androidUrl = platform === "android" ? androidContactHandoffUrl(contact) : null;

	const actionLabel = (
		<>
			<UserRoundPlus />
			{t("add")}
		</>
	);

	return (
		<>
			{platform === "ios" && (
				<a href={vcardUrl} className={buttonVariants({ className: "min-h-11 w-full sm:col-span-2" })}>
					{actionLabel}
				</a>
			)}
			{platform === "android" && (
				<div className="grid gap-2 sm:col-span-2">
					{androidUrl && (
						<a
							href={androidUrl}
							target="_blank"
							rel="noopener noreferrer"
							className={buttonVariants({ className: "min-h-11 w-full" })}
							onClick={() => setAttemptedAndroid(true)}
						>
							{actionLabel}
						</a>
					)}
					<div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-1 text-xs text-muted-foreground">
						<span role="status">{t(androidUrl ? (attemptedAndroid ? "opened" : "android") : "tooLarge")}</span>
						{androidUrl && (
							<Link
								href="/compatibility#android-setup"
								className="font-semibold text-primary underline underline-offset-4"
							>
								{t("setup")}
							</Link>
						)}
					</div>
				</div>
			)}
			<a
				href={`${vcardUrl}?download=1`}
				download
				className={buttonVariants({ variant: "outline", className: "min-h-11 w-full" })}
			>
				<Download />
				{card("download_vcf")}
			</a>
		</>
	);
}
