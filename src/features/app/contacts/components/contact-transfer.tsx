"use client";

import { Download, UserRoundPlus } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState, useSyncExternalStore } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { contactHandoffPlatform, contactHandoffUrl } from "@/lib/contact-handoff";
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
	const [status, setStatus] = useState<"ready" | "opened" | "tooLarge">("ready");

	// Keep the contact screen available if the browser can’t open the helper.
	const nativeUrl = platform && contactHandoffUrl(platform, contact);

	const actionLabel = (
		<>
			<UserRoundPlus />
			{t("add")}
		</>
	);

	return (
		<>
			{platform && (
				<div className="grid gap-2 sm:col-span-2">
					{nativeUrl ? (
						<a
							href={nativeUrl}
							target="_blank"
							rel="noopener noreferrer"
							className={buttonVariants({ className: "min-h-11 w-full" })}
							onClick={() => setStatus("opened")}
						>
							{actionLabel}
						</a>
					) : (
						<Button className="min-h-11 w-full" onClick={() => setStatus("tooLarge")}>
							{actionLabel}
						</Button>
					)}
					<div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-1 text-xs text-muted-foreground">
						<span role="status">{t(status === "ready" ? (platform === "ios" ? "iphone" : "android") : status)}</span>
						<Link
							href={platform === "ios" ? "/compatibility#iphone-setup" : "/compatibility#android-setup"}
							className="font-semibold text-primary underline underline-offset-4"
						>
							{t("setup")}
						</Link>
					</div>
				</div>
			)}
			<a
				href={`/api/contacts/${contact.id}/contact.vcf`}
				download={platform === "ios" ? undefined : true}
				className={buttonVariants({ variant: "outline", className: "min-h-11 w-full" })}
			>
				<Download />
				{card("download_vcf")}
			</a>
		</>
	);
}
