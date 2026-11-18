import { ArrowRight } from "lucide-react";
import Image from "next/image";
import styles from "./website.module.css";

const imagePath = "/assets/website";

export function CardToContactArtwork() {
	return (
		<figure className={styles.cardToContact}>
			<div className={styles.heroPhoto}>
				<Image
					src={`${imagePath}/business-cards.webp`}
					alt="Maya Chen’s fictional paper business card."
					width={1448}
					height={1086}
					unoptimized
					preload
				/>
				<span>Business card</span>
			</div>
			<ArrowRight className={styles.artifactArrow} size={28} aria-hidden />
			<div className={styles.heroResult}>
				<picture>
					<source media="(max-width: 579px)" srcSet={`${imagePath}/contact-preview.webp`} width={514} height={175} />
					<Image
						src={`${imagePath}/contact-detail.webp`}
						alt="Maya Chen’s saved contact in the CardTuck app."
						width={540}
						height={422}
						unoptimized
						loading="eager"
					/>
				</picture>
				<span>Saved in CardTuck</span>
			</div>
		</figure>
	);
}

export function ReviewArtwork() {
	return (
		<figure className={styles.productFigure}>
			<div className={styles.proofMount}>
				<picture>
					<source media="(max-width: 579px)" srcSet={`${imagePath}/review-mobile.webp`} width={346} height={602} />
					<Image
						src={`${imagePath}/review-desktop.webp`}
						alt="A sample business card next to its editable contact fields."
						width={1048}
						height={652}
						unoptimized
					/>
				</picture>
			</div>
			<figcaption className={styles.proofNotes}>
				<span>
					<strong>Original card</strong> stays in view for comparison.
				</span>
				<span>
					<strong>Editable fields</strong> let you correct the details before saving.
				</span>
			</figcaption>
		</figure>
	);
}

export function CaptureArtwork() {
	return (
		<div className={styles.capture} aria-hidden="true">
			<Image src={`${imagePath}/sample-scan.webp`} alt="" fill unoptimized />
			<div className={styles.corners}>
				<i />
				<i />
				<i />
				<i />
			</div>
		</div>
	);
}

export function BatchArtwork() {
	return (
		<figure className={styles.productFigure}>
			<div className={styles.proofMount}>
				<picture>
					<source media="(max-width: 579px)" srcSet={`${imagePath}/batch-phone.webp`} width={348} height={719} />
					<Image
						src={`${imagePath}/batch-review.webp`}
						alt="CardTuck’s batch queue with a card that has both sides paired and another with only a front photo."
						width={1048}
						height={470}
						unoptimized
					/>
				</picture>
			</div>
			<figcaption className={styles.proofNotes}>
				<span>
					<strong>Two sides, one contact.</strong> Pair the photos before reading the card.
				</span>
				<span>
					<strong>Front-only cards</strong> can stay in the same queue.
				</span>
			</figcaption>
		</figure>
	);
}

export function PhotoOptionArtwork() {
	return (
		<figure className={styles.photoOption}>
			<Image
				src={`${imagePath}/review-photo-option.webp`}
				alt="The Review screen showing the unchecked Keep card photos with this contact field above the Save contact button."
				width={348}
				height={126}
				unoptimized
			/>
			<figcaption>The photo setting in Review, off by default.</figcaption>
		</figure>
	);
}
