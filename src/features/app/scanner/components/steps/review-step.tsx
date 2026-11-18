"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ImagePlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveContact } from "@/features/app/contacts/actions/save-contact.action";
import { listTags } from "@/features/app/tags/actions/list-tags.action";
import { type ContactData, emptyContact } from "@/lib/types";
import { previewOf } from "../../capture-image";
import type { CardSide } from "../../card-photos";
import type { ScanDraft } from "../../scan-draft";

type ReviewValues = { contact: ContactData; tagIds: string[]; keep: boolean };
const fields = [
	["firstname", "firstname", "text"],
	["lastname", "lastname", "text"],
	["title", "title_field", "text"],
	["company", "company", "text"],
	["email", "email", "email"],
	["phone", "phone", "tel"],
	["website", "website", "url"],
	["address", "address", "text"],
] as const;

export function ReviewStep({
	row,
	progress,
	value,
	onChange,
	onSave,
	onBack,
	onReplace,
}: {
	row: ScanDraft;
	progress: ReactNode;
	value?: ReviewValues;
	onChange: (value: ReviewValues) => void;
	onSave: (id: number, animate: boolean) => void;
	onBack: () => void;
	onReplace: (side: CardSide) => void;
}) {
	const copy = useTranslations("scanner.cardtuck");
	const labels = useTranslations("scanner.review");
	const contacts = useTranslations("contacts.errors");
	const query = useQueryClient();
	const prefix = useId();
	const [side, setSide] = useState<CardSide>(row.front ? "front" : "back");
	const [saving, setSaving] = useState(false);
	const [failure, setFailure] = useState("");
	const saveButton = useRef<HTMLButtonElement>(null);
	const savePressedByPointer = useRef(false);

	useEffect(() => {
		if (failure && !saving && document.activeElement === document.body) saveButton.current?.focus();
	}, [failure, saving]);
	const draft = row.contact ?? emptyContact();
	const initial: ReviewValues = {
		contact: draft.name && !draft.firstname && !draft.lastname ? { ...draft, lastname: draft.name } : draft,
		tagIds: [],
		keep: false,
	};
	const current = value ?? initial;
	const { data: tags = [] } = useQuery({
		queryKey: ["tags"],
		queryFn: async () => (await listTags())?.data ?? [],
	});
	const photo = row[side];
	const failedSides = row.failedSides ?? [];
	const hasConflicts = !!row.conflicts && Object.keys(row.conflicts).length > 0;
	const reviewNotes = [failedSides.length > 0 && prefix + "unread-sides", hasConflicts && prefix + "conflicts"]
		.filter(Boolean)
		.join(" ");
	const edit = (key: keyof ContactData, value: string) =>
		onChange({ ...current, contact: { ...current.contact, [key]: value } });

	async function submit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const animate = savePressedByPointer.current;
		savePressedByPointer.current = false;
		if (saving) return;
		setFailure("");
		setSaving(true);
		const { firstname, lastname } = current.contact;
		try {
			const result = await saveContact({
				...current.contact,
				name: [firstname.trim(), lastname.trim()].filter(Boolean).join(" "),
				captureId: row.id,
				tagIds: current.tagIds,
				photos: current.keep
					? (["front", "back"] as const).flatMap((side) => {
							const image = row[side];
							return image ? [{ side, imageBase64: image.imageBase64 }] : [];
						})
					: [],
			});
			if (result?.data?.duplicate) {
				setFailure(contacts("contact_exists"));
			} else if (result?.data?.id) {
				await Promise.all([
					query.invalidateQueries({ queryKey: ["contacts"] }),
					query.invalidateQueries({ queryKey: ["contact-tags"] }),
				]);
				onSave(result.data.id, animate);
			} else {
				setFailure(result?.serverError ?? labels("save_error"));
			}
		} catch {
			setFailure(labels("save_error"));
		} finally {
			setSaving(false);
		}
	}

	return (
		<form className="space-y-4" onSubmit={submit}>
			<div className="ct-heading">
				<h1 data-scan-heading tabIndex={-1} aria-describedby={reviewNotes || undefined} className="ct-page-title">
					{photo ? copy("reviewTitle") : copy("manualTitle")}
				</h1>
				<p>{copy("reviewDescription")}</p>
			</div>
			{progress}
			{failedSides.length > 0 ? (
				<p
					id={prefix + "unread-sides"}
					className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950"
				>
					{copy("sideReadFailed", {
						sides: failedSides.map((item) => copy(item === "front" ? "front" : "backSide")).join(", "),
					})}
				</p>
			) : null}
			{hasConflicts ? (
				<p
					id={prefix + "conflicts"}
					className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950"
				>
					{copy("conflicts")}
				</p>
			) : null}
			<div className={photo ? "ct-review-grid" : "max-w-3xl"}>
				{photo && (
					<aside className="ct-surface ct-source">
						<h2>{copy("cardPhoto")}</h2>
						<div className="ct-source-photo">
							{/* The image is a local JPEG preview from the current draft. */}
							<img src={previewOf(photo)} alt={copy(side === "front" ? "frontPhoto" : "backPhoto")} />
						</div>
						<div className="flex flex-wrap items-center gap-1">
							{(["front", "back"] as const).map(
								(item) =>
									row[item] && (
										<Button
											key={item}
											type="button"
											size="sm"
											static
											variant={side === item ? "secondary" : "ghost"}
											className={side === item ? "min-h-11 bg-accent text-accent-foreground" : "min-h-11"}
											aria-label={copy(item === "front" ? "frontPhoto" : "backPhoto")}
											aria-pressed={side === item}
											onClick={() => setSide(item)}
										>
											{copy(item === "front" ? "front" : "backSide")}
										</Button>
									),
							)}
							<Button
								type="button"
								size="sm"
								variant="ghost"
								className="min-h-11"
								onClick={() => onReplace(side)}
								disabled={saving}
							>
								<ImagePlus />
								{copy("replacePhoto")}
							</Button>
							{!row.back && row.front && (
								<Button
									type="button"
									size="sm"
									variant="outline"
									className="min-h-11"
									onClick={() => onReplace("back")}
									disabled={saving}
								>
									{copy("uploadBack")}
								</Button>
							)}
						</div>
					</aside>
				)}
				<div className="ct-surface ct-contact-fields grid sm:grid-cols-2">
					<h2 className="sm:col-span-2">{copy("contactDetails")}</h2>
					{fields.map(([key, label, inputMode]) => {
						const backValue = row.conflicts?.[key];
						const backValueId = prefix + key + "-back";
						return (
							<div key={key} className="min-w-0 space-y-1">
								<label htmlFor={prefix + key} className="block text-sm font-semibold">
									{labels(label)}
								</label>
								<Input
									id={prefix + key}
									inputMode={inputMode}
									value={current.contact[key]}
									maxLength={500}
									aria-describedby={backValue ? backValueId : undefined}
									onChange={(event) => edit(key, event.target.value)}
									className="min-h-11 bg-card"
								/>
								{backValue && (
									<Button
										id={backValueId}
										type="button"
										variant="outline"
										size="sm"
										className="h-auto min-h-11 max-w-full whitespace-normal break-all py-2 text-left"
										onClick={() => edit(key, backValue)}
									>
										{copy("useBackValue", { value: backValue })}
									</Button>
								)}
							</div>
						);
					})}
				</div>
			</div>
			{tags.length > 0 && (
				<fieldset className="space-y-2">
					<legend className="text-sm font-semibold">{copy("tags")}</legend>
					<div className="flex flex-wrap gap-1.5">
						{tags.map((tag) => {
							const selected = current.tagIds.includes(tag.id);
							return (
								<Button
									key={tag.id}
									type="button"
									size="sm"
									variant={selected ? "secondary" : "outline"}
									aria-pressed={selected}
									onClick={() =>
										onChange({
											...current,
											tagIds: selected ? current.tagIds.filter((id) => id !== tag.id) : [...current.tagIds, tag.id],
										})
									}
								>
									{selected && <Check />}
									{tag.name}
								</Button>
							);
						})}
					</div>
				</fieldset>
			)}
			<p
				id={prefix + "save-error"}
				role="alert"
				aria-atomic="true"
				className={failure ? "text-destructive" : "sr-only"}
			>
				{failure}
			</p>
			<div className="ct-review-actions flex flex-wrap items-start justify-between gap-3">
				{photo && (
					<label className="flex min-h-11 cursor-pointer items-start gap-2 pt-1">
						<input
							type="checkbox"
							checked={current.keep}
							onChange={(event) => onChange({ ...current, keep: event.target.checked })}
							className="mt-0.5 size-4 accent-primary"
						/>
						<span>
							<span className="block text-sm font-semibold">{copy("keepPhotos")}</span>
							<span className="block text-xs text-muted-foreground">{copy("keepPhotosHelp")}</span>
						</span>
					</label>
				)}
				<div className="ml-auto flex flex-wrap gap-2">
					<Button type="button" variant="outline" className="min-h-11" disabled={saving} onClick={onBack}>
						{copy("back")}
					</Button>
					<Button
						ref={saveButton}
						type="submit"
						className="min-h-11"
						disabled={saving}
						onClick={(event) => {
							savePressedByPointer.current = event.detail > 0;
						}}
						aria-describedby={failure ? prefix + "save-error" : undefined}
					>
						<Check />
						{saving ? copy("saving") : copy("saveContact")}
					</Button>
				</div>
			</div>
		</form>
	);
}
