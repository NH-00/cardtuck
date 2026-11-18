"use server";

import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { env } from "@/env";
import { ActionError, anyAuthenticatedAction } from "@/lib/actions";
import { parseCardImage } from "@/lib/vision";
import { cardPhotoBase64, readCardJpeg } from "../card-photos";

async function readPhoto(imageBase64: string) {
	const t = await getTranslations("scanner.cardtuck");
	if (!readCardJpeg(imageBase64)) throw new ActionError(t("invalidImage"));
	try {
		return await parseCardImage(imageBase64);
	} catch {
		throw new ActionError(t("readFailed"));
	}
}

export const analyzeCard = anyAuthenticatedAction
	.inputSchema(z.object({ imageBase64: cardPhotoBase64 }))
	.action(({ parsedInput: { imageBase64 } }) => readPhoto(imageBase64));

function readSide(imageBase64?: string) {
	return imageBase64 ? readPhoto(imageBase64).catch(() => undefined) : undefined;
}

// Validate each side independently so a bad image doesn't discard the other result.
const optionalPhoto = cardPhotoBase64.optional().catch(undefined);

export const analyzeCardPair = anyAuthenticatedAction
	.inputSchema(z.object({ front: optionalPhoto, back: optionalPhoto }))
	.action(async ({ parsedInput: { front, back } }) => {
		if (env.VISION_PROVIDER !== "openai") {
			return { front: await readSide(front), back: await readSide(back) };
		}
		const [frontResult, backResult] = await Promise.all([readSide(front), readSide(back)]);
		return { front: frontResult, back: backResult };
	});
