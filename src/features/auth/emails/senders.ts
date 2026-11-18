import { getLocale, getTranslations } from "next-intl/server";
import MagicLinkEmail from "@/features/auth/emails/templates/magic-link.email";
import { SIGN_IN_LINK_MINUTES } from "@/lib/auth/magic-link-policy";
import { sendEmail } from "@/lib/email";

export const sendMagicLinkEmail = async (to: string, { name, magicLink }: { name: string; magicLink: string }) => {
	const [tMagicLink, tEmailLayout, locale] = await Promise.all([
		getTranslations("auth.emails.magic-link"),
		getTranslations("emails.layout"),
		getLocale(),
	]);

	return sendEmail({
		to,
		subject: tMagicLink("subject"),
		content: MagicLinkEmail({
			locale,
			name,
			magicLink,
			messages: {
				preview: tMagicLink("preview"),
				heading: tMagicLink("heading"),
				greeting: tMagicLink("greeting"),
				waitingConfirmation: tMagicLink("waitingConfirmation", { minutes: SIGN_IN_LINK_MINUTES }),
				buttonLabel: tMagicLink("buttonLabel"),
				fallbackLink: tMagicLink("fallbackLink"),
				closing: tMagicLink("closing"),
				teamPrefix: tMagicLink("teamPrefix"),
			},
			layoutMessages: {
				copyright: tEmailLayout("copyright", {
					year: new Date().getFullYear(),
				}),
			},
		}),
	});
};
