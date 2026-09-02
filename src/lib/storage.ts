import { supabase } from "@/integrations/supabase/client";

export const VEHICLE_BUCKET = "vehicle-images";

/** ~10 years, so stored URLs stay valid for the life of the listing. */
const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 10;

const extensionOf = (name: string) => {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "jpg";
};

/**
 * Uploads one image to Cloud storage and returns a long-lived URL that can be
 * stored in the database and rendered directly in an <img> tag.
 */
export async function uploadVehicleImage(file: File, folder = "vehicles"): Promise<string> {
  const path = `${folder}/${crypto.randomUUID()}.${extensionOf(file.name)}`;
  const { error } = await supabase.storage.from(VEHICLE_BUCKET).upload(path, file, {
    cacheControl: "31536000",
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
