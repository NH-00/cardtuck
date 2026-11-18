import { maxCardPhotoBytes, maxCardPhotoDimension } from "./card-photos";

export type CaptureImage = { name: string; imageBase64: string };

export function previewOf(image: CaptureImage) {
  return `data:image/jpeg;base64,${image.imageBase64}`;
}

export function encodeCard(source: CanvasImageSource, width: number, height: number, name: string): CaptureImage {
  if (!width || !height) throw new Error("Empty image");
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, maxCardPhotoDimension / Math.max(width, height));
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No canvas context");
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  for (const quality of [0.87, 0.73, 0.56, 0.4]) {
    const imageBase64 = canvas.toDataURL("image/jpeg", quality).split(",")[1];
    if (imageBase64 && Math.ceil(imageBase64.length * 3 / 4) <= maxCardPhotoBytes) {
      return { name, imageBase64 };
    }
  }
  throw new Error("Image too large");
}

export async function prepareCardImage(file: File): Promise<CaptureImage> {
  if (
    file.size > 24 * 1024 * 1024 ||
    !(/^(image\/(jpe?g|png|webp|heic|heif))$/i.test(file.type) || (!file.type && /\.(jpe?g|png|webp|hei[cf])$/i.test(file.name)))
  ) throw new Error("Unsupported image");

  // Use the browser decoder's EXIF orientation, including Safari's file picker conversions.
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return encodeCard(image, image.naturalWidth, image.naturalHeight, file.name);
  } finally {
    URL.revokeObjectURL(url);
  }
}
