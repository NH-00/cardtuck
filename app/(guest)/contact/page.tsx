import { ArrowRight, Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import styles from "../website.module.css";
import { SiteFrame } from "../website-chrome";

export const metadata: Metadata = {
	title: "Contact CardTuck",
	description: "Find help with scanning, importing contacts, signing in, and card photo privacy.",
};

const topics = [
	{
		title: "Scan or review a card",
		description: "Get a readable photo, pair both sides, and check the extracted fields.",
		href: "/scan-guide",
		link: "Open the scan guide",
	},
	{
		title: "Import a contact",
		description: "Find vCard instructions for Apple Contacts and Google Contacts.",
		href: "/compatibility",
		link: "See import instructions",
	},
	{
		title: "Manage card photos",
		description: "See where images go and how to remove a photo you kept.",
		href: "/photo-privacy",
		link: "Read about card photos",
	},
];

export default function ContactPage() {
	const address = process.env.CARDTUCK_SUPPORT_EMAIL?.trim();
	const email = address && /^[a-z0-9._+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(address) ? address : undefined;

	return (
		<SiteFrame active="/contact">
			<header className={styles.readingHeader}>
				<div className={styles.rail}>
					<h1 className={styles.display}>Contact CardTuck</h1>
					<p>Get help with a scan, your account, or a privacy question.</p>
				</div>
			</header>
			<div className={`${styles.rail} ${styles.contactLayout}`}>
				<section className={styles.contactSupport} aria-labelledby="support-title">
					<h2 className={styles.display} id="support-title">
						Email support
					</h2>
					{email ? (
						<>
							<p>
								Tell us what you were trying to do and what happened. Leave contact details and card photos out of the
								message unless needed.
							</p>
							<a className={`${styles.action} ${styles.primary}`} href={`mailto:${email}`}>
								<Mail size={17} aria-hidden /> {email}
							</a>
						</>
					) : (
						<p>Email support is being set up. The guides below cover scanning, imports, and photo settings.</p>
					)}
				</section>
				<section className={styles.contactTopics} aria-label="Help guides">
					{topics.map((topic) => (
						<div key={topic.href}>
							<h2>{topic.title}</h2>
							<p>{topic.description}</p>
							<Link className={styles.textLink} href={topic.href}>
								{topic.link} <ArrowRight size={16} aria-hidden />
							</Link>
						</div>
					))}
				</section>
			</div>
		</SiteFrame>
	);
}
