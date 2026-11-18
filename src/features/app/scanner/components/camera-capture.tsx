"use client";

import { Camera, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { type CaptureImage, encodeCard } from "../capture-image";
import type { CardSide } from "../card-photos";

export function CameraCapture({
	side,
	onCapture,
	onClose,
	onUpload,
	onManual,
	onSkip,
}: {
	side: CardSide;
	onCapture: (image: CaptureImage, animate: boolean) => void;
	onClose: () => void;
	onUpload: () => void;
	onManual: () => void;
	onSkip?: () => void;
}) {
	const t = useTranslations("scanner.cardtuck");
	const videoRef = useRef<HTMLVideoElement>(null);
	const [attempt, setAttempt] = useState(0);
	const [state, setState] = useState<"starting" | "ready" | "denied">("starting");
	const [captureError, setCaptureError] = useState(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies: Retry explicitly starts a fresh camera session.
	useEffect(() => {
		let live = true;
		let stream: MediaStream | undefined;
		const video = videoRef.current;
		async function start() {
			try {
				if (!navigator.mediaDevices?.getUserMedia || !video) throw new Error();
				stream = await navigator.mediaDevices.getUserMedia({
					video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
					audio: false,
				});
				if (!live) {
					stream.getTracks().forEach((track) => {
						track.stop();
					});
					return;
				}
				video.srcObject = stream;
				await video.play();
				if (live) setState("ready");
			} catch {
				stream?.getTracks().forEach((track) => {
					track.stop();
				});
				if (live) setState("denied");
			}
		}
		void start();
		return () => {
			live = false;
			stream?.getTracks().forEach((track) => {
				track.stop();
			});
			if (video) video.srcObject = null;
		};
	}, [attempt]);

	function capture(event: MouseEvent<HTMLButtonElement>) {
		const video = videoRef.current;
		if (!video || !video.videoWidth || !video.videoHeight) return;
		try {
			onCapture(encodeCard(video, video.videoWidth, video.videoHeight, `${side}.jpg`), event.detail > 0);
		} catch {
			setCaptureError(true);
		}
	}

	return (
		<section className="mx-auto max-w-lg space-y-4 rounded-xl border bg-card p-4" aria-label={t("useCamera")}>
			<div className="flex items-center justify-between">
				<Button variant="ghost" size="icon" className="size-11" aria-label={t("back")} onClick={onClose}>
					<X />
				</Button>
				<h1
					data-scan-heading
					tabIndex={-1}
					className="scroll-mt-32 rounded-md bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground sm:scroll-mt-20"
				>
					{side === "front" ? t("frontStep") : t("backStep")}
				</h1>
			</div>
			<div hidden={state === "denied"} className="cardtuck-etch relative aspect-[8/5] overflow-hidden rounded-lg">
				<video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-contain" />
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-[12%] rounded-lg border-2 border-dashed border-accent"
				/>
			</div>
			<p role="status" className={state === "denied" ? "sr-only" : "text-center text-sm text-muted-foreground"}>
				{state === "denied" ? t("cameraOff") : state === "starting" ? t("cameraStarting") : t("cameraFrame")}
			</p>
			{state === "denied" ? (
				<>
					<h2 className="text-2xl font-semibold">{t("cameraOff")}</h2>
					<p className="text-muted-foreground">{t("cameraHelp")}</p>
					<Button
						className="w-full"
						onClick={() => {
							setState("starting");
							setAttempt((value) => value + 1);
						}}
					>
						{t("tryCamera")}
					</Button>
					<Button className="w-full" variant="outline" onClick={onUpload}>
						{t("uploadImages")}
					</Button>
					<Button className="w-full" variant="ghost" onClick={onManual}>
						{t("manual")}
					</Button>
				</>
			) : (
				<>
					{captureError && (
						<p role="alert" className="text-destructive">
							{t("invalidImage")}
						</p>
					)}
					<div className="flex justify-center">
						<Button size="lg" disabled={state !== "ready"} onClick={capture}>
							<Camera />
							{t("capturePhoto")}
						</Button>
					</div>
					<Button className="min-h-11 w-full" variant="ghost" onClick={onSkip ?? onUpload}>
						{onSkip ? t("skipBack") : t("uploadImages")}
					</Button>
				</>
			)}
		</section>
	);
}
