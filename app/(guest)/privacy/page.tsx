import type { Metadata } from "next";
import Link from "next/link";
import styles from "../website.module.css";
import { ReadingPage } from "../website-chrome";

const title = "Privacy policy";
const intro = "How CardTuck handles sign-in information, business cards, and saved contacts.";
const sections = [
	{ id: "account", title: "Account and sign-in" },
	{ id: "contacts", title: "Cards and contacts" },
	{ id: "services", title: "Services that process data" },
	{ id: "retention", title: "Keeping and removing data" },
	{ id: "requests", title: "Privacy questions" },
];

export const metadata: Metadata = {
	title,
	description: intro,
	robots: { index: false, follow: true },
};

export default function PrivacyPage() {
	return (
		<ReadingPage path="/privacy" title={title} intro={intro} links={sections}>
			<aside className={styles.readingCallout}>
				<div>
					<strong>Draft for review</strong>
					<p>
						This draft describes the current app. The operator's details, production providers, and retention terms are
						pending confirmation.
					</p>
				</div>
			</aside>
			<section id="account" className={styles.readingSection}>
				<h2>Account and sign-in</h2>
				<p>
					CardTuck uses your email address to send a sign-in link. After you sign in, a session cookie keeps you signed
					in. The sign-in link expires after 15 minutes.
				</p>
			</section>
			<section id="contacts" className={styles.readingSection}>
				<h2>Cards and contacts</h2>
				<p>
					When you save a contact, CardTuck stores the contact details you entered or reviewed and any tags you
					assigned. You can choose whether to save the original card images with that contact. That option is off by
					default.
				</p>
				<p>
					The website’s sample uses fictional details. Edits stay in the page, and the vCard downloads from your
					browser.
				</p>
			</section>
			<section id="services" className={styles.readingSection}>
				<h2>Services that process data</h2>
				<p>
					The email delivery service receives the address you enter to deliver your sign-in link. When you ask CardTuck
					to read a photo, it sends the image to the card-reading service configured for that installation. If you
					choose to sync a contact over CardDAV, CardTuck sends the contact details to the address book you select.
				</p>
			</section>
			<section id="retention" className={styles.readingSection}>
				<h2>Keeping and removing data</h2>
				<p>
					CardTuck keeps saved contacts in its database until they are removed. You can remove an attached photo while
					keeping the contact, or delete the contact and its attached photos. This implementation has no automatic
					expiry for saved contacts.
				</p>
				<Link href="/photo-privacy">Read how to remove a card photo</Link>
			</section>
			<section id="requests" className={styles.readingSection}>
				<h2>Privacy questions</h2>
				<p>
					You can export saved details as a vCard and manage saved contacts or attached photos in the app. For other
					questions or requests, see the Contact page for available support options.
				</p>
				<Link href="/contact">Contact CardTuck</Link>
			</section>
		</ReadingPage>
	);
}
