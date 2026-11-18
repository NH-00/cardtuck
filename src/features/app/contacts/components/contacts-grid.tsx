"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, ContactRound, ScanLine, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listProviders } from "@/features/app/providers/actions/list-providers.action";
import { listContactTags } from "@/features/app/tags/actions/list-contact-tags.action";
import { listTags } from "@/features/app/tags/actions/list-tags.action";
import { TagChipsFilter } from "@/features/app/tags/components/tag-chips-filter";
import { tagStyle } from "@/features/app/tags/tag-palette";
import { contactLabel, type ListedContact } from "../listed-contact";
import { ContactCard } from "./contact-card";

type Sort = "newest" | "oldest" | "name" | "company";

export function ContactsGrid({
	contacts,
	loading,
	failed,
	selectedId,
	setSelectedId,
	onScan,
	onManual,
	onAddressBooks,
}: {
	contacts: ListedContact[];
	loading: boolean;
	failed: boolean;
	selectedId?: number;
	setSelectedId: (id?: number) => void;
	onScan: () => void;
	onManual: () => void;
	onAddressBooks: () => void;
}) {
	const t = useTranslations("contacts.cardtuck");
	const old = useTranslations("contacts.card");
	const locale = useLocale();
	const queryClient = useQueryClient();
	const [search, setSearch] = useState("");
	const [sort, setSort] = useState<Sort>("newest");
	const [activeTags, setActiveTags] = useState<string[]>([]);
	const { data: providers = [] } = useQuery({
		queryKey: ["providers"],
		queryFn: async () => (await listProviders())?.data ?? [],
	});
	const { data: tags = [] } = useQuery({ queryKey: ["tags"], queryFn: async () => (await listTags())?.data ?? [] });
	const { data: tagged = [] } = useQuery({
		queryKey: ["contact-tags"],
		queryFn: async () => (await listContactTags())?.data ?? [],
	});
	const searchTerm = search.trim().toLocaleLowerCase(locale);
	const tagMap = new Map<number, string[]>();
	for (const { contactId, tagId } of tagged) {
		const current = tagMap.get(contactId) ?? [];
		current.push(tagId);
		tagMap.set(contactId, current);
	}

	const collator = new Intl.Collator(locale, { sensitivity: "base", numeric: true });
	const list = contacts
		.filter(
			(contact) =>
				(!searchTerm ||
					[contact.name, contact.company, contact.email].some((field) =>
						field.toLocaleLowerCase(locale).includes(searchTerm),
					)) &&
				(!activeTags.length || activeTags.some((tag) => tagMap.get(contact.id)?.includes(tag))),
		)
		.sort((a, b) => {
			if (sort === "name") return collator.compare(contactLabel(a), contactLabel(b)) || a.id - b.id;
			if (sort === "company") {
				return Number(!a.company) - Number(!b.company) || collator.compare(a.company, b.company) || a.id - b.id;
			}
			const delta = new Date(a.createdAt).valueOf() - new Date(b.createdAt).valueOf() || a.id - b.id;
			return sort === "oldest" ? delta : -delta;
		});
	const selected = contacts.find(({ id }) => id === selectedId);
	function invalidate() {
		for (const key of ["contacts", "tags", "contact-tags", "providers"])
			void queryClient.invalidateQueries({ queryKey: [key] });
	}

	return (
		<section className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<h1 className="ct-page-title">{t("title")}</h1>
				{contacts.length > 0 && (
					<Button className="min-h-11" onClick={onScan}>
						<ScanLine />
						{t("scanCard")}
					</Button>
				)}
			</div>
			{contacts.length > 0 && (
				<div className="ct-surface ct-contact-toolbar">
					<div className="ct-contact-search">
						<div className="relative min-w-0 flex-1">
							<Search
								className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
								aria-hidden="true"
							/>
							<Input
								type="search"
								aria-label={t("search")}
								placeholder={t("search")}
								className="h-11 bg-card pl-9"
								value={search}
								onChange={(event) => setSearch(event.target.value)}
							/>
						</div>
						<select
							aria-label={t("sort")}
							value={sort}
							onChange={(event) => setSort(event.target.value as Sort)}
							className="ct-sort min-h-11 rounded-lg border bg-card px-3 text-sm font-semibold"
						>
							{(["newest", "oldest", "name", "company"] as const).map((value) => (
								<option key={value} value={value}>
									{t(value)}
								</option>
							))}
						</select>
					</div>
					<TagChipsFilter tags={tags} selectedTagIds={activeTags} onChange={setActiveTags} onTagCreated={invalidate} />
				</div>
			)}
			{loading ? (
				<p role="status" className="text-muted-foreground">
					{t("loading")}
				</p>
			) : failed ? (
				<div className="space-y-2 rounded-xl border bg-card p-4">
					<p role="alert">{t("loadFailed")}</p>
					<Button variant="outline" onClick={invalidate}>
						{t("tryAgain")}
					</Button>
				</div>
			) : list.length ? (
				<div className="space-y-2">
					<p className="ct-count text-sm font-semibold text-muted-foreground" role="status">
						{t("count", { count: list.length })}
					</p>
					<div className="ct-surface overflow-hidden">
						<div
							className="hidden grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,.6fr)_minmax(4.5rem,.35fr)_2.75rem] gap-3 bg-muted px-4 py-3 text-xs font-semibold text-muted-foreground md:grid"
							aria-hidden="true"
						>
							<span>{t("nameLabel")}</span>
							<span>{t("email")}</span>
							<span>{t("tags")}</span>
							<span>{t("syncLabel")}</span>
						</div>
						<ul className="divide-y">
							{list.map((contact) => {
								const tagSet = tags.filter((tag) => tagMap.get(contact.id)?.includes(tag.id));
								const name = contactLabel(contact);
								const initials = name
									.trim()
									.split(/\s+/)
									.slice(0, 2)
									.map((word) => word[0])
									.join("")
									.toUpperCase();
								const chips = tagSet.slice(0, 2).map((tag) => (
									<span
										key={tag.id}
										className="max-w-full truncate rounded-md px-2 py-1 text-xs font-semibold"
										style={tagStyle(tag.color)}
									>
										{tag.name}
									</span>
								));
								return (
									<li
										key={contact.id}
										className="grid grid-cols-[minmax(0,1fr)_2.75rem] items-center gap-3 px-3 py-2.5 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,.6fr)_minmax(4.5rem,.35fr)_2.75rem] md:px-4"
									>
										<button
											type="button"
											className="flex min-h-11 min-w-0 items-center gap-3 rounded-md text-left focus-visible:outline-2 focus-visible:outline-ring"
											onClick={() => setSelectedId(contact.id)}
										>
											<span className="ct-contact-avatar grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold">
												{initials}
											</span>
											<span className="min-w-0 space-y-0.5">
												<span className="block truncate font-semibold">{name}</span>
												{contact.company && contact.company !== name && (
													<span className="block truncate text-sm text-muted-foreground">{contact.company}</span>
												)}
												<span className="flex flex-wrap gap-1 md:hidden">{chips}</span>
											</span>
										</button>
										<span className="hidden truncate text-sm text-muted-foreground md:block">
											{contact.email || "—"}
										</span>
										<span className="hidden flex-wrap gap-1 md:flex">{chips}</span>
										<span className="hidden text-xs font-semibold text-primary md:block">
											{contact.syncedAt ? old("synced_label") : "—"}
										</span>
										<Button
											variant="ghost"
											size="icon"
											aria-label={t("actions", { name })}
											onClick={() => setSelectedId(contact.id)}
										>
											<ArrowUpRight />
										</Button>
									</li>
								);
							})}
						</ul>
					</div>
				</div>
			) : (
				<div className="ct-surface max-w-xl space-y-3 p-5 sm:p-7">
					<span className="grid size-11 place-items-center rounded-lg bg-accent">
						{contacts.length ? <Search /> : <ContactRound />}
					</span>
					<h2 className="ct-empty-title">{contacts.length ? t("noMatches") : t("empty")}</h2>
					<p className="text-muted-foreground">{contacts.length ? t("noMatchesHelp") : t("emptyHelp")}</p>
					{contacts.length ? (
						<Button
							variant="outline"
							onClick={() => {
								setActiveTags([]);
								setSearch("");
							}}
						>
							{t("clearFilters")}
						</Button>
					) : (
						<div className="flex flex-wrap gap-2">
							<Button onClick={onScan}>
								<ScanLine />
								{t("scanCard")}
							</Button>
							<Button variant="ghost" onClick={onManual}>
								{t("addManually")}
							</Button>
						</div>
					)}
				</div>
			)}
			{selected && (
				<ContactCard
					key={selected.id}
					contact={selected}
					providers={providers}
					tags={tags}
					assignedTagIds={tagMap.get(selected.id) ?? []}
					onMutated={invalidate}
					onClose={() => setSelectedId(undefined)}
					onAddressBooks={onAddressBooks}
				/>
			)}
		</section>
	);
}
