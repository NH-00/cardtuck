"use client";

import { BookOpen, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useTransition } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import authClient from "@/lib/auth/client";

export function AppHeader({ children, onAddressBooks }: { children: ReactNode; onAddressBooks: () => void }) {
	const t = useTranslations("app.header");
	const { data: session } = authClient.useSession();
	const [isPending, startTransition] = useTransition();

	const name = session?.user.name ?? "";
	const email = session?.user.email ?? "";
	const initials = name
		? name
				.split(" ")
				.map((n: string) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2)
		: email.slice(0, 2).toUpperCase();
	const avatarInitials = initials || "CT";

	const handleSignOut = () => {
		startTransition(async () => {
			try {
				const result = await authClient.signOut();
				if (result.error) throw new Error("Sign out failed.");
				window.location.replace("/portal");
			} catch (error) {
				console.error("Sign out failed:", error);
			}
		});
	};

	return (
		<header className="ct-app-header sticky top-0 z-40 grid grid-cols-[1fr_auto] items-center gap-x-3 border-b bg-card px-4 py-2 sm:grid-cols-[1fr_auto_1fr] sm:px-8">
			<Image
				width={145}
				height={36}
				src="/assets/logo.svg?v=2"
				alt="CardTuck"
				className="col-start-1 row-start-1 h-9 w-auto"
			/>

			<div className="col-span-2 row-start-2 pt-2 sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:pt-0">{children}</div>
			<div className="col-start-2 row-start-1 justify-self-end sm:col-start-3">
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<button
								type="button"
								aria-label={`${avatarInitials}, ${t("account")}`}
								className="flex min-h-11 items-center gap-1 rounded-lg text-xs font-bold focus-visible:ring-2 focus-visible:ring-ring"
							/>
						}
					>
						<span className="grid size-[34px] place-items-center rounded-full bg-secondary text-secondary-foreground">
							{avatarInitials}
						</span>
						<ChevronDown size={15} />
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-48">
						{email && (
							<>
								<div className="px-2 py-1.5 text-xs text-muted-foreground truncate">{email}</div>
								<DropdownMenuSeparator />
							</>
						)}
						<DropdownMenuItem onClick={onAddressBooks}>
							<BookOpen />
							{t("address_books")}
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={handleSignOut}
							disabled={isPending}
							className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
						>
							{isPending ? "…" : t("sign_out")}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}
