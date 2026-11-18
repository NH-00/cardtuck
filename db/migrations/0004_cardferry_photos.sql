CREATE TABLE "contact_card_photos" (
	"contact_id" integer NOT NULL,
	"side" text NOT NULL,
	"jpeg_base64" text NOT NULL,
	CONSTRAINT "contact_card_photos_contact_id_side_pk" PRIMARY KEY("contact_id","side")
);
--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "capture_id" uuid;--> statement-breakpoint
ALTER TABLE "contact_card_photos" ADD CONSTRAINT "contact_card_photos_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "contacts_user_capture_unique" ON "contacts" USING btree ("user_id","capture_id");