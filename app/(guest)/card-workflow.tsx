"use client";

import { ArrowRight, Check, Contact, Download, FileText } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { downloadVCard, vcfFileName } from "@/lib/vcf";
import { CaptureArtwork } from "./card-illustration";
import { sampleContact } from "./sample-contact";
import copy from "./site-copy.json";
import styles from "./website.module.css";

const fields = [
	{ key: "name", label: "Name", type: "text" },
	{ key: "company", label: "Company", type: "text" },
	{ key: "email", label: "Email", type: "email" },
] as const;

type Stage = 0 | 1 | 2;

export function CardWorkflow() {
	const [stage, setStage] = useState<Stage>(0);
	const [contact, setContact] = useState(sampleContact);
	const heading = useRef<HTMLHeadingElement>(null);
	const previousStage = useRef<Stage>(0);
	const current = copy.steps[stage];

	useEffect(() => {
		if (previousStage.current !== stage) {
			heading.current?.focus();
			previousStage.current = stage;
		}
	}, [stage]);

	function saveContact(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const name = contact.name.trim();
		const [firstname, ...surname] = name.split(/\s+/);
		setContact({ ...contact, name, firstname, lastname: surname.join(" "), company: contact.company.trim() });
		setStage(2);
	}

	function restart() {
		setContact(sampleContact);
		setStage(0);
	}

	const content = (
		<>
			<div className={styles.stepCopy}>
				<h3 ref={heading} tabIndex={-1}>
					{current.title}
				</h3>
				<p>{current.description}</p>
			</div>
			<div className={styles.stepArt}>
				{stage === 0 && <CaptureArtwork />}
				{stage === 1 && (
					<div className={styles.review}>
						<div className={styles.reviewHeader}>
							<span className={styles.badge}>
								<Contact size={20} aria-hidden />
							</span>
							<span>Review sample contact</span>
						</div>
						<div className={styles.fields}>
							{fields.map(({ key, label, type }) => (
								<label key={key}>
									<span>{label}</span>
									<input
										type={type}
										value={contact[key]}
										required={key === "name"}
										pattern={key === "name" ? ".*\\S.*" : undefined}
										onChange={(event) => setContact({ ...contact, [key]: event.target.value })}
									/>
								</label>
							))}
						</div>
					</div>
				)}
				{stage === 2 && (
					<div className={styles.saved}>
						<div className={styles.successMark}>
							<Check size={25} aria-hidden />
						</div>
						<div>
							<div className={styles.savedTitle}>Sample contact ready</div>
							<div className={styles.savedDetails}>{contact.name}</div>
						</div>
						<div className={styles.fileChip}>
							<FileText size={17} aria-hidden />
							{vcfFileName(contact)}
						</div>
					</div>
				)}
			</div>
			<div className={styles.stepActions}>
				{stage === 0 && (
					<button className={`${styles.action} ${styles.primary}`} type="button" onClick={() => setStage(1)}>
						{current.action} <ArrowRight size={17} aria-hidden />
					</button>
				)}
				{stage === 1 && (
					<>
						<button className={`${styles.action} ${styles.primary}`} type="submit">
							{current.action} <ArrowRight size={17} aria-hidden />
						</button>
						<button className={styles.textLink} type="button" onClick={() => setStage(0)}>
							Back
						</button>
					</>
				)}
				{stage === 2 && (
					<>
						<button
							className={`${styles.action} ${styles.primary}`}
							type="button"
							onClick={() => downloadVCard(contact)}
						>
							{current.action} <Download size={17} aria-hidden />
						</button>
						<button className={styles.textLink} type="button" onClick={restart}>
							Start over
						</button>
					</>
				)}
			</div>
		</>
	);

	return (
		<div className={styles.workflowCard}>
			<ol className={styles.steps} aria-label="Sample scan progress">
				{copy.steps.map(({ label }, index) => (
					<li className={styles.step} key={label} aria-current={index === stage ? "step" : undefined}>
						<span className={styles.stepNumber} aria-hidden>
							{index + 1}
						</span>
						{label}
					</li>
				))}
			</ol>
			{stage === 1 ? (
				<form className={styles.stepPanel} onSubmit={saveContact} autoComplete="off">
					{content}
				</form>
			) : (
				<div className={styles.stepPanel}>{content}</div>
			)}
		</div>
	);
}
