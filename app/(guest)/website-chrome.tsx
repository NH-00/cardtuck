import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./website.module.css";

const infoLinks = [
	{ href: "/compatibility", label: "Compatibility" },
	{ href: "/scan-guide", label: "Scan guide" },
	{ href: "/photo-privacy", label: "Photo privacy" },
	{ href: "/privacy", label: "Privacy policy" },
	{ href: "/contact", label: "Contact" },
	{ href: "/self-host", label: "Source & setup" },
];

function Wordmark() {
	return (
		<Link className={styles.wordmark} href="/" aria-label="CardTuck home">
			<Image src="/assets/icon.svg" alt="" width={30} height={30} />
			<span>CardTuck</span>
		</Link>
	);
}

export function SiteFrame({ children, active }: { children: ReactNode; active?: string }) {
	return (
		<div className={styles.site}>
			<a className={styles.skip} href="#main-content">
				Skip to content
			</a>
			<header className={styles.header}>
				<nav className={`${styles.rail} ${styles.nav}`} aria-label="Main">
					<Wordmark />
					<div className={styles.navLinks}>
						{infoLinks.slice(0, 2).map(({ href, label }) => (
							<Link
								className={styles.navPage}
								href={href}
								key={href}
								aria-current={active === href ? "page" : undefined}
							>
								{label}
							</Link>
						))}
						<Link
							href="/portal"
							aria-current={active === "/portal" ? "page" : undefined}
							className={`${styles.action} ${styles.signIn}`}
						>
							Sign in
						</Link>
					</div>
				</nav>
			</header>
			<main id="main-content">{children}</main>
			<footer className={styles.footer}>
				<nav className={`${styles.rail} ${styles.footerNav}`} aria-label="Footer">
					<Wordmark />
					<div className={styles.footerLinks}>
						{infoLinks.map(({ href, label }) => (
							<Link href={href} key={href} aria-current={active === href ? "page" : undefined}>
								{label}
							</Link>
						))}
					</div>
					<Link className={`${styles.action} ${styles.light}`} href="/portal">
						Open CardTuck <ArrowRight size={16} aria-hidden />
					</Link>
				</nav>
			</footer>
		</div>
	);
}

export function ReadingPage({
	path,
	title,
	intro,
	links,
	children,
}: {
	path: string;
	title: string;
	intro: string;
	links: { id: string; title: string }[];
	children: ReactNode;
}) {
	return (
		<SiteFrame active={path}>
			<header className={styles.readingHeader}>
				<div className={styles.rail}>
					<h1 className={styles.display}>{title}</h1>
					<p>{intro}</p>
				</div>
			</header>
			<div className={`${styles.rail} ${styles.readingLayout}`}>
				<nav className={styles.pageLinks} aria-label="On this page">
					<p>On this page</p>
					{links.map(({ id, title }) => (
						<a key={id} href={`#${id}`}>
							{title}
						</a>
					))}
				</nav>
				<article className={styles.readingArticle}>{children}</article>
			</div>
		</SiteFrame>
	);
}
