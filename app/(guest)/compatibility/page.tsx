import { Download, HardDriveDownload } from "lucide-react";
import type { Metadata } from "next";
import styles from "../website.module.css";
import { ReadingPage } from "../website-chrome";

const title = "Address book compatibility";
const intro =
	"Keep the contacts app you already use. CardTuck exports a vCard (.vcf) you can import into Apple Contacts or Google Contacts.";
const links = [
	{ id: "apple", title: "Apple Contacts" },
	{ id: "google", title: "Google Contacts" },
	{ id: "carddav", title: "CardDAV address books" },
];

export const metadata: Metadata = { title, description: intro };

export default function CompatibilityPage() {
	return (
		<ReadingPage path="/compatibility" title={title} intro={intro} links={links}>
			<div className={styles.readingCallout}>
				<HardDriveDownload size={24} aria-hidden />
				<div>
					<p>Try an import with a fictional contact before you scan your own card.</p>
					<a href="/sample-contact.vcf" className={styles.textLink} download>
						Download a sample vCard <Download size={16} aria-hidden />
					</a>
				</div>
			</div>
			<section id="apple" className={styles.readingSection}>
				<h2>Apple Contacts</h2>
				<p>
					Open <strong>Contacts</strong> in CardTuck, select the person, and choose <strong>Download vCard</strong>. The
					file contains that person’s details. Repeat for each person you want to add.
				</p>
				<h3>On iPhone</h3>
				<p>
					Tap the downloaded .vcf as a Mail or Messages attachment on your iPhone. Review the details and add the
					contact when prompted.
				</p>
				<a href="https://support.apple.com/en-gb/guide/iphone/iph356499f31/ios">Apple’s guide for iPhone</a>
				<h3>On Mac</h3>
				<p>
					Double-click the downloaded vCard, or open Contacts and choose <strong>File → Import</strong>. Select the file
					and add the contact.
				</p>
				<a href="https://support.apple.com/guide/contacts/import-contacts-adrbk1457/mac">Apple’s guide for Mac</a>
				<h3>In iCloud Contacts</h3>
				<p>
					On a tablet or computer, open <a href="https://www.icloud.com/contacts/">iCloud Contacts</a>. Choose{" "}
					<strong>Add → Import Contact</strong> and select the .vcf file. With iCloud Contacts enabled on your devices,
					the entry syncs through your Apple Account.
				</p>
				<a href="https://support.apple.com/en-lk/guide/icloud/mmfba748b2/icloud">Apple’s guide for iCloud</a>
			</section>
			<section id="google" className={styles.readingSection}>
				<h2>Google Contacts</h2>
				<h3>On the web</h3>
				<p>
					Open <a href="https://contacts.google.com/">Google Contacts</a>. Choose <strong>Import</strong>, select your
					downloaded .vcf file, then import it.
				</p>
				<a href="https://support.google.com/contacts/answer/15147365?co=GENIE.Platform%3DDesktop&hl=en">
					Google’s guide for the web
				</a>
				<h3>On Android</h3>
				<p>
					Open Google Contacts and use <strong>Import from file</strong> under Organize. Choose the Google account where
					you want the contact, then select your .vcf file.
				</p>
				<a href="https://support.google.com/contacts/answer/15147365?co=GENIE.Platform%3DAndroid&hl=en">
					Google’s guide for Android
				</a>
			</section>
			<section id="carddav" className={styles.readingSection}>
				<h2>CardDAV address books</h2>
				<p>
					If your address book provider supports CardDAV, open a saved contact and choose{" "}
					<strong>Set up address books</strong>. Once connected, choose <strong>Sync contact</strong> and select the
					destination. Your operator needs to approve the server first. For Apple Contacts, use the vCard import steps
					above.
				</p>
			</section>
		</ReadingPage>
	);
}
