"use client";

import { Camera, Check, ContactRound, LoaderCircle, ScanLine, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { type ContactData, emptyContact } from "@/lib/types";
import { analyzeCard, analyzeCardPair } from "../actions/analyze-card.action";
import { type CaptureImage, prepareCardImage, previewOf } from "../capture-image";
import type { CardSide } from "../card-photos";
import { mergeCardSides } from "../merge-card-sides";
import type { ScanDraft } from "../scan-draft";
import { BatchPair } from "./batch-pair";
import { CameraCapture } from "./camera-capture";
import { ReviewStep } from "./steps/review-step";

type Screen = "start" | "upload" | "camera" | "front" | "pair" | "queue" | "review" | "complete";
type ReviewValue = { contact: ContactData; keep: boolean; tagIds: string[] };
type UploadTarget = { id: string; side: CardSide; replace?: boolean };
type CameraReceipt = { rowId: string; side: CardSide; animate: boolean };
const photoLimit = 24;

export function ScannerWizard({
	onViewContact,
	manualRequest,
	active,
	readCardPairsTogether,
}: {
	onViewContact: (id?: number) => void;
	manualRequest: number;
	active: boolean;
	readCardPairsTogether: boolean;
}) {
	const t = useTranslations("scanner.cardtuck");
	const [seenManual, setSeenManual] = useState(manualRequest);
	const [rows, setRows] = useState<ScanDraft[]>([]);
	const [screen, setScreen] = useState<Screen>("start");
	const [review, setReview] = useState<string>();
	const [values, setValues] = useState<Record<string, ReviewValue>>({});
	const [camera, setCamera] = useState<{ row: ScanDraft; side: CardSide }>();
	const [cameraReceipt, setCameraReceipt] = useState<CameraReceipt>();
	const [busy, setBusy] = useState(false);
	const [readingMessage, setReadingMessage] = useState("");
	const [warning, setWarning] = useState("");
	const [lastSaved, setLastSaved] = useState<number>();
	const [animateSaved, setAnimateSaved] = useState(false);
	const file = useRef<HTMLInputElement>(null);
	const target = useRef<UploadTarget | undefined>(undefined);
	const locked = useRef(false);
	const sequence = useRef(0);
	const scanner = useRef<HTMLDivElement>(null);
	const previousScreen = useRef(screen);

	useEffect(() => {
		const screenChanged = previousScreen.current !== screen;
		previousScreen.current = screen;
		if (!active || !screenChanged) return;

		const focus = document.activeElement;
		if (focus !== document.body && !scanner.current?.contains(focus)) return;

		const heading = scanner.current?.querySelector<HTMLElement>("[data-scan-heading]");
		heading?.focus({ preventScroll: true });
		heading?.scrollIntoView({ block: "nearest" });
	}, [active, screen]);

	if (manualRequest !== seenManual) {
		const row: ScanDraft = {
			id: globalThis.crypto.randomUUID(),
			order: rows.length,
			status: "ready",
			contact: emptyContact(),
		};
		setSeenManual(manualRequest);
		setRows([...rows, row]);
		setReview(row.id);
		setScreen("review");
	}

	const create = (front?: CaptureImage): ScanDraft => {
		sequence.current++;
		return { id: globalThis.crypto.randomUUID(), order: sequence.current, status: "pending", front };
	};
	const update = (id: string, change: Partial<ScanDraft>) =>
		setRows((current) => current.map((r) => (r.id === id ? { ...r, ...change } : r)));
	const main = review ? rows.find((r) => r.id === review) : undefined;
	const saved = rows.filter((r) => r.status === "saved").length;
	const skipped = rows.filter((r) => r.status === "skipped").length;
	const phase = screen === "review" || screen === "complete" ? 2 : screen === "queue" ? 1 : 0;
	const singleReadFailed = rows.length === 1 && rows[0].status === "failed";
	const queueMessage = busy ? readingMessage : singleReadFailed ? t("cantRead") : t("reviewBatch");
	const animateFront = cameraReceipt?.side === "front" && cameraReceipt.rowId === main?.id && cameraReceipt.animate;

	function settleCapture() {
		setCameraReceipt((receipt) => (receipt?.animate ? { ...receipt, animate: false } : receipt));
	}

	function openPicker(pick?: UploadTarget) {
		target.current = pick;
		if (file.current) {
			file.current.multiple = !pick;
			file.current.value = "";
			file.current.click();
		}
	}

	async function readCards(items: ScanDraft[], revealSingle = false) {
		if (!items.length || locked.current) return;
		locked.current = true;
		setBusy(true);
		setReadingMessage("");
		setWarning("");
		setScreen("queue");
		try {
			for (const [index, row] of items.entries()) {
				update(row.id, { status: "reading" });
				const found: Partial<Record<CardSide, ContactData>> = {};
				const sides = (["front", "back"] as const).filter((side) => row[side]);
				const announceReading = (progress: string) => {
					setReadingMessage(
						items.length === 1
							? progress
							: t("readingBatchSide", {
									card: index + 1,
									count: items.length,
									progress,
								}),
					);
				};
				const accept = (side: CardSide, contact?: ContactData) => {
					if (contact && Object.values(contact).some((value) => value.trim())) found[side] = contact;
				};

				if (readCardPairsTogether && row.front && row.back) {
					announceReading(t("readingBoth"));
					const response = await analyzeCardPair({
						front: row.front.imageBase64,
						back: row.back.imageBase64,
					}).catch(() => undefined);
					accept("front", response?.data?.front);
					accept("back", response?.data?.back);
				} else {
					for (const side of sides) {
						const image = row[side];
						if (!image) continue;
						announceReading(t(side === "front" ? "readingFront" : "readingBack"));
						const response = await analyzeCard({ imageBase64: image.imageBase64 }).catch(() => undefined);
						accept(side, response?.data);
					}
				}
				const failedSides = sides.filter((side) => !found[side]);
				const { contact, conflicts } = mergeCardSides(found.front, found.back);
				const ok = !!(found.front || found.back);
				update(row.id, { status: ok ? "ready" : "failed", contact, conflicts, failedSides });
				setValues((current) => {
					const old = current[row.id];
					if (!old) return current;
					const changed = { ...contact };
					for (const key of Object.keys(changed) as Array<keyof ContactData>) {
						if (old.contact[key] !== (row.contact?.[key] ?? "")) changed[key] = old.contact[key];
					}
					return { ...current, [row.id]: { ...old, contact: changed } };
				});
				if (ok && revealSingle && items.length === 1) {
					setCameraReceipt(undefined);
					setReview(row.id);
					setScreen("review");
				}
			}
		} finally {
			locked.current = false;
			setBusy(false);
		}
	}

	async function ingest(files: FileList | null) {
		const incoming = Array.from(files ?? []);
		if (!incoming.length || locked.current) return;
		const selection = target.current;
		const existing = rows.reduce((count, row) => count + Number(!!row.front) + Number(!!row.back), 0);
		const spare =
			photoLimit - existing + Number(!!(selection && rows.find((row) => row.id === selection.id)?.[selection.side]));
		if (incoming.length > spare || (selection && incoming.length !== 1)) {
			setWarning(t("photoLimit", { count: photoLimit }));
			return;
		}
		locked.current = true;
		setBusy(true);
		setWarning("");
		const prepared: CaptureImage[] = [];
		try {
			for (const item of incoming) {
				try {
					prepared.push(await prepareCardImage(item));
				} catch {
					setWarning(t("invalidImage"));
				}
			}
		} finally {
			locked.current = false;
			setBusy(false);
		}
		if (!prepared.length) return;
		if (selection) {
			const row = rows.find(({ id }) => id === selection.id);
			if (!row) return;
			const next = { ...row, [selection.side]: prepared[0], status: "pending" as const };
			update(row.id, next);
			if (selection.replace) await readCards([next], true);
			else setScreen("pair");
			return;
		}
		const additions = prepared.map(create);
		setRows((current) => [...current, ...additions]);
		setScreen("pair");
	}

	function openManual(row?: ScanDraft) {
		const next = { ...(row ?? create()), status: "ready" as const, contact: row?.contact ?? emptyContact() };
		if (row) update(row.id, next);
		else setRows((current) => [...current, next]);
		setCamera(undefined);
		setCameraReceipt(undefined);
		setReview(next.id);
		setScreen("review");
	}

	function openCamera(row = create(), side: CardSide = "front") {
		setWarning("");
		setCameraReceipt(undefined);
		setCamera({ row, side });
		setScreen("camera");
	}

	function captured(photo: CaptureImage, animate: boolean) {
		if (!camera) return;
		const next = { ...camera.row, [camera.side]: photo, status: "pending" as const };
		setRows((current) =>
			current.some((r) => r.id === next.id) ? current.map((r) => (r.id === next.id ? next : r)) : [...current, next],
		);
		setReview(next.id);
		setCamera(undefined);
		setCameraReceipt({ rowId: next.id, side: camera.side, animate });
		if (camera.side === "front") setScreen("front");
		else void readCards([next], true);
	}

	function backFromCamera() {
		setCamera(undefined);
		setScreen(camera?.row.front ? "front" : rows.some((row) => row.front) ? "pair" : "start");
	}

	function move(id: string, offset: number) {
		setRows((current) => {
			const from = current.findIndex((row) => row.id === id);
			const to = from + offset;
			if (from < 0 || to < 0 || to >= current.length) return current;
			const next = [...current];
			[next[from], next[to]] = [next[to], next[from]];
			return next;
		});
	}

	function pair(id: string, source: string) {
		setRows((current) => {
			const other = current.find((row) => row.id === source);
			if (!other?.front || other.back || id === source) return current;
			return current
				.filter((row) => row.id !== source)
				.map((row) => (row.id === id ? { ...row, back: other.front, status: "pending" } : row));
		});
	}

	function split(id: string) {
		const row = rows.find((r) => r.id === id);
		if (!row?.back) return;
		const separated = create(row.back);
		setRows((current) =>
			current.flatMap((r) => (r.id === id ? [{ ...r, back: undefined, status: "pending" as const }, separated] : [r])),
		);
	}

	function reset() {
		setRows([]);
		setValues({});
		setReview(undefined);
		setLastSaved(undefined);
		setCameraReceipt(undefined);
		setAnimateSaved(false);
		setWarning("");
		setScreen("start");
	}

	const progress = (
		<ol className="ct-steps flex flex-wrap text-muted-foreground" aria-label={t("scanProgress")}>
			{(["capture", "extract", "review"] as const).map((step, index) => (
				<li
					key={step}
					aria-current={phase === index ? "step" : undefined}
					className={`flex items-center gap-2 ${phase === index ? "font-semibold text-primary" : ""}`}
				>
					<span
						className={`grid size-6 place-items-center rounded-full text-xs font-semibold ${phase === index ? "bg-accent text-accent-foreground" : "bg-muted"}`}
					>
						{index + 1}
					</span>
					{t(step)}
				</li>
			))}
		</ol>
	);

	return (
		<div ref={scanner} className="space-y-4">
			<input
				ref={file}
				hidden
				type="file"
				accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
				aria-label={t("uploadImages")}
				onChange={(event) => void ingest(event.currentTarget.files)}
			/>
			<div role="status" aria-atomic="true" className="sr-only">
				{active && screen === "queue" ? queueMessage : ""}
			</div>

			{warning && (
				<p role="alert" className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950">
					{warning}
				</p>
			)}
			{screen === "start" && (
				<section className="ct-entry">
					<div className="ct-heading">
						<h1 data-scan-heading tabIndex={-1} className="ct-page-title">
							{t("scanTitle")}
						</h1>
						<p>{t("scanDescription")}</p>
					</div>
					<div className="ct-scan-choice">
						<div className="ct-camera-stage">
							<div className="ct-viewfinder" aria-hidden="true">
								<span />
								<span />
								<span />
								<span />
								<Camera size={32} strokeWidth={1.5} />
							</div>
							<Button className="ct-camera-cta min-h-11" onClick={() => openCamera()} disabled={busy}>
								<Camera />
								{t("useCamera")}
							</Button>
						</div>
						<div className="ct-surface ct-entry-options">
							<div className="ct-entry-option-intro">
								<h2>{t("useCardPhotos")}</h2>
								<p>{t("uploadHelp")}</p>
							</div>
							<Button
								className="min-h-11 w-full justify-center sm:w-fit"
								variant="outline"
								onClick={() => setScreen("upload")}
								disabled={busy}
							>
								<Upload />
								{t("uploadImages")}
							</Button>
							<div className="ct-entry-manual">
								<Button className="min-h-11 text-primary" variant="ghost" onClick={() => openManual()} disabled={busy}>
									<ContactRound />
									{t("manual")}
								</Button>
							</div>
						</div>
					</div>
				</section>
			)}
			{screen === "upload" && (
				<section className="space-y-4">
					<h1 data-scan-heading tabIndex={-1} className="ct-page-title">
						{t("uploadImages")}
					</h1>
					{/* biome-ignore lint/a11y/noStaticElementInteractions: The adjacent Choose images button is the keyboard alternative. */}
					<div
						className="flex flex-col items-start gap-4 rounded-xl border border-dashed bg-muted p-5 sm:flex-row sm:items-center"
						onDragOver={(event) => event.preventDefault()}
						onDrop={(event) => {
							event.preventDefault();
							target.current = undefined;
							void ingest(event.dataTransfer.files);
						}}
					>
						<span className="grid size-11 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
							<Upload />
						</span>
						<div className="min-w-0 flex-1">
							<p className="hidden font-semibold sm:block">{t("uploadDrop")}</p>
							<p className="text-sm text-muted-foreground">{t("uploadHelp")}</p>
						</div>
						<Button className="min-h-11" onClick={() => openPicker()} disabled={busy}>
							{t("chooseImages")}
						</Button>
					</div>
					<Button variant="ghost" onClick={() => setScreen("start")} disabled={busy}>
						{t("back")}
					</Button>
					<Button variant="ghost" onClick={() => openManual()} disabled={busy}>
						{t("manual")}
					</Button>
				</section>
			)}
			{screen === "camera" && camera && active && (
				<CameraCapture
					key={camera.side}
					side={camera.side}
					onCapture={captured}
					onClose={backFromCamera}
					onUpload={() => {
						backFromCamera();
						openPicker(camera.row.front ? { id: camera.row.id, side: camera.side } : undefined);
					}}
					onManual={() => openManual(camera.row.front ? camera.row : undefined)}
					onSkip={
						camera.side === "back"
							? () => {
									setCamera(undefined);
									void readCards([camera.row], true);
								}
							: undefined
					}
				/>
			)}
			{screen === "front" && main?.front && (
				<section className="mx-auto max-w-lg space-y-3">
					<h1 data-scan-heading tabIndex={-1} className="ct-page-title">
						{t("addBackTitle")}
					</h1>
					<p className="text-muted-foreground">{t("backDescription")}</p>
					<div className="space-y-3 rounded-xl border bg-card p-4">
						<div className="cardtuck-etch grid min-h-40 place-items-center rounded-xl p-4">
							<img
								src={previewOf(main.front)}
								alt={t("frontPhoto")}
								className={`cardtuck-captured-photo max-h-52 rounded object-contain ${animateFront ? "cardtuck-capture-settle" : ""}`}
								onAnimationEnd={settleCapture}
							/>
						</div>
						<div className="flex items-center justify-between">
							<span className="rounded-md bg-accent px-2 py-1 text-sm font-semibold">{t("frontCaptured")}</span>
							<Button variant="ghost" className="min-h-11" onClick={() => openCamera(main)}>
								{t("retakeFront")}
							</Button>
						</div>
						<Button className="min-h-11 w-full" onClick={() => openCamera(main, "back")}>
							<Camera />
							{t("captureBack")}
						</Button>
						<Button className="min-h-11 w-full" variant="ghost" onClick={() => void readCards([main], true)}>
							{t("skipBack")}
						</Button>
					</div>
				</section>
			)}
			{screen === "pair" && (
				<BatchPair
					rows={rows}
					pending={busy}
					onPick={() => openPicker()}
					onRead={() => {
						const pending = rows.filter((r) => r.front && r.status !== "saved" && r.status !== "skipped");
						void readCards(pending, pending.length === 1);
					}}
					onMove={move}
					onSort={(order) =>
						setRows((current) =>
							[...current].sort((a, b) =>
								order === "name"
									? (a.front?.name ?? "").localeCompare(b.front?.name ?? "") || a.order - b.order
									: a.order - b.order,
							),
						)
					}
					onPair={pair}
					onSplit={split}
					onBackPhoto={(id) => openPicker({ id, side: "back" })}
					onRemove={(id) => setRows((current) => current.filter((r) => r.id !== id))}
					onSwap={(id) =>
						setRows((current) =>
							current.map((r) => (r.id === id ? { ...r, front: r.back, back: r.front, status: "pending" } : r)),
						)
					}
				/>
			)}
			{screen === "queue" && (
				<section className="space-y-4">
					<h1 data-scan-heading tabIndex={-1} className="ct-page-title">
						{busy ? t("reading") : queueMessage}
					</h1>
					{progress}
					<p className="text-muted-foreground">
						{busy ? readingMessage || t("readingHelp") : singleReadFailed ? t("failedHelp") : t("reviewBatchHelp")}
					</p>
					<ul className="divide-y overflow-hidden rounded-xl border bg-card">
						{rows.map((row) => {
							const back = cameraReceipt?.side === "back" && cameraReceipt.rowId === row.id ? row.back : undefined;
							return (
								<li key={row.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
									{back ? (
										<div className="flex min-w-0 flex-[1_1_11rem] items-center gap-3">
											<img
												src={previewOf(back)}
												alt=""
												className={`cardtuck-captured-photo h-11 w-16 shrink-0 rounded bg-muted object-contain ${cameraReceipt?.animate ? "cardtuck-capture-settle" : ""}`}
												onAnimationEnd={settleCapture}
											/>
											<p className="text-sm font-semibold">{t("backCaptured")}</p>
										</div>
									) : (
										<div className="min-w-0 flex-1">
											<p className="truncate font-semibold">
												{row.contact?.name || row.contact?.company || row.front?.name || t("manualTitle")}
											</p>
											{row.contact?.name && row.contact.company && (
												<p className="text-sm text-muted-foreground">{row.contact.company}</p>
											)}
										</div>
									)}
									{!(back && row.status === "reading") && (
										<span
											className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold ${row.status === "failed" ? "bg-amber-100 text-amber-950" : row.status === "ready" ? "bg-accent text-accent-foreground" : "bg-muted"}`}
										>
											{row.status === "reading" && <LoaderCircle size={14} className="motion-safe:animate-spin" />}
											{t(row.status)}
										</span>
									)}
									{row.status === "ready" && (
										<Button
											variant="outline"
											disabled={busy}
											onClick={() => {
												setReview(row.id);
												setScreen("review");
											}}
										>
											{t("review")}
										</Button>
									)}
									{row.status === "failed" && !busy && (
										<div className="flex flex-wrap gap-1">
											<Button
												size="sm"
												variant="outline"
												onClick={() => openPicker({ id: row.id, side: row.failedSides?.[0] ?? "front", replace: true })}
											>
												{t("replacePhoto")}
											</Button>
											<Button size="sm" variant="ghost" onClick={() => void readCards([row], rows.length === 1)}>
												{t("retry")}
											</Button>
											<Button size="sm" variant="ghost" onClick={() => openManual(row)}>
												{t("manual")}
											</Button>
											<Button size="sm" variant="ghost" onClick={() => update(row.id, { status: "skipped" })}>
												{t("skipCard")}
											</Button>
										</div>
									)}
									{row.status === "skipped" && !busy && (
										<Button size="sm" variant="outline" onClick={() => update(row.id, { status: "failed" })}>
											{t("restoreCard")}
										</Button>
									)}
								</li>
							);
						})}
					</ul>
					<div className="flex flex-wrap justify-between gap-2">
						<Button
							variant="ghost"
							disabled={busy}
							onClick={() => setScreen(rows.some((r) => r.front && r.status !== "saved") ? "pair" : "start")}
						>
							{t("backToUploads")}
						</Button>
						{rows.every((row) => row.status === "saved" || row.status === "skipped") && (
							<Button
								onClick={(event) => {
									setAnimateSaved(event.detail > 0);
									setScreen("complete");
								}}
							>
								<Check />
								{t("finish")}
							</Button>
						)}
					</div>
				</section>
			)}
			{screen === "review" && main && (
				<ReviewStep
					key={main.id}
					progress={progress}
					row={main}
					value={values[main.id]}
					onChange={(value) => setValues((current) => ({ ...current, [main.id]: value }))}
					onBack={() => {
						if (!main.front && rows.length === 1) {
							reset();
						} else {
							setScreen("queue");
						}
					}}
					onReplace={(side) => openPicker({ id: main.id, side, replace: true })}
					onSave={(id, animate) => {
						update(main.id, { status: "saved", savedId: id });
						setLastSaved(id);
						setAnimateSaved(animate);
						setScreen(
							rows.length === 1 ||
								rows.every((row) => row.id === main.id || row.status === "saved" || row.status === "skipped")
								? "complete"
								: "queue",
						);
					}}
				/>
			)}
			{screen === "complete" && (
				<section className="ct-surface mx-auto max-w-lg space-y-4 p-5 sm:p-7">
					{saved > 0 && (
						<span
							aria-hidden="true"
							className={`grid size-12 place-items-center rounded-lg bg-accent text-accent-foreground ${animateSaved ? "cardtuck-save-settle" : ""}`}
							onAnimationEnd={() => setAnimateSaved(false)}
						>
							<Check />
						</span>
					)}
					<h1 data-scan-heading tabIndex={-1} className="ct-page-title">
						{rows.length === 1 && saved === 1 ? t("savedTitle") : t("savedCount", { count: saved })}
					</h1>
					{skipped > 0 && <p className="text-muted-foreground">{t("skippedCount", { count: skipped })}</p>}
					<Button className="min-h-11 w-full" onClick={() => onViewContact(saved === 1 ? lastSaved : undefined)}>
						<ContactRound />
						{saved === 1 ? t("viewContact") : t("viewContacts")}
					</Button>
					<Button className="min-h-11 w-full" variant="outline" onClick={reset}>
						<ScanLine />
						{t("scanAnother")}
					</Button>
					{skipped > 0 && (
						<Button className="w-full" variant="ghost" onClick={() => setScreen("queue")}>
							{t("returnSkipped")}
						</Button>
					)}
				</section>
			)}
		</div>
	);
}
