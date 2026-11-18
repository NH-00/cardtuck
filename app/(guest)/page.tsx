import { ArrowDown, ArrowRight, Minus, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { BatchArtwork, CardToContactArtwork, PhotoOptionArtwork, ReviewArtwork } from "./card-illustration";
import { CardWorkflow } from "./card-workflow";
import copy from "./site-copy.json";
import styles from "./website.module.css";
import { SiteFrame } from "./website-chrome";

const title = "CardTuck | Business card scanner";
const description =
	"Scan business cards, review what CardTuck reads, and export the details to Apple Contacts or Google Contacts via vCard.";

export const metadata: Metadata = {
	title: { absolute: title },
	description,
	openGraph: { type: "website", title, description, siteName: "CardTuck" },
};

export default function HomePage() {
	return (
		<SiteFrame>
			<section className={styles.hero} aria-labelledby="hero-title">
				<div className={`${styles.rail} ${styles.heroBody}`}>
					<div className={styles.heroIntro}>
						<h1 className={styles.display} id="hero-title">
							Turn a quick hello <span>into a follow-up.</span>
						</h1>
						<div>
							<p className={styles.heroCopy}>
								Scan a business card, check the details, and save the contact while the conversation is still fresh.
							</p>
							<div className={styles.heroActions}>
								<Link className={`${styles.action} ${styles.light}`} href="/portal">
									Open CardTuck <ArrowRight size={17} aria-hidden />
								</Link>
								<a className={styles.textLink} href="#how-it-works">
									Try a sample <ArrowDown size={16} aria-hidden />
								</a>
							</div>
						</div>
					</div>
					<CardToContactArtwork />
				</div>
			</section>

			<section className={styles.compatibility} aria-labelledby="compatibility-title">
				<div className={`${styles.rail} ${styles.compatibilityRail}`}>
					<div>
						<h2 id="compatibility-title">Works with your contacts app</h2>
						<p>Export a vCard (.vcf), then import it into your address book.</p>
					</div>
					<div className={styles.destinations}>
						<Link href="/compatibility#apple">
							Apple Contacts <span>iPhone and Mac</span>
						</Link>
						<Link href="/compatibility#google">
							Google Contacts <span>Web and Android</span>
						</Link>
					</div>
					<Link className={styles.textLink} href="/compatibility">
						Import guide <ArrowRight size={16} aria-hidden />
					</Link>
				</div>
			</section>

			<section className={styles.workflow} id="how-it-works" aria-labelledby="workflow-title">
				<div className={styles.rail}>
					<div className={styles.sectionIntro}>
						<h2 className={styles.display} id="workflow-title">
							{copy.demoTitle}
						</h2>
						<p>{copy.demoCopy}</p>
					</div>
					<CardWorkflow />
				</div>
			</section>

			<div className={`${styles.rail} ${styles.features}`}>
				<section className={styles.feature} aria-labelledby="review-title">
					<div className={styles.featureCopy}>
						<h2 className={styles.display} id="review-title">
							{copy.features.review.title}
						</h2>
						<p>{copy.features.review.description}</p>
					</div>
					<ReviewArtwork />
				</section>

				<section className={styles.feature} aria-labelledby="batch-title">
					<div className={styles.featureCopy}>
						<h2 className={styles.display} id="batch-title">
							{copy.features.batch.title}
						</h2>
						<div>
							<p>{copy.features.batch.description}</p>
							<Link href="/scan-guide#pair" className={styles.textLink}>
								See how pairing works <ArrowRight size={16} aria-hidden />
							</Link>
						</div>
					</div>
					<BatchArtwork />
				</section>
			</div>

			<section className={styles.privacy} aria-labelledby="privacy-title">
				<div className={`${styles.rail} ${styles.privacyRail}`}>
					<div>
						<h2 className={styles.display} id="privacy-title">
							You choose what to keep.
						</h2>
						<p>
							CardTuck saves the contact details. The original photo stays off the contact unless you choose to keep it.
							You can remove an attached photo later.
						</p>
						<Link href="/photo-privacy" className={styles.textLink}>
							What happens to card photos <ArrowRight size={16} aria-hidden />
						</Link>
					</div>
					<PhotoOptionArtwork />
				</div>
			</section>

			<section className={`${styles.rail} ${styles.faqRail}`} aria-labelledby="faq-title">
				<h2 className={styles.display} id="faq-title">
					Good to know
				</h2>
				<div className={styles.questions}>
					{copy.questions.map(({ question, answer }) => (
						<details key={question}>
							<summary>
								{question}
								<Plus className={styles.faqPlus} size={18} aria-hidden />
								<Minus className={styles.faqMinus} size={18} aria-hidden />
							</summary>
							<p>{answer}</p>
						</details>
					))}
				</div>
			</section>
		</SiteFrame>
	);
}
