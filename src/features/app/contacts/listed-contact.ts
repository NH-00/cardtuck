import type { Contact } from "@/db/schemas/contacts";

export type ListedContact = Omit<Contact, "captureId" | "imageUrl"> & {
  hasFront: boolean;
  hasBack: boolean;
};

export function contactLabel(contact: ListedContact) {
  return contact.name || contact.company || contact.email || contact.phone || contact.website || "—";
}
