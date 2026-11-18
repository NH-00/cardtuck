import { Metadata } from "next";
import { env } from "@/env";
import { AppTabs } from "@/features/app/layouts/app-tabs";

export const metadata: Metadata = { title: "Scan and contacts" };

export default async function App() {
	return <AppTabs readCardPairsTogether={env.VISION_PROVIDER === "openai"} />;
}
