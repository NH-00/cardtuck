import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import styles from "../website.module.css";
import { ReadingPage } from "../website-chrome";

const title = "Run CardTuck yourself";
const intro = "Start on your own computer, try a contact export, then add a card reader or host it on a server.";
const links = [
	{ id: "source", title: "Get the source" },
	{ id: "local", title: "Run locally" },
	{ id: "reader", title: "Read business cards" },
	{ id: "server", title: "Deploy on a server" },
];

export const metadata: Metadata = { title, description: intro };

export default function SelfHostPage() {
	return (
		<ReadingPage path="/self-host" title={title} intro={intro} links={links}>
			<section id="source" className={styles.readingSection}>
				<h2>Get the source</h2>
				<p>
					Get CardTuck from GitHub. Choose <strong>Code → Download ZIP</strong> and extract it, or clone the repository.
				</p>
				<a href="https://github.com/NH-00/cardtuck-public">CardTuck on GitHub</a>
				<p>If you have a source ZIP, open a terminal in the extracted folder.</p>
			</section>
			<section id="local" className={styles.readingSection}>
				<h2>Run locally</h2>
				<p>
					Install <a href="https://nodejs.org/en/download">Node.js 24 LTS</a>. In a new copy, run these commands from a
					macOS or Linux shell, or WSL on Windows.
				</p>
				<pre className={styles.setupCode}>
					<code>{`npm exec --yes --package pnpm@11.0.8 -- pnpm install --frozen-lockfile
cp .env.example .env
printf '\\nAPP_SECRET=%s\\n' "$(openssl rand -hex 32)" >> .env`}</code>
				</pre>
				<p>
					In <code>.env</code>, set <code>VISION_PROVIDER=ollama</code>. Then start the app.
				</p>
				<pre className={styles.setupCode}>
					<code>npm exec --yes --package pnpm@11.0.8 -- pnpm dev</code>
				</pre>
				<p>
					Open <code>http://127.0.0.1:3000</code> and request a sign-in link. Local development prints the sign-in URL
					in the terminal if SMTP is unset. Under Scan, choose <strong>Enter contact manually</strong> to try a contact
					without a reader.
				</p>
				<Link href="/compatibility#apple" className={styles.textLink}>
					Send a contact to Apple Contacts <ArrowRight size={16} aria-hidden />
				</Link>
			</section>
			<section id="reader" className={styles.readingSection}>
				<h2>Read business cards</h2>
				<p>
					For local scans, start <a href="https://ollama.com/download">Ollama</a> and run{" "}
					<code>ollama pull llama3.2-vision</code>. In <code>.env</code>, use <code>VISION_PROVIDER=ollama</code> and{" "}
					<code>OLLAMA_MODEL=llama3.2-vision</code>, then restart CardTuck. This route uses your computer’s resources
					and requires no paid API key.
				</p>
			</section>
			<section id="server" className={styles.readingSection}>
				<h2>Deploy on a server</h2>
				<p>
					The README in the source folder covers Docker Compose, PostgreSQL, sign-in email, and HTTPS. Set the public
					URL and limit sign-in to your intended users before exposing the instance.
				</p>
			</section>
		</ReadingPage>
	);
}
