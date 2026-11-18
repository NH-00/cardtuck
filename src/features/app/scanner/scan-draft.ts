import type { ContactData } from "@/lib/types";
import type { CardSide } from "./card-photos";
import type { CaptureImage } from "./capture-image";

export type ScanDraft = {
  id: string;
  order: number;
  front?: CaptureImage;
  back?: CaptureImage;
  status: "pending" | "reading" | "ready" | "failed" | "saved" | "skipped";
  contact?: ContactData;
  conflicts?: Partial<Record<keyof ContactData, string>>;
  failedSides?: CardSide[];
  savedId?: number;
};
