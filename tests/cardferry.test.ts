import assert from "node:assert/strict";
import { test } from "node:test";
import { cardPhotoBase64, maxCardPhotoBytes, readCardJpeg } from "../src/features/app/scanner/card-photos";
import { mergeCardSides } from "../src/features/app/scanner/merge-card-sides";
import { emptyContact } from "../src/lib/types";
import { generateVCard } from "../src/lib/vcf";

// Representative JPEG header with a baseline frame and the specified dimensions.
function frame(width: number, height: number) {
  return Buffer.from([
    0xff, 0xd8, 0xff, 0xc0, 0, 11, 8, height >> 8, height & 255,
    width >> 8, width & 255, 1, 1, 0x11, 0, 0xff, 0xd9,
  ]);
}

test("photo input permits bounded JPEG dimensions and rejects other formats", () => {
  const jpeg = frame(1200, 900);
  const raw = jpeg.toString("base64");
  assert.equal(cardPhotoBase64.safeParse(raw).success, true);
  assert.deepEqual(readCardJpeg(raw), jpeg);
  assert.equal(readCardJpeg(frame(4096, 900).toString("base64")), undefined);
  assert.equal(readCardJpeg(frame(0, 900).toString("base64")), undefined);
  assert.equal(readCardJpeg(jpeg.subarray(0, -2).toString("base64")), undefined);
  assert.equal(readCardJpeg(Buffer.from("<svg>not a photo</svg>").toString("base64")), undefined);
  assert.equal(cardPhotoBase64.safeParse(Buffer.alloc(maxCardPhotoBytes + 4).toString("base64")).success, false);
});

test("the reverse supplies missing details and conflicts remain visible", () => {
  const front = { ...emptyContact(), name: "Maya Chen", phone: "+1 604 555 0142", email: "maya@tidemark.example" };
  const back = { ...emptyContact(), website: "tidemark.example", phone: "+16045550142", email: "studio@tidemark.example" };
  const { contact, conflicts } = mergeCardSides(front, back);
  assert.equal(contact.name, "Maya Chen");
  assert.equal(contact.website, "tidemark.example");
  assert.deepEqual(conflicts, { email: "studio@tidemark.example" });
  assert.deepEqual(mergeCardSides(undefined, back).contact, back);
});

test("vCard output has contact fields and tags, and escapes embedded line breaks", () => {
  const contact = { ...emptyContact(), name: "Example\rNOTE:second line", website: "example.test", photos: ["private"] };
  const card = generateVCard(contact, ["Design Week"]);
  assert.match(card, /FN:Example\\nNOTE:second line/);
  assert.match(card, /URL:example\.test/);
  assert.match(card, /CATEGORIES:Design Week/);
  assert.doesNotMatch(card, /PHOTO|private/);
});
