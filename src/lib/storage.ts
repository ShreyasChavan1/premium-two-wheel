import { supabase } from "@/integrations/supabase/client";

export const VEHICLE_BUCKET = "vehicle-images";

/** ~10 years, so stored URLs stay valid for the life of the listing. */
const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 10;

const extensionOf = (name: string) => {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "jpg";
};

/** Largest stored width; taller/wider originals are scaled down proportionally. */
const MAX_WIDTH = 1600;
const WEBP_QUALITY = 0.82;

const supportsWebp = () => {
  try {
    return document
      .createElement("canvas")
      .toDataURL("image/webp")
      .startsWith("data:image/webp");
  } catch {
    return false;
  }
};

/**
 * Resizes to at most MAX_WIDTH and re-encodes as WebP. Falls back to the
 * original file whenever the browser can't decode/encode it (e.g. SVG, HEIC).
 */
async function optimiseImage(file: File): Promise<{ blob: Blob; extension: string }> {
  const fallback = { blob: file, extension: extensionOf(file.name) };
  if (typeof document === "undefined" || !file.type.startsWith("image/")) return fallback;
  if (file.type === "image/svg+xml" || file.type === "image/gif" || !supportsWebp()) return fallback;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_WIDTH / bitmap.width);
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return fallback;
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", WEBP_QUALITY),
    );
    if (!blob || blob.size === 0) return fallback;
    return { blob, extension: "webp" };
  } catch {
    return fallback;
  }
}

/**
 * Uploads one image to Cloud storage and returns a long-lived URL that can be
 * stored in the database and rendered directly in an <img> tag.
 */
export async function uploadVehicleImage(file: File, folder = "vehicles"): Promise<string> {
  const { blob, extension } = await optimiseImage(file);
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(VEHICLE_BUCKET).upload(path, blob, {
    cacheControl: "31536000",
    contentType: blob.type || file.type || "image/webp",
    upsert: false,
  });
  if (error) throw new Error(error.message);

  const { data, error: signError } = await supabase.storage
    .from(VEHICLE_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (signError || !data) throw new Error(signError?.message ?? "Could not create image URL");
  return data.signedUrl;
}


export async function uploadVehicleImages(files: File[], folder = "vehicles"): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) urls.push(await uploadVehicleImage(file, folder));
  return urls;
}
