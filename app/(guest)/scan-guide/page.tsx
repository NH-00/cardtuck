import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import copy from "../site-copy.json";
import styles from "../website.module.css";
import { ReadingPage } from "../website-chrome";

export const metadata: Metadata = { title: copy.guideTitle, description: copy.guideIntro };

export default function ScanGuidePage() {
	return (
		<ReadingPage path="/scan-guide" title={copy.guideTitle} intro={copy.guideIntro} links={copy.guide}>
			{copy.guide.map((step, index) => (
				<section className={styles.readingSection} id={step.id} key={step.id}>
					<h2>
						<span className={styles.guideNumber} aria-hidden>
							{index + 1}
						</span>{" "}
						{step.title}
					</h2>
					<p>{step.copy}</p>
					{step.id === "export" && (
						<Link href="/compatibility" className={styles.textLink}>
							See instructions for your address book <ArrowRight size={16} aria-hidden />
						</Link>
					)}
				</section>
			))}
		</ReadingPage>
	);
}
