import { z } from "zod";

export const maxCardPhotoBytes = 768 * 1024;
export const maxCardPhotoDimension = 1920;
const soi = 0xff;

export const cardSide = z.enum(["front", "back"]);
export type CardSide = z.infer<typeof cardSide>;

export const cardPhotoBase64 = z
  .string()
  .min(12)
  .max(Math.ceil(maxCardPhotoBytes / 3) * 4)
  .regex(/^[a-z0-9+/]+={0,2}$/i)
  .refine((value) => value.length % 4 === 0);

export const cardPhotoSchema = z.object({
  side: cardSide,
  imageBase64: cardPhotoBase64,
});

/** Only accept bounded JPEGs. Card photos never carry a caller-supplied MIME type. */
export function readCardJpeg(image: string): Buffer | undefined {
  const bytes = Buffer.from(image, "base64");
  if (
    bytes.length < 12 || bytes.length > maxCardPhotoBytes ||
    bytes[0] !== soi || bytes[1] !== 0xd8 ||
    bytes[bytes.length - 2] !== soi || bytes[bytes.length - 1] !== 0xd9
  ) return;
  let offset = 2;
  while (offset + 4 < bytes.length && bytes[offset] === soi) {
    while (bytes[offset] === soi) offset++;
    const marker = bytes[offset++];
    if (offset + 2 > bytes.length || marker === 0xda || marker === 0xd9) break;
    const size = bytes.readUInt16BE(offset);
    if (size < 2 || offset + size > bytes.length) break;
    if ([0xc0, 0xc1, 0xc2].includes(marker) && size >= 8) {
      const height = bytes.readUInt16BE(offset + 3);
      const width = bytes.readUInt16BE(offset + 5);
      if (height > 0 && width > 0 && Math.max(width, height) <= maxCardPhotoDimension) {
        return bytes;
      }
      break;
    }
    offset += size;
  }
}
