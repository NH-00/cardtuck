import type { Metadata } from "next";
import styles from "../website.module.css";
import { ReadingPage } from "../website-chrome";

const title = "How CardTuck handles card photos";
const intro =
	"You decide whether to attach the original card photo to a contact. Here’s what happens when you scan, save, or export.";
const links = [
	{ id: "scan", title: "When you scan" },
	{ id: "save", title: "When you save" },
	{ id: "remove", title: "Removing a photo" },
	{ id: "export", title: "When you export" },
];

export const metadata: Metadata = { title, description: intro };

export default function PhotoPrivacyPage() {
	return (
		<ReadingPage path="/photo-privacy" title={title} intro={intro} links={links}>
			<section id="scan" className={styles.readingSection}>
				<h2>When you scan</h2>
				<p>
					CardTuck sends the images you ask it to read to its configured card-reading provider so it can extract the
					contact details. You can also choose <strong>Enter contact manually</strong> if you want to create a contact
					without sending a photo for extraction.
				</p>
			</section>
			<section id="save" className={styles.readingSection}>
				<h2>When you save</h2>
				<p>
					The details you review are saved to the contact. <strong>Keep card photos with this contact</strong> is off by
					default. Turn it on at Review if you want CardTuck to keep the images with the contact.
				</p>
			</section>
			<section id="remove" className={styles.readingSection}>
				<h2>Removing a photo</h2>
				<p>
					Open the contact, choose <strong>View photos</strong>, then <strong>Remove card photos</strong>. The contact
					details remain in CardTuck.
				</p>
			</section>
			<section id="export" className={styles.readingSection}>
				<h2>When you export</h2>
				<p>
					The vCard contains contact details and any assigned tags. CardTuck’s vCard export leaves out the original card
					images.
				</p>
			</section>
		</ReadingPage>
	);
}
