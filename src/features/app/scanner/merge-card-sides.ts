import { type ContactData, emptyContact } from "@/lib/types";

function comparable(key: keyof ContactData, value: string) {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, " ");
  if (key === "phone") return normalized.replace(/[\s().-]/g, "");
  if (key === "website") return normalized.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return normalized;
}

export function mergeCardSides(front?: ContactData, back?: ContactData) {
  const contact = emptyContact();
  const conflicts: Partial<Record<keyof ContactData, string>> = {};
  for (const key of Object.keys(contact) as Array<keyof ContactData>) {
    const first = front?.[key]?.trim() ?? "";
    const second = back?.[key]?.trim() ?? "";
    contact[key] = first || second;
    if (first && second && comparable(key, first) !== comparable(key, second)) {
      conflicts[key] = second;
    }
  }
  return { contact, conflicts };
}
