export type UploadKind = "image";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function resolveUploadKind(mimeType: string): UploadKind | null {
  if (IMAGE_TYPES.has(mimeType)) return "image";
  return null;
}

export function maxBytesForKind(_kind: UploadKind): number {
  return 10 * 1024 * 1024;
}
