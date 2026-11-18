"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ContactRound, ScanLine } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listContacts } from "@/features/app/contacts/actions/list-contacts.action";
import { ContactsGrid } from "@/features/app/contacts/components/contacts-grid";
import { listProviders } from "@/features/app/providers/actions/list-providers.action";
import { ProvidersManager } from "@/features/app/providers/components/providers-manager";
import { ScannerWizard } from "@/features/app/scanner/components/scanner-wizard";
import { AppHeader } from "./app-header";

export function AppTabs({ readCardPairsTogether }: { readCardPairsTogether: boolean }) {
	const t = useTranslations("app.tabs");
	const ui = useTranslations("app.address_books");
	const query = useQueryClient();
	const [tab, setTab] = useState<"scanner" | "contacts">("scanner");
	const [addressBooks, setAddressBooks] = useState(false);
	const [manualRequest, setManualRequest] = useState(0);
	const [selectedId, setSelectedId] = useState<number>();
	const contacts = useQuery({
		queryKey: ["contacts"],
		queryFn: async () => {
			const response = await listContacts();
			if (!response?.data) throw new Error("Contact list unavailable");
			return response.data;
		},
	});
	const { data: providers = [] } = useQuery({
		queryKey: ["providers"],
		queryFn: async () => (await listProviders())?.data ?? [],
		enabled: addressBooks,
	});

	function openBooks() {
		setSelectedId(undefined);
		setAddressBooks(true);
	}

	return (
		<Tabs
			value={tab}
			onValueChange={(value) => {
				if (value === "scanner" || value === "contacts") setTab(value);
				setAddressBooks(false);
			}}
			className="ct-workspace min-h-dvh gap-0"
		>
			<AppHeader onAddressBooks={openBooks}>
				<TabsList className="ct-app-tabs h-auto group-data-horizontal/tabs:h-auto">
					<TabsTrigger
						value="scanner"
						onClick={() => setAddressBooks(false)}
						className="min-h-11 gap-2 rounded-lg px-3 text-muted-foreground data-active:bg-secondary data-active:text-primary data-active:shadow-none after:hidden"
					>
						<ScanLine size={17} />
						{t("scanner")}
					</TabsTrigger>
					<TabsTrigger
						value="contacts"
						onClick={() => setAddressBooks(false)}
						className="min-h-11 gap-2 rounded-lg px-3 text-muted-foreground data-active:bg-secondary data-active:text-primary data-active:shadow-none after:hidden"
					>
						<ContactRound size={17} />
						{t("contacts")}
					</TabsTrigger>
				</TabsList>
			</AppHeader>
			<main className="ct-app-main mx-auto w-full">
				{addressBooks && (
					<section className="space-y-4">
						<Button variant="ghost" onClick={() => setAddressBooks(false)}>
							{ui("back")}
						</Button>
						<h1 className="ct-page-title">{ui("title")}</h1>
						<p className="text-muted-foreground">{ui("description")}</p>
						<div className="rounded-xl border bg-card p-4">
							<ProvidersManager
								providers={providers}
								onMutated={() => {
									void query.invalidateQueries({ queryKey: ["providers"] });
									void query.invalidateQueries({ queryKey: ["contacts"] });
								}}
							/>
						</div>
					</section>
				)}
				<div hidden={addressBooks}>
					<TabsContent value="scanner" keepMounted>
						<ScannerWizard
							manualRequest={manualRequest}
							active={tab === "scanner" && !addressBooks}
							readCardPairsTogether={readCardPairsTogether}
							onViewContact={(id) => {
								setSelectedId(id);
								setTab("contacts");
							}}
						/>
					</TabsContent>
					<TabsContent value="contacts" keepMounted>
						<ContactsGrid
							contacts={contacts.data ?? []}
							loading={contacts.isPending}
							failed={contacts.isError}
							selectedId={selectedId}
							setSelectedId={setSelectedId}
							onScan={() => setTab("scanner")}
							onManual={() => {
								setManualRequest((value) => value + 1);
								setTab("scanner");
							}}
							onAddressBooks={openBooks}
						/>
					</TabsContent>
				</div>
			</main>
		</Tabs>
	);
}
