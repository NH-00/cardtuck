"use client";

import { ArrowDown, ArrowUp, Plus, ScanLine, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { type CaptureImage, previewOf } from "../capture-image";
import type { ScanDraft } from "../scan-draft";

export function BatchPair({
	rows,
	pending,
	onPick,
	onRead,
	onMove,
	onSort,
	onPair,
	onSplit,
	onBackPhoto,
	onRemove,
	onSwap,
}: {
	rows: ScanDraft[];
	pending: boolean;
	onPick: () => void;
	onRead: () => void;
	onMove: (id: string, offset: number) => void;
	onSort: (order: "upload" | "name") => void;
	onPair: (target: string, source: string) => void;
	onSplit: (id: string) => void;
	onBackPhoto: (id: string) => void;
	onRemove: (id: string) => void;
	onSwap: (id: string) => void;
}) {
	const t = useTranslations("scanner.cardtuck");
	const [preview, setPreview] = useState<CaptureImage>();
	const [order, setOrder] = useState("upload");
	const editable = rows.filter((row) => row.status !== "saved" && row.status !== "skipped");

	function file(image: CaptureImage | undefined, label: string) {
		if (!image) return <span className="text-sm text-muted-foreground">{label}</span>;
		return (
			<button
				type="button"
				className="flex min-w-0 items-center gap-3 rounded-md text-left focus-visible:outline-2 focus-visible:outline-ring"
				onClick={() => setPreview(image)}
			>
				{/* Local, JPEG-only data URL generated from uploads or the camera. */}
				<img src={previewOf(image)} alt="" className="h-9 w-13 shrink-0 rounded border bg-muted object-contain" />
				<span className="min-w-0">
					<span className="block truncate text-sm font-semibold">{image.name}</span>
					<span className="block text-xs text-muted-foreground">{label}</span>
				</span>
			</button>
		);
	}

	return (
		<section className="space-y-4">
			<h1 data-scan-heading tabIndex={-1} className="ct-page-title">
				{t("pairTitle")}
			</h1>
			<p className="text-muted-foreground">{t("pairDescription")}</p>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<p className="text-sm font-semibold text-muted-foreground">
					{t("counts", {
						cards: editable.length,
						photos: editable.reduce((total, row) => total + Number(!!row.front) + Number(!!row.back), 0),
					})}
				</p>
				<select
					aria-label={t("order")}
					value={order}
					disabled={pending}
					onChange={(event) => {
						const next = event.target.value;
						setOrder(next);
						if (next === "upload" || next === "name") onSort(next);
					}}
					className="min-h-11 rounded-lg border bg-card px-3 text-sm font-semibold"
				>
					<option value="upload">{t("uploadOrder")}</option>
					<option value="name">{t("filenameOrder")}</option>
					<option value="custom" disabled>
						{t("customOrder")}
					</option>
				</select>
			</div>
			<ol className="ct-surface divide-y overflow-hidden">
				{editable.map((row, index) => {
					const candidates = editable.filter((other) => other.id !== row.id && other.front && !other.back);
					return (
						<li key={row.id} className="space-y-3 px-3 py-3 sm:px-4">
							<div className="grid gap-2 sm:grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center">
								<span className="text-sm font-bold text-primary">{t("cardNumber", { number: index + 1 })}</span>
								{file(row.front, t("front"))}
								{file(row.back, row.back ? t("backSide") : t("frontOnly"))}
								<div className="flex flex-wrap gap-1">
									<Button
										variant="outline"
										size="icon"
										aria-label={t("moveUp", { number: index + 1 })}
										disabled={pending || index === 0}
										onClick={() => {
											onMove(row.id, -1);
											setOrder("custom");
										}}
									>
										<ArrowUp />
									</Button>
									<Button
										variant="outline"
										size="icon"
										aria-label={t("moveDown", { number: index + 1 })}
										disabled={pending || index === editable.length - 1}
										onClick={() => {
											onMove(row.id, 1);
											setOrder("custom");
										}}
									>
										<ArrowDown />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										aria-label={t("removeCard", { number: index + 1 })}
										disabled={pending}
										onClick={() => onRemove(row.id)}
									>
										<X />
									</Button>
								</div>
							</div>
							<div className="flex flex-wrap items-center gap-2 sm:pl-14">
								{row.back ? (
									<>
										<Button size="sm" variant="ghost" onClick={() => onSwap(row.id)} disabled={pending}>
											{t("swapSides")}
										</Button>
										<Button size="sm" variant="ghost" onClick={() => onSplit(row.id)} disabled={pending}>
											{t("unpair")}
										</Button>
									</>
								) : candidates.length ? (
									<select
										className="min-h-9 max-w-full rounded-md border bg-card px-2 text-sm"
										aria-label={t("pairFromUploads", { number: index + 1 })}
										value=""
										disabled={pending}
										onChange={(event) => {
											if (event.target.value) onPair(row.id, event.target.value);
										}}
									>
										<option value="">{t("chooseBack")}</option>
										{candidates.map((candidate) => (
											<option key={candidate.id} value={candidate.id}>
												{candidate.front?.name}
											</option>
										))}
									</select>
								) : null}
								<Button size="sm" variant="outline" onClick={() => onBackPhoto(row.id)} disabled={pending}>
									{row.back ? t("replaceBack") : t("uploadBack")}
								</Button>
							</div>
						</li>
					);
				})}
			</ol>
			<div className="flex flex-wrap justify-between gap-2">
				<Button variant="outline" onClick={onPick} disabled={pending}>
					<Plus />
					{t("addImages")}
				</Button>
				<Button disabled={!editable.length || pending} onClick={onRead}>
					<ScanLine />
					{t("readCount", { count: editable.length })}
				</Button>
			</div>
			<Dialog
				open={!!preview}
				onOpenChange={(open) => {
					if (!open) setPreview(undefined);
				}}
			>
				<DialogContent>
					<DialogTitle>{preview?.name}</DialogTitle>
					{preview && (
						<img src={previewOf(preview)} alt={preview.name} className="max-h-[65dvh] w-full object-contain" />
					)}
				</DialogContent>
			</Dialog>
		</section>
	);
}
