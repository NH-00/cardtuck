import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./auth.module.css";

export function AuthLayout({ children }: { children: ReactNode }) {
	return (
		<div className={styles.layout}>
			<div className={styles.form}>{children}</div>
			<aside className={styles.details}>
				<h2>Try a card first.</h2>
				<p>Review a fictional contact and download it to see how the export works.</p>
				<Link href="/#how-it-works">
					Try the sample <ArrowRight size={16} aria-hidden />
				</Link>
			</aside>
		</div>
	);
}
