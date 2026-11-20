"use client";

import { ExternalLink, Image as ImageIcon, RefreshCw, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { ProviderSummary, Tag } from "@/db/schemas/contacts";
import type { CardSide } from "@/features/app/scanner/card-photos";
import { TagPopover } from "@/features/app/tags/components/tag-popover";
import { tagStyle } from "@/features/app/tags/tag-palette";
import { deleteContact } from "../actions/delete-contact.action";
import { removeContactPhotos } from "../actions/remove-photos.action";
import { syncContact } from "../actions/sync-contact.action";
import { contactLabel, type ListedContact } from "../listed-contact";
import { ContactTransfer } from "./contact-transfer";

function websiteLink(value: string) {
	if (!value.trim()) return;
	try {
		const cleaned = value.trim();
		const url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(cleaned) ? cleaned : `https://${cleaned}`);
		if (["http:", "https:"].includes(url.protocol) && !url.username && !url.password) return url.href;
	} catch {
		return;
	}
}

export function ContactCard({
	contact,
	providers,
	tags,
	assignedTagIds,
	onMutated,
	onClose,
	onAddressBooks,
}: {
	contact: ListedContact;
	providers: ProviderSummary[];
	tags: Tag[];
	assignedTagIds: string[];
	onMutated: () => void;
	onClose: () => void;
	onAddressBooks: () => void;
}) {
	const t = useTranslations("contacts.card");
	const errors = useTranslations("contacts.errors");
	const ui = useTranslations("contacts.cardtuck");
	const scanner = useTranslations("scanner.cardtuck");
	const [photoSide, setPhotoSide] = useState<CardSide>("front");
	const [panel, setPanel] = useState<"contact" | "photos" | "removePhotos" | "delete" | "sync">("contact");
	const [busy, setBusy] = useState(false);
	const assigned = tags.filter((tag) => assignedTagIds.includes(tag.id));
	const name = contactLabel(contact);
	const website = websiteLink(contact.website);
	const initial = name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((word) => word[0])
		.join("")
		.toUpperCase();
	const data = [
		{
			label: "email",
			value: contact.email,
			href: contact.email ? `mailto:${encodeURIComponent(contact.email)}` : undefined,
		},
		{
			label: "phone",
			value: contact.phone,
			href: contact.phone ? `tel:${contact.phone.replace(/[^+0-9]/g, "")}` : undefined,
		},
		{ label: "website", value: contact.website, href: website },
		{ label: "address", value: contact.address, href: undefined },
	] as const;

	async function act(task: "delete" | "removePhotos" | "sync", providerId?: string) {
		setBusy(true);
		try {
			const result =
				task === "delete"
					? await deleteContact({ id: contact.id })
					: task === "removePhotos"
						? await removeContactPhotos({ id: contact.id })
						: providerId
							? await syncContact({ id: contact.id, providerId })
							: undefined;
			if (!result || result.serverError || result.validationErrors) throw new Error(result?.serverError);
			onMutated();
			if (task === "delete") onClose();
			else if (task === "sync") {
				toast.success(t("synced_label"));
				setPanel("contact");
			} else {
				toast.success(ui("photosRemoved"));
				setPanel("contact");
			}
		} catch {
			toast.error(
				task === "delete" ? errors("delete_failed") : task === "sync" ? errors("sync_failed") : ui("removePhotosError"),
			);
		} finally {
			setBusy(false);
		}
	}

	return (
		<Dialog
			open
			onOpenChange={(open) => {
				if (!open && !busy) onClose();
			}}
		>
			<DialogContent className="ct-contact-dialog max-h-[88dvh] overflow-y-auto sm:max-w-lg">
				{panel === "contact" && (
					<>
						<div className="flex min-w-0 items-start gap-3 pr-8">
							<span className="ct-contact-avatar grid size-12 shrink-0 place-items-center rounded-full text-base font-bold">
								{initial}
							</span>
							<div className="min-w-0">
								<DialogTitle className="ct-dialog-title break-words">{name}</DialogTitle>
								{(contact.title || contact.company) && (
									<p className="text-sm text-muted-foreground">
										{[contact.title, contact.company].filter(Boolean).join(" · ")}
									</p>
								)}
							</div>
						</div>
						<DialogDescription className="sr-only">{ui("contactDetails")}</DialogDescription>
						<div className="flex flex-wrap gap-1.5">
							{assigned.map((tag) => (
								<span key={tag.id} className="rounded-md px-2 py-1 text-xs font-semibold" style={tagStyle(tag.color)}>
									{tag.name}
								</span>
							))}
							{contact.syncedAt && (
								<span className="rounded-md bg-muted px-2 py-1 text-xs font-semibold text-primary">
									{t("synced_label")}
								</span>
							)}
						</div>
						<dl className="divide-y border-y">
							{data
								.filter((field) => field.value)
								.map((field) => (
									<div key={field.label} className="space-y-1 py-2.5">
										<dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
											{ui(field.label)}
										</dt>
										<dd className="break-words font-semibold">
											{field.href ? (
												<a
													href={field.href}
													target={field.label === "website" ? "_blank" : undefined}
													rel={field.label === "website" ? "noreferrer" : undefined}
													className="inline-flex max-w-full items-center gap-2 text-primary underline-offset-4 hover:underline"
												>
													{field.value}
													{field.label === "website" && <ExternalLink className="size-4 shrink-0" />}
												</a>
											) : (
												field.value
											)}
										</dd>
									</div>
								))}
						</dl>
						{(contact.hasFront || contact.hasBack) && (
							<div className="flex items-center justify-between gap-2 rounded-lg border p-3">
								<span className="text-sm font-semibold">{ui("cardPhotos")}</span>
								<Button
									variant="outline"
									onClick={() => {
										setPhotoSide(contact.hasFront ? "front" : "back");
										setPanel("photos");
									}}
								>
									<ImageIcon />
									{ui("viewPhotos")}
								</Button>
							</div>
						)}
						<div className="grid gap-2 sm:grid-cols-2">
							<ContactTransfer contact={contact} />
							<Button variant="outline" onClick={() => (providers.length ? setPanel("sync") : onAddressBooks())}>
								<RefreshCw />
								{providers.length ? ui("syncContact") : ui("addAddressBook")}
							</Button>
							<div className="flex items-center gap-1">
								<span className="text-sm font-medium">{ui("manageTags")}</span>
								<TagPopover
									contactId={contact.id}
									assignedTagIds={assignedTagIds}
									allTags={tags}
									onMutated={onMutated}
								/>
							</div>
							<Button variant="ghost" className="text-destructive" onClick={() => setPanel("delete")}>
								<Trash2 />
								{ui("deleteContact")}
							</Button>
						</div>
					</>
				)}
				{panel === "photos" && (
					<>
						<DialogTitle>{ui("cardPhotos")}</DialogTitle>
						<DialogDescription>{name}</DialogDescription>
						<div className="cardtuck-etch grid min-h-48 place-items-center rounded-xl p-3">
							<img
								src={`/api/card-photos/${contact.id}/${photoSide}`}
								alt={scanner(photoSide === "front" ? "front" : "backSide")}
								className="max-h-[45dvh] w-full object-contain"
							/>
						</div>
						<div className="flex flex-wrap gap-2">
							{(["front", "back"] as const).map(
								(side) =>
									(side === "front" ? contact.hasFront : contact.hasBack) && (
										<Button
											key={side}
											variant={photoSide === side ? "secondary" : "outline"}
											aria-pressed={photoSide === side}
											onClick={() => setPhotoSide(side)}
										>
											{scanner(side === "front" ? "front" : "backSide")}
										</Button>
									),
							)}
						</div>
						<div className="flex flex-wrap justify-between gap-2">
							<Button variant="outline" onClick={() => setPanel("contact")}>
								{scanner("backToContact")}
							</Button>
							<Button variant="ghost" className="text-destructive" onClick={() => setPanel("removePhotos")}>
								{ui("removePhotos")}
							</Button>
						</div>
					</>
				)}
				{panel === "sync" && (
					<>
						<DialogTitle>{ui("syncTitle", { name })}</DialogTitle>
						<DialogDescription>{ui("chooseAddressBook")}</DialogDescription>
						{providers.map((provider) => (
							<Button
								key={provider.id}
								variant="outline"
								disabled={busy}
								className="justify-between"
								onClick={() => void act("sync", provider.id)}
							>
								{provider.label}
								<span className="text-muted-foreground capitalize">{provider.type}</span>
							</Button>
						))}
						<Button variant="ghost" onClick={() => setPanel("contact")} disabled={busy}>
							{scanner("cancel")}
						</Button>
					</>
				)}
				{(panel === "removePhotos" || panel === "delete") && (
					<>
						<DialogTitle>{panel === "delete" ? ui("deleteTitle", { name }) : ui("removePhotosTitle")}</DialogTitle>
						<DialogDescription>{panel === "delete" ? ui("deleteHelp") : ui("removePhotosHelp")}</DialogDescription>
						<div className="flex flex-wrap justify-end gap-2">
							<Button
								variant="outline"
								disabled={busy}
								onClick={() => setPanel(panel === "delete" ? "contact" : "photos")}
							>
								{scanner("cancel")}
							</Button>
							<Button variant="destructive" disabled={busy} onClick={() => void act(panel)}>
								{panel === "delete" ? ui("deleteContact") : ui("removePhotos")}
							</Button>
						</div>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
