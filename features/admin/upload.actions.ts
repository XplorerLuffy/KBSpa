"use server";

import { createClient } from "@/lib/supabase/server";
import { buildObjectPath, checkUpload } from "@/features/admin/upload.validation";

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

const BUCKET = "media";

/**
 * Uploads one admin-supplied image/video and returns its public URL.
 *
 * Storage RLS already restricts writes to admins; the check is repeated here so
 * an unauthorised call fails with a clear message rather than a raw storage
 * error. Type and size are validated server-side too — the file input's
 * `accept` attribute is a convenience, not a control.
 */
export async function uploadMedia(formData: FormData): Promise<UploadResult> {
  const supabase = await createClient();

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) return { ok: false, error: "Not authorised to upload." };

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "No file was selected." };
  }

  const check = checkUpload(file.type, file.size);
  if (!check.ok) return check;

  const path = buildObjectPath(String(formData.get("folder") ?? ""), check.extension);

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) return { ok: false, error: "Upload failed. Please try again." };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
